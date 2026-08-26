import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    await connectDatabase();

    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(`==================================================`);
      logger.info(`  BharatFarm Server running on port ${config.port}`);
      logger.info(`  Environment: ${config.env}`);
      logger.info(`  Mock Mode: ${config.useMockData}`);
      logger.info(`  OpenRouter API key configured: ${Boolean(config.openRouterApiKey)}`);
      logger.info(`  Health Endpoint: http://localhost:${config.port}/api/health`);
      logger.info(`==================================================`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use. Please free port ${config.port} or set PORT in .env.`);
      } else {
        logger.error('Server error:', err);
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
