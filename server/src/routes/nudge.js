import { Router } from 'express';
import { z } from 'zod';
import { Nudge } from '../models/Nudge.js';
import { Loop } from '../models/Loop.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../utils/AppError.js';

export const nudgeRouter = Router();

const sendNudgeSchema = z.object({
  body: z.object({
    loopId: z.string().min(1),
    toUserId: z.string().min(1),
    itemId: z.string().optional(),
    message: z.string().min(1, 'Please select or type a friendly reminder').max(200)
  })
});

nudgeRouter.post('/', requireAuth, validate(sendNudgeSchema), async (req, res, next) => {
  try {
    const { loopId, toUserId, itemId, message } = req.body;

    const loop = await Loop.findById(loopId);
    if (!loop) {
      throw new AppError('Loop not found', 404, 'LOOP_NOT_FOUND');
    }

    const isMember = loop.members.some(m => m.userId.toString() === req.user._id.toString());
    const targetIsMember = loop.members.some(m => m.userId.toString() === toUserId);

    if (!isMember || !targetIsMember) {
      throw new AppError('Both members must be in the same Loop', 403, 'FORBIDDEN');
    }

    const nudge = await Nudge.create({
      loopId,
      fromUserId: req.user._id,
      toUserId,
      itemId,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Friendly reminder sent!',
      data: { nudge }
    });
  } catch (error) {
    next(error);
  }
});
