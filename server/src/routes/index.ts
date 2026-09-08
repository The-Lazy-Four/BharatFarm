import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import aiRoutes from './ai.routes.js';
import pushRoutes from './push.routes.js';
import cropRiskRoutes from './cropRisk.routes.js';
import climateRiskRoutes from './climateRisk.routes.js';
import foodSecurityRoutes from './foodSecurity.routes.js';

const aggregateRouter = Router();

aggregateRouter.use('/', healthRoutes);
aggregateRouter.use('/auth', authRoutes);
aggregateRouter.use('/ai', aiRoutes);
aggregateRouter.use('/push', pushRoutes);
aggregateRouter.use('/crop-risk', cropRiskRoutes);
aggregateRouter.use('/climate-risk', climateRiskRoutes);
aggregateRouter.use('/food-security', foodSecurityRoutes);

export default aggregateRouter;
