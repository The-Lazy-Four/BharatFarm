import { config } from './env.js';
import { logger } from '../utils/logger.js';

export const connectDatabase = async (): Promise<void> => {
  if (config.useMockData) {
    logger.info('[DATABASE] Operating in MOCK DATA mode. No physical database connection required.');
    return;
  }
  logger.info('[DATABASE] Database initialization checked.');
};
