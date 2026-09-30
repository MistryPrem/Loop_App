import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const userRouter = Router();

const updatePreferencesSchema = z.object({
  body: z.object({
    themePreference: z.enum(['system', 'light', 'dark', 'highContrast']).optional(),
    textScale: z.number().min(1.0).max(2.5).optional(),
    reduceMotion: z.boolean().optional(),
    ttsEnabled: z.boolean().optional(),
    simpleMode: z.boolean().optional(),
    highContrast: z.boolean().optional()
  })
});

userRouter.patch('/preferences', requireAuth, validate(updatePreferencesSchema), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.preferences = {
      ...user.preferences.toObject(),
      ...req.body
    };

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
});
