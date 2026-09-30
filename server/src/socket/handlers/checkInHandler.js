import { CheckIn } from '../../models/CheckIn.js';
import { Loop } from '../../models/Loop.js';
import { LoopItem } from '../../models/LoopItem.js';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';
import { logger } from '../../logger.js';

export function registerCheckInHandlers(namespace, socket) {
  const user = socket.data.user;

  /**
   * Client emits checkin:create
   * Payload: { loopId, itemId, status, notes?, proofAttachment? }
   */
  socket.on(SOCKET_EVENTS.CLIENT_CHECKIN_CREATE, async (payload, callback) => {
    try {
      const { loopId, itemId, status, notes, proofAttachment } = payload || {};

      if (!loopId || !itemId || !status) {
        if (typeof callback === 'function') {
          return callback({ success: false, message: 'Missing required check-in fields' });
        }
        return;
      }

      // Verify loop membership
      const loop = await Loop.findById(loopId);
      if (!loop) {
        if (typeof callback === 'function') return callback({ success: false, message: 'Loop not found' });
        return;
      }

      const isMember = loop.members.some(m => m.userId.toString() === user._id.toString());
      if (!isMember) {
        if (typeof callback === 'function') return callback({ success: false, message: 'Unauthorized' });
        return;
      }

      const item = await LoopItem.findById(itemId);
      if (!item) {
        if (typeof callback === 'function') return callback({ success: false, message: 'Item not found' });
        return;
      }

      // Check-in record with 10-second undo window
      const canUndoUntil = new Date(Date.now() + 10 * 1000);
      const checkIn = await CheckIn.create({
        loopId,
        itemId,
        userId: user._id,
        scheduledTime: new Date(),
        status,
        notes,
        proofAttachment,
        canUndoUntil
      });

      // Format broadcast payload according to @loop/shared contract
      const broadcastPayload = {
        id: checkIn._id.toString(),
        loopId,
        itemId,
        userId: user._id.toString(),
        userName: user.name,
        itemTitle: item.title,
        status,
        timestamp: checkIn.timestamp.toISOString(),
        proofAttachment
      };

      // Broadcast to room
      const roomName = `loop:${loopId}`;
      namespace.to(roomName).emit(SOCKET_EVENTS.SERVER_CHECKIN_NEW, broadcastPayload);

      logger.info({ userId: user._id, loopId, itemId, status }, 'Check-in recorded and broadcasted');

      if (typeof callback === 'function') {
        callback({
          success: true,
          data: {
            checkIn: {
              ...checkIn.toJSON(),
              canUndoUntil: canUndoUntil.toISOString()
            }
          }
        });
      }
    } catch (err) {
      logger.error({ err, userId: user._id }, 'Error processing socket checkin:create');
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Failed to process check-in' });
      }
    }
  });
}
