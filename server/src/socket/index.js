import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { env } from '../config/env.js';
import { createRedisClientsForSocket } from '../config/redis.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { Loop } from '../models/Loop.js';
import { logger } from '../logger.js';
import { registerCheckInHandlers } from './handlers/checkInHandler.js';
import { registerNudgeHandlers } from './handlers/nudgeHandler.js';
import { registerRoomHandlers } from './handlers/roomHandler.js';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';

export function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin === env.CLIENT_ORIGIN || env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(new Error('Blocked by CORS on socket handshake'));
        }
      },
      credentials: true
    },
    // Heartbeat configuration
    pingTimeout: 30000,
    pingInterval: 25000
  });

  // Attach Redis adapter for horizontal scaling if in production or Redis is available
  try {
    const { pubClient, subClient } = createRedisClientsForSocket();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Attached Redis adapter to Socket.io for multi-instance scaling');
  } catch (err) {
    logger.warn({ err }, 'Running Socket.io in single-instance memory adapter mode');
  }

  // Namespace: /loops
  const loopNamespace = io.of('/loops');

  // Socket Authentication Middleware
  loopNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication required for real-time access.'));
      }

      let decoded;
      try {
        decoded = verifyAccessToken(token);
      } catch (err) {
        return next(new Error('Session expired. Please sign in again.'));
      }

      const user = await User.findById(decoded.userId).select('name email preferences');
      if (!user) {
        return next(new Error('User account not found.'));
      }

      // Attach user to socket
      socket.data.user = user;
      next();
    } catch (err) {
      logger.error({ err }, 'Socket authentication error');
      next(new Error('Authentication failed'));
    }
  });

  // Track online members per loop room: loopId -> Set(userId)
  const roomPresence = new Map();

  loopNamespace.on('connection', async (socket) => {
    const user = socket.data.user;
    logger.info({ userId: user._id, socketId: socket.id }, 'User connected to /loops socket namespace');

    // Auto-join rooms for all loops this user is a member of
    try {
      const userLoops = await Loop.find({ 'members.userId': user._id }).select('_id');
      for (const loop of userLoops) {
        const roomName = `loop:${loop._id}`;
        socket.join(roomName);

        if (!roomPresence.has(roomName)) {
          roomPresence.set(roomName, new Set());
        }
        roomPresence.get(roomName).add(user._id.toString());

        // Emit presence update to room
        loopNamespace.to(roomName).emit(SOCKET_EVENTS.SERVER_PRESENCE_UPDATE, {
          loopId: loop._id.toString(),
          onlineUserIds: Array.from(roomPresence.get(roomName))
        });
      }
    } catch (err) {
      logger.error({ err, userId: user._id }, 'Error auto-joining loop rooms');
    }

    // Register modular event handlers
    registerCheckInHandlers(loopNamespace, socket);
    registerNudgeHandlers(loopNamespace, socket);
    registerRoomHandlers(loopNamespace, socket, roomPresence);

    socket.on('disconnect', () => {
      logger.info({ userId: user._id, socketId: socket.id }, 'User disconnected from socket');
      // Update presence
      for (const [roomName, usersSet] of roomPresence.entries()) {
        if (usersSet.has(user._id.toString())) {
          usersSet.delete(user._id.toString());
          const loopId = roomName.replace('loop:', '');
          loopNamespace.to(roomName).emit(SOCKET_EVENTS.SERVER_PRESENCE_UPDATE, {
            loopId,
            onlineUserIds: Array.from(usersSet)
          });
        }
      }
    });
  });

  return { io, loopNamespace };
}
