import { SOCKET_EVENTS } from '@loop/shared/socketEvents';
import { Loop } from '../../models/Loop.js';
import { logger } from '../../logger.js';

export function registerRoomHandlers(namespace, socket, roomPresence) {
  const user = socket.data.user;

  /**
   * Client explicitly joins a loop room (e.g. after newly joining a loop)
   */
  socket.on(SOCKET_EVENTS.CLIENT_LOOP_JOIN, async ({ loopId }, callback) => {
    try {
      if (!loopId) return;

      const loop = await Loop.findById(loopId);
      if (!loop) {
        if (typeof callback === 'function') callback({ success: false, message: 'Loop not found' });
        return;
      }

      const isMember = loop.members.some(m => m.userId.toString() === user._id.toString());
      if (!isMember) {
        if (typeof callback === 'function') callback({ success: false, message: 'Unauthorized' });
        return;
      }

      const roomName = `loop:${loopId}`;
      socket.join(roomName);

      if (!roomPresence.has(roomName)) {
        roomPresence.set(roomName, new Set());
      }
      roomPresence.get(roomName).add(user._id.toString());

      namespace.to(roomName).emit(SOCKET_EVENTS.SERVER_PRESENCE_UPDATE, {
        loopId,
        onlineUserIds: Array.from(roomPresence.get(roomName))
      });

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      logger.error({ err }, 'Error in client loop:join');
    }
  });

  /**
   * Client leaves a loop room
   */
  socket.on(SOCKET_EVENTS.CLIENT_LOOP_LEAVE, ({ loopId }, callback) => {
    try {
      if (!loopId) return;
      const roomName = `loop:${loopId}`;
      socket.leave(roomName);

      if (roomPresence.has(roomName)) {
        roomPresence.get(roomName).delete(user._id.toString());
        namespace.to(roomName).emit(SOCKET_EVENTS.SERVER_PRESENCE_UPDATE, {
          loopId,
          onlineUserIds: Array.from(roomPresence.get(roomName))
        });
      }

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      logger.error({ err }, 'Error in client loop:leave');
    }
  });
}
