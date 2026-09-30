import { Router } from 'express';
import { z } from 'zod';
import { CheckIn } from '../models/CheckIn.js';
import { Loop } from '../models/Loop.js';
import { LoopItem } from '../models/LoopItem.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../utils/AppError.js';

export const checkInRouter = Router();

const createCheckInSchema = z.object({
  body: z.object({
    loopId: z.string().min(1, 'Loop ID is required'),
    itemId: z.string().min(1, 'Item ID is required'),
    status: z.enum(['done', 'taken', 'paid', 'skipped']),
    notes: z.string().optional(),
    scheduledTime: z.string().datetime().optional(),
    proofAttachment: z.object({
      type: z.enum(['photo', 'voice_note']),
      url: z.string().url()
    }).optional()
  })
});

// REST endpoint for checkin (offline-first sync or fallback)
checkInRouter.post('/', requireAuth, validate(createCheckInSchema), async (req, res, next) => {
  try {
    const { loopId, itemId, status, notes, scheduledTime, proofAttachment } = req.body;

    const loop = await Loop.findById(loopId);
    if (!loop) {
      throw new AppError('Loop not found', 404, 'LOOP_NOT_FOUND');
    }

    const isMember = loop.members.some(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      throw new AppError('You are not authorized to check in for this Loop', 403, 'FORBIDDEN');
    }

    const scheduledDate = scheduledTime ? new Date(scheduledTime) : new Date();
    // 10-second forgiving undo window
    const canUndoUntil = new Date(Date.now() + 10 * 1000);

    const checkIn = await CheckIn.create({
      loopId,
      itemId,
      userId: req.user._id,
      scheduledTime: scheduledDate,
      status,
      notes,
      proofAttachment,
      canUndoUntil
    });

    res.status(201).json({
      success: true,
      message: `Marked as ${status}! You have 10 seconds to undo if this was a mistake.`,
      data: { checkIn }
    });
  } catch (error) {
    next(error);
  }
});

// Forgiving Undo Endpoint
checkInRouter.post('/:id/undo', requireAuth, async (req, res, next) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id);
    if (!checkIn) {
      throw new AppError('Check-in not found', 404, 'CHECKIN_NOT_FOUND');
    }

    if (checkIn.userId.toString() !== req.user._id.toString()) {
      throw new AppError('You can only undo your own check-ins', 403, 'FORBIDDEN');
    }

    if (checkIn.canUndoUntil && new Date() > checkIn.canUndoUntil) {
      throw new AppError('The 10-second undo window has passed.', 400, 'UNDO_WINDOW_EXPIRED');
    }

    await CheckIn.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Check-in undone successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get loop check-in history & today's feed
checkInRouter.get('/loop/:loopId', requireAuth, async (req, res, next) => {
  try {
    const { loopId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);

    const history = await CheckIn.find({ loopId })
      .populate('userId', 'name preferences')
      .populate('itemId', 'title schedule medicineDetails')
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: { history }
    });
  } catch (error) {
    next(error);
  }
});
