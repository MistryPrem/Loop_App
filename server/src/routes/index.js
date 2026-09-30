import { Router } from 'express';
import { authRouter } from './auth.js';
import { loopRouter } from './loop.js';
import { loopItemRouter } from './loopItem.js';
import { checkInRouter } from './checkIn.js';
import { nudgeRouter } from './nudge.js';
import { userRouter } from './user.js';
import { emergencyRouter } from './emergency.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/loops', loopRouter);
apiRouter.use('/items', loopItemRouter);
apiRouter.use('/checkins', checkInRouter);
apiRouter.use('/nudges', nudgeRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/emergency', emergencyRouter);
