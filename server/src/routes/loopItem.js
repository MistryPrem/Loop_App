import { Router } from 'express';
import { z } from 'zod';
import { LoopItem } from '../models/LoopItem.js';
import { Loop } from '../models/Loop.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../utils/AppError.js';

export const loopItemRouter = Router();

const createLoopItemSchema = z.object({
  body: z.object({
    loopId: z.string().min(1, 'Loop ID is required'),
    title: z.string().min(2, 'Item title must be at least 2 characters'),
    description: z.string().optional(),
    assignedTo: z.array(z.string()).optional(),
    schedule: z.object({
      frequency: z.enum(['daily', 'weekdays', 'custom_days', 'interval']).default('daily'),
      timesOfDay: z.array(z.string()).default(['09:00']),
      customDays: z.array(z.number()).optional(),
      deadlineMinutesAfterDue: z.number().default(60)
    }).default({ frequency: 'daily', timesOfDay: ['09:00'], deadlineMinutesAfterDue: 60 }),
    medicineDetails: z.object({
      dosage: z.string().optional(),
      instructions: z.string().optional(),
      currentStock: z.number().optional(),
      refillThreshold: z.number().optional()
    }).optional(),
    choreDetails: z.object({
      rotationMode: z.enum(['fixed', 'round_robin']).default('fixed'),
      currentAssigneeId: z.string().optional(),
      estimatedMinutes: z.number().optional()
    }).optional(),
    expenseDetails: z.object({
      defaultSplitMode: z.enum(['equal', 'percentage', 'exact']).default('equal'),
      amount: z.number().optional(),
      currency: z.string().default('USD')
    }).optional()
  })
});

loopItemRouter.post('/', requireAuth, validate(createLoopItemSchema), async (req, res, next) => {
  try {
    const loop = await Loop.findById(req.body.loopId);
    if (!loop) {
      throw new AppError('Loop not found', 404, 'LOOP_NOT_FOUND');
    }

    const isMember = loop.members.some(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      throw new AppError('You are not authorized to add items to this Loop', 403, 'FORBIDDEN');
    }

    const item = await LoopItem.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Item added successfully!',
      data: { item }
    });
  } catch (error) {
    next(error);
  }
});

// Update item
loopItemRouter.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await LoopItem.findById(req.params.id);
    if (!item) {
      throw new AppError('Item not found', 404, 'ITEM_NOT_FOUND');
    }

    const loop = await Loop.findById(item.loopId);
    const isMember = loop.members.some(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      throw new AppError('You do not have access to this Loop', 403, 'FORBIDDEN');
    }

    Object.assign(item, req.body);
    await item.save();

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: { item }
    });
  } catch (error) {
    next(error);
  }
});

// Archive/Delete item
loopItemRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await LoopItem.findById(req.params.id);
    if (!item) {
      throw new AppError('Item not found', 404, 'ITEM_NOT_FOUND');
    }

    item.isActive = false;
    await item.save();

    res.json({
      success: true,
      message: 'Item archived successfully'
    });
  } catch (error) {
    next(error);
  }
});
