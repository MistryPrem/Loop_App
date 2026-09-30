import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../logger.js';

let pubClientInstance = null;
let subClientInstance = null;
let redisClientInstance = null;

export function getRedisClient() {
  if (!redisClientInstance) {
    redisClientInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      }
    });

    redisClientInstance.on('connect', () => {
      logger.info('Connected to Redis');
    });

    redisClientInstance.on('error', (err) => {
      // Prevent crashing if Redis is offline during local mock testing
      logger.warn({ err: err.message }, 'Redis connection error (fallback mode active if running offline)');
    });
  }
  return redisClientInstance;
}

export function createRedisClientsForSocket() {
  if (!pubClientInstance || !subClientInstance) {
    pubClientInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    });
    subClientInstance = pubClientInstance.duplicate();

    pubClientInstance.on('error', (err) => logger.warn({ err: err.message }, 'Redis PubClient error'));
    subClientInstance.on('error', (err) => logger.warn({ err: err.message }, 'Redis SubClient error'));
  }

  return { pubClient: pubClientInstance, subClient: subClientInstance };
}
