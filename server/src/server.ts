import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    await connectDatabase();

    const app = createApp();

    app.listen(config.port, () => {
      logger.info(`==================================================`);
      logger.info(`  BharatFarm Server running on port ${config.port}`);
      logger.info(`  Environment: ${config.env}`);
      logger.info(`  Mock Mode: ${config.useMockData}`);
      logger.info(`  Health Endpoint: http://localhost:${config.port}/api/health`);
      logger.info(`==================================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
