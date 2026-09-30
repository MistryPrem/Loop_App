import { Router } from 'express';
import { z } from 'zod';
import { EmergencyInfo } from '../models/EmergencyInfo.js';
import { Loop } from '../models/Loop.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../utils/AppError.js';

export const emergencyRouter = Router();

const emergencyInfoSchema = z.object({
  body: z.object({
    loopId: z.string().min(1),
    userId: z.string().min(1),
    primaryContactName: z.string().min(2, 'Contact name is required'),
    primaryContactPhone: z.string().min(5, 'Valid phone number is required'),
    doctorName: z.string().optional(),
    doctorPhone: z.string().optional(),
    hospitalPreference: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    bloodType: z.string().optional(),
    notes: z.string().optional()
  })
});

// Get emergency info for a loop member
emergencyRouter.get('/:loopId/:userId', requireAuth, async (req, res, next) => {
  try {
    const { loopId, userId } = req.params;

    const loop = await Loop.findById(loopId);
    if (!loop) {
      throw new AppError('Loop not found', 404, 'LOOP_NOT_FOUND');
    }

    const isMember = loop.members.some(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      throw new AppError('You do not have permission to view emergency info in this Loop', 403, 'FORBIDDEN');
    }

    const info = await EmergencyInfo.findOne({ loopId, userId });

    res.json({
      success: true,
      data: { emergencyInfo: info }
    });
  } catch (error) {
    next(error);
  }
});

// Upsert emergency info
emergencyRouter.post('/', requireAuth, validate(emergencyInfoSchema), async (req, res, next) => {
  try {
    const { loopId, userId, ...details } = req.body;

    const loop = await Loop.findById(loopId);
    if (!loop) {
      throw new AppError('Loop not found', 404, 'LOOP_NOT_FOUND');
    }

    const isMember = loop.members.some(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      throw new AppError('You do not have access to this Loop', 403, 'FORBIDDEN');
    }

    const emergencyInfo = await EmergencyInfo.findOneAndUpdate(
      { loopId, userId },
      { loopId, userId, ...details },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Emergency information saved.',
      data: { emergencyInfo }
    });
  } catch (error) {
    next(error);
  }
});
