import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import aggregateRouter from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { logger } from './utils/logger.js';

export const createApp = (): Express => {
  const app = express();

  app.use(cors({
    origin: config.clientUrl,
    credentials: true
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    logger.info(`HTTP ${req.method} ${req.path}`);
    next();
  });

  // Central Router Registration
  app.use('/api', aggregateRouter);

  // 404 & Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
