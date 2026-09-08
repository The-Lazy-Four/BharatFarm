import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import aiRoutes from './ai.routes.js';
import pushRoutes from './push.routes.js';
import cropRiskRoutes from './cropRisk.routes.js';
<<<<<<< HEAD
import climateRiskRoutes from './climateRisk.routes.js';
import foodSecurityRoutes from './foodSecurity.routes.js';
=======
import smartMandiRoutes from './smartMandi.routes.js';
>>>>>>> b6abd06ed916a8057f877be6451a2d0974b4a92e

const aggregateRouter = Router();

aggregateRouter.use('/', healthRoutes);
aggregateRouter.use('/auth', authRoutes);
aggregateRouter.use('/ai', aiRoutes);
aggregateRouter.use('/push', pushRoutes);
aggregateRouter.use('/crop-risk', cropRiskRoutes);
<<<<<<< HEAD
aggregateRouter.use('/climate-risk', climateRiskRoutes);
aggregateRouter.use('/food-security', foodSecurityRoutes);
=======
aggregateRouter.use('/smart-mandi', smartMandiRoutes);
>>>>>>> b6abd06ed916a8057f877be6451a2d0974b4a92e

export default aggregateRouter;
