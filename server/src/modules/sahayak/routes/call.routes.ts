import { Router } from 'express';
import { CallController } from '../controllers/call.controller.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
const controller = new CallController();

// 1. Inbound telephone call trigger
router.post('/incoming', asyncHandler(controller.handleIncomingCall));

// 2. Telephone DTMF keypress webhook
router.post('/dtmf', asyncHandler(controller.handleDtmf));

// 3. Telephony speech recognition transcript webhook
router.post('/speech', asyncHandler(controller.handleSpeech));

// 4. Terminate call session
router.post('/terminate', asyncHandler(controller.handleTerminate));

// 5. Get current call state & transcript
router.get('/status/:sessionId', asyncHandler(controller.getCallStatus));

export default router;
