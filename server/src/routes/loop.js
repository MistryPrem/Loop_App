import { Router } from 'express';
import { z } from 'zod';
import { Loop } from '../models/Loop.js';
import { LoopItem } from '../models/LoopItem.js';
import { CheckIn } from '../models/CheckIn.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../utils/AppError.js';

export const loopRouter = Router();

// Get all loops current user is a member of
loopRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const loops = await Loop.find({
      'members.userId': req.user._id
    }).populate('members.userId', 'name email').sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { loops }
    });
  } catch (error) {
    next(error);
  }
});

// Create new loop
const createLoopSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Loop name must be at least 2 characters'),
    description: z.string().optional(),
    type: z.enum(['habit', 'medicine', 'chore', 'expense']),
    icon: z.string().default('circle'),
    color: z.string().default('#0D9488')
  })
});

loopRouter.post('/', requireAuth, validate(createLoopSchema), async (req, res, next) => {
  try {
    const { name, description, type, icon, color } = req.body;

    const loop = await Loop.create({
      name,
      description,
      type,
      icon,
      color,
      createdBy: req.user._id,
      members: [
        {
          userId: req.user._id,
          role: type === 'medicine' ? 'caregiver' : 'owner',
          joinedAt: new Date()
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Loop created successfully!',
      data: { loop }
    });
  } catch (error) {
    next(error);
  }
});

// Join loop via invite code
const joinLoopSchema = z.object({
  body: z.object({
    inviteCode: z.string().min(4, 'Please enter a valid invite code'),
    role: z.enum(['member', 'patient', 'caregiver']).default('member'),
    nickname: z.string().optional()
  })
});

loopRouter.post('/join', requireAuth, validate(joinLoopSchema), async (req, res, next) => {
  try {
    const { inviteCode, role, nickname } = req.body;

    const loop = await Loop.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!loop) {
      throw new AppError('Loop not found. Please check your invite code.', 404, 'LOOP_NOT_FOUND');
    }

    const alreadyMember = loop.members.some(m => m.userId.toString() === req.user._id.toString());
    if (alreadyMember) {
      return res.json({
        success: true,
        message: 'You are already a member of this Loop.',
        data: { loop }
      });
    }

    loop.members.push({
      userId: req.user._id,
      role,
      nickname,
      joinedAt: new Date()
    });

    await loop.save();

    res.json({
      success: true,
      message: `You have successfully joined ${loop.name}!`,
      data: { loop }
    });
  } catch (error) {
    next(error);
  }
});

// Get single Loop details
loopRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const loop = await Loop.findById(req.params.id).populate('members.userId', 'name email preferences');
    if (!loop) {
      throw new AppError('Loop not found', 404, 'LOOP_NOT_FOUND');
    }

    const isMember = loop.members.some(m => m.userId._id.toString() === req.user._id.toString());
    if (!isMember) {
      throw new AppError('You do not have access to this Loop', 403, 'FORBIDDEN');
    }

    const items = await LoopItem.find({ loopId: loop._id, isActive: true });

    res.json({
      success: true,
      data: {
        loop,
        items
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update loop details
const updateLoopSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional()
  })
});

loopRouter.patch('/:id', requireAuth, validate(updateLoopSchema), async (req, res, next) => {
  try {
    const loop = await Loop.findById(req.params.id);
    if (!loop) {
      throw new AppError('Loop not found', 404, 'LOOP_NOT_FOUND');
    }

    const memberRecord = loop.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!memberRecord || (memberRecord.role !== 'owner' && memberRecord.role !== 'caregiver')) {
      throw new AppError('Only Loop owners or caregivers can edit Loop details.', 403, 'FORBIDDEN');
    }

    Object.assign(loop, req.body);
    await loop.save();

    res.json({
      success: true,
      message: 'Loop settings updated',
      data: { loop }
    });
  } catch (error) {
    next(error);
  }
});

// Leave or remove member from loop
loopRouter.delete('/:id/members/:userId', requireAuth, async (req, res, next) => {
  try {
    const loop = await Loop.findById(req.params.id);
    if (!loop) {
      throw new AppError('Loop not found', 404, 'LOOP_NOT_FOUND');
    }

    const targetUserId = req.params.userId;
    const isSelf = targetUserId === req.user._id.toString();

    const requesterMember = loop.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!requesterMember) {
      throw new AppError('You are not a member of this Loop', 403, 'FORBIDDEN');
    }

    if (!isSelf && requesterMember.role !== 'owner' && requesterMember.role !== 'caregiver') {
      throw new AppError('Only owners or caregivers can remove members.', 403, 'FORBIDDEN');
    }

    loop.members = loop.members.filter(m => m.userId.toString() !== targetUserId);
    await loop.save();

    res.json({
      success: true,
      message: isSelf ? 'You have left the Loop.' : 'Member removed from Loop.'
    });
  } catch (error) {
    next(error);
  }
});
