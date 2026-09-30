import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../logger.js';

export async function connectDatabase() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected to MongoDB successfully');
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to MongoDB');
    throw error;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB');
}
