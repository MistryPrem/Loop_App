import { Nudge } from '../../models/Nudge.js';
import { Loop } from '../../models/Loop.js';
import { LoopItem } from '../../models/LoopItem.js';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';
import { logger } from '../../logger.js';

// Simple in-memory rate limiter to prevent nudge spamming (e.g. 5 nudges per minute per user)
const userNudgeTimestamps = new Map();

export function registerNudgeHandlers(namespace, socket) {
  const user = socket.data.user;

  /**
   * Client emits nudge:send
   * Payload: { loopId, toUserId, itemId?, message }
   */
  socket.on(SOCKET_EVENTS.CLIENT_NUDGE_SEND, async (payload, callback) => {
    try {
      const { loopId, toUserId, itemId, message } = payload || {};

      if (!loopId || !toUserId || !message) {
        if (typeof callback === 'function') {
          return callback({ success: false, message: 'Missing required nudge details' });
        }
        return;
      }

      // Rate limit check: max 5 nudges per 60 seconds per user
      const now = Date.now();
      const userKey = user._id.toString();
      const recentNudges = (userNudgeTimestamps.get(userKey) || []).filter(t => now - t < 60000);

      if (recentNudges.length >= 5) {
        if (typeof callback === 'function') {
          return callback({ success: false, message: 'Please wait a moment before sending another reminder.' });
        }
        return;
      }

      recentNudges.push(now);
      userNudgeTimestamps.set(userKey, recentNudges);

      // Verify loop membership for sender and recipient
      const loop = await Loop.findById(loopId);
      if (!loop) {
        if (typeof callback === 'function') return callback({ success: false, message: 'Loop not found' });
        return;
      }

      const isSenderMember = loop.members.some(m => m.userId.toString() === userKey);
      const isRecipientMember = loop.members.some(m => m.userId.toString() === toUserId);

      if (!isSenderMember || !isRecipientMember) {
        if (typeof callback === 'function') return callback({ success: false, message: 'Unauthorized' });
        return;
      }

      let itemTitle = undefined;
      if (itemId) {
        const item = await LoopItem.findById(itemId);
        if (item) itemTitle = item.title;
      }

      const nudge = await Nudge.create({
        loopId,
        fromUserId: user._id,
        toUserId,
        itemId,
        message
      });

      const broadcastPayload = {
        id: nudge._id.toString(),
        loopId,
        fromUserId: user._id.toString(),
        fromUserName: user.name,
        toUserId,
        itemId,
        itemTitle,
        message,
        timestamp: nudge.timestamp.toISOString()
      };

      // Broadcast nudge to loop room
      const roomName = `loop:${loopId}`;
      namespace.to(roomName).emit(SOCKET_EVENTS.SERVER_NUDGE_SENT, broadcastPayload);

      logger.info({ fromUserId: user._id, toUserId, loopId }, 'Nudge sent and broadcasted');

      if (typeof callback === 'function') {
        callback({
          success: true,
          data: { nudge: nudge.toJSON() }
        });
      }
    } catch (err) {
      logger.error({ err, userId: user._id }, 'Error processing socket nudge:send');
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Failed to send reminder' });
      }
    }
  });
}
