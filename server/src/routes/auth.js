import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    timezone: z.string().default('UTC'),
    locale: z.string().default('en-US')
  })
});

authRouter.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, phone, timezone, locale } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('An account with this email address already exists. Please log in.', 409, 'EMAIL_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      phone,
      timezone,
      locale
    });

    const accessToken = signAccessToken({ userId: user._id.toString() });
    const refreshToken = signRefreshToken({ userId: user._id.toString() });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Incorrect email or password. Please try again.', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Incorrect email or password. Please try again.', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = signAccessToken({ userId: user._id.toString() });
    const refreshToken = signRefreshToken({ userId: user._id.toString() });

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      message: 'Signed in successfully!',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token is required.', 400, 'TOKEN_REQUIRED');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new AppError('Refresh session expired. Please sign in again.', 401, 'REFRESH_EXPIRED');
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token. Please sign in again.', 401, 'INVALID_REFRESH_TOKEN');
    }

    const newAccessToken = signAccessToken({ userId: user._id.toString() });
    const newRefreshToken = signRefreshToken({ userId: user._id.toString() });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});
