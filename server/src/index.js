import http from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { initializeSocketServer } from './socket/index.js';
import { initializeMissedCheckinWorker } from './jobs/missedCheckInJob.js';
import { logger } from './logger.js';

// Top-level await for safe ESM startup
try {
  logger.info('Initializing Loop Server in ESM mode...');
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  // Initialize Socket.io server
  const { io, loopNamespace } = initializeSocketServer(server);

  // Initialize BullMQ missed check-in worker
  await initializeMissedCheckinWorker(loopNamespace);

  server.listen(env.PORT, () => {
    logger.info(`Loop API server listening on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Graceful shutdown handling
  const handleShutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
} catch (error) {
  logger.fatal({ err: error }, 'Failed to start Loop Server');
  process.exit(1);
}
