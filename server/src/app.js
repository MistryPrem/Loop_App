import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Basic security & parsing
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      // Allow mobile apps (no origin) and specified client origin
      if (!origin || origin === env.CLIENT_ORIGIN || env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true
  }));

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Global rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please slow down and try again later.'
    }
  });
  app.use('/api', limiter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // REST API v1
  app.use('/api/v1', apiRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      code: 'NOT_FOUND',
      message: 'The requested page or endpoint could not be found.'
    });
  });

  // Central error handler
  app.use(errorHandler);

  return app;
}
