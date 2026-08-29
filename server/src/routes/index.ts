import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import krishiBotRoutes from '../modules/krishibot/routes/krishiBot.routes.js';
import scannerRoutes from '../modules/scanner/routes/scanner.routes.js';
import marketplaceRoutes from '../modules/marketplace/routes/marketplace.routes.js';
import weatherRoutes from '../modules/weather/routes/weather.routes.js';
import groupBuyingRoutes from '../modules/groupbuying/routes/groupBuying.routes.js';
import schemesRoutes from '../modules/schemes/routes/schemes.routes.js';
import roadmapRoutes from '../modules/roadmap/routes/roadmap.routes.js';
import aiRoutes from './ai.routes.js';

const aggregateRouter = Router();

aggregateRouter.use('/', healthRoutes);
aggregateRouter.use('/auth', authRoutes);
aggregateRouter.use('/krishibot', krishiBotRoutes);
aggregateRouter.use('/scanner', scannerRoutes);
aggregateRouter.use('/marketplace', marketplaceRoutes);
aggregateRouter.use('/weather', weatherRoutes);
aggregateRouter.use('/groupbuying', groupBuyingRoutes);
aggregateRouter.use('/schemes', schemesRoutes);
aggregateRouter.use('/roadmap', roadmapRoutes);
aggregateRouter.use('/ai', aiRoutes);

export default aggregateRouter;

