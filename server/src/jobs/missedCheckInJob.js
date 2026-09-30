import { Queue, Worker } from 'bullmq';
import { env } from '../config/env.js';
import { getRedisClient } from '../config/redis.js';
import { Loop } from '../models/Loop.js';
import { LoopItem } from '../models/LoopItem.js';
import { CheckIn } from '../models/CheckIn.js';
import { User } from '../models/User.js';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';
import { logger } from '../logger.js';

export const MISSED_CHECKIN_QUEUE_NAME = 'missed-checkin-checker';

let missedCheckinQueue = null;
let missedCheckinWorker = null;

export function getMissedCheckinQueue() {
  if (!missedCheckinQueue) {
    const connection = getRedisClient();
    missedCheckinQueue = new Queue(MISSED_CHECKIN_QUEUE_NAME, { connection });
  }
  return missedCheckinQueue;
}

/**
 * Core scanning logic for overdue items.
 * Evaluates active loop items against their schedule and records 'missed' dose/chore logs.
 */
export async function scanForMissedCheckins(ioNamespace) {
  logger.info('Starting automated scan for missed/overdue check-ins...');
  const now = new Date();

  // Find all active items
  const activeItems = await LoopItem.find({ isActive: true }).populate('loopId');

  let missedCount = 0;

  for (const item of activeItems) {
    const loop = item.loopId;
    if (!loop) continue;

    const timesOfDay = item.schedule?.timesOfDay || ['09:00'];
    const deadlineMinutes = item.schedule?.deadlineMinutesAfterDue || 60;

    // Determine target members
    const targetMemberIds = (item.assignedTo && item.assignedTo.length > 0)
      ? item.assignedTo.map(id => id.toString())
      : loop.members.map(m => m.userId.toString());

    // Check each scheduled time for today
    for (const timeStr of timesOfDay) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const scheduledDate = new Date(now);
      scheduledDate.setHours(hours, minutes, 0, 0);

      const deadlineDate = new Date(scheduledDate.getTime() + deadlineMinutes * 60 * 1000);

      // Has the deadline passed?
      if (now > deadlineDate) {
        for (const memberId of targetMemberIds) {
          // Check if user already recorded any checkin (done, taken, paid, skipped, or missed)
          const existingCheckIn = await CheckIn.findOne({
            itemId: item._id,
            userId: memberId,
            scheduledTime: {
              $gte: new Date(scheduledDate.getTime() - 60 * 60 * 1000),
              $lte: new Date(scheduledDate.getTime() + 60 * 60 * 1000)
            }
          });

          if (!existingCheckIn) {
            // Write 'missed' check-in
            const user = await User.findById(memberId).select('name');
            const missedLog = await CheckIn.create({
              loopId: loop._id,
              itemId: item._id,
              userId: memberId,
              scheduledTime: scheduledDate,
              status: 'missed',
              notes: 'Automatically marked as missed past the deadline window.'
            });

            missedCount++;

            // Emit member:missed to the loop room if socket namespace is provided
            if (ioNamespace) {
              const roomName = `loop:${loop._id}`;
              ioNamespace.to(roomName).emit(SOCKET_EVENTS.SERVER_MEMBER_MISSED, {
                loopId: loop._id.toString(),
                itemId: item._id.toString(),
                itemTitle: item.title,
                userId: memberId,
                userName: user?.name || 'Member',
                scheduledTime: scheduledDate.toISOString(),
                deadlineTime: deadlineDate.toISOString(),
                timestamp: now.toISOString()
              });
            }

            logger.warn({
              loopId: loop._id,
              itemId: item._id,
              userId: memberId,
              itemTitle: item.title
            }, 'Flagged overdue item as missed and broadcasted alert');
          }
        }
      }
    }
  }

  logger.info({ missedCount }, 'Finished missed check-in scan');
  return { missedCount };
}

/**
 * Initializes BullMQ worker and recurring scheduled job (every 5 minutes)
 */
export async function initializeMissedCheckinWorker(ioNamespace) {
  try {
    const queue = getMissedCheckinQueue();

    // Schedule repeatable job every 5 minutes
    await queue.upsertJobScheduler(
      'periodic-missed-checkin-scanner',
      { every: 5 * 60 * 1000 },
      { name: 'scan-missed' }
    );

    const connection = getRedisClient();
    missedCheckinWorker = new Worker(
      MISSED_CHECKIN_QUEUE_NAME,
      async (job) => {
        logger.info({ jobId: job.id, jobName: job.name }, 'BullMQ worker executing missed-checkin scan');
        return scanForMissedCheckins(ioNamespace);
      },
      { connection }
    );

    missedCheckinWorker.on('completed', (job, result) => {
      logger.info({ jobId: job.id, result }, 'BullMQ missed-checkin job completed successfully');
    });

    missedCheckinWorker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, err }, 'BullMQ missed-checkin job failed');
    });

    logger.info('BullMQ missed-checkin queue and worker initialized');
  } catch (err) {
    logger.warn({ err: err.message }, 'BullMQ worker initialization bypassed (e.g. running in Redis-free mock mode)');
  }
}
