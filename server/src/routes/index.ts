import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import aiRoutes from './ai.routes.js';

const aggregateRouter = Router();

aggregateRouter.use('/', healthRoutes);
aggregateRouter.use('/auth', authRoutes);
aggregateRouter.use('/ai', aiRoutes);

export default aggregateRouter;
