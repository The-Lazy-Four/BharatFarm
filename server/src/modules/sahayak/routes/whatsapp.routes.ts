import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsapp.controller.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
const controller = new WhatsAppController();

/**
 * GET /api/sahayak/whatsapp/webhook
 * Meta Webhook verification handshake endpoint
 */
router.get('/webhook', controller.verifyWebhook);

/**
 * POST /api/sahayak/whatsapp/webhook
 * Meta Webhook event notifications endpoint
 */
router.post('/webhook', asyncHandler(controller.handleWebhook));

/**
 * POST /api/sahayak/whatsapp/demo
 * Interactive SIH Demo Mode endpoint (no Meta credentials required)
 */
router.post('/demo', asyncHandler(controller.handleDemo));

export default router;
