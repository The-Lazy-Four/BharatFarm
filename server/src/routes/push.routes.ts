import { Router } from 'express';
import webpush from 'web-push';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';
import { getSupabaseClient } from '../config/supabase.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Helper to get fresh VAPID credentials (ensures env vars loaded via dotenv)
function getVapidCredentials() {
    const publicKey = process.env.VAPID_PUBLIC_KEY || '';
    const privateKey = process.env.VAPID_PRIVATE_KEY || '';
    const subject = process.env.VAPID_SUBJECT || 'mailto:pwa@bharatfarm.org';
    return { publicKey, privateKey, subject };
}

function ensureVapidConfigured() {
    const { publicKey, privateKey, subject } = getVapidCredentials();
    if (publicKey && privateKey) {
        try {
            webpush.setVapidDetails(subject, publicKey, privateKey);
            return true;
        } catch (err) {
            console.error('[Push] Failed to set VAPID details:', err);
            return false;
        }
    }
    return false;
}

/**
 * GET /api/push/public-key
 * Returns VAPID public key to the frontend for subscription.
 * Public endpoint — no auth required (only public key is sent, never the private key).
 */
router.get('/public-key', (_req, res) => {
    const { publicKey } = getVapidCredentials();
    if (!publicKey) {
        return ApiResponse.error(res, 'VAPID not configured on server', 'CONFIG_ERROR', 503);
    }
    return ApiResponse.success(res, { publicKey });
});

/**
 * POST /api/push/subscribe
 * Saves a push subscription for the authenticated user.
 * Requires: Authorization: Bearer <token>
 */
router.post('/subscribe', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return ApiResponse.error(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    const { endpoint, keys, expirationTime } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return ApiResponse.error(res, 'Invalid push subscription payload', 'VALIDATION_ERROR', 400);
    }

    if (config.useMockData) {
        return ApiResponse.success(res, { subscribed: true }, 'Push subscription saved (Mock Mode)');
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
        return ApiResponse.error(res, 'Database not configured', 'SERVER_ERROR', 500);
    }

    try {
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /android|iphone|ipad/i.test(userAgent);

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                expiration_time: expirationTime || null,
                user_agent: userAgent.substring(0, 500),
                device_type: isMobile ? 'mobile' : 'desktop',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'endpoint'
            });

        if (error) {
            console.error('[Push] Failed to save subscription:', error);
            return ApiResponse.error(res, 'Failed to save push subscription', 'DB_ERROR', 500);
        }

        return ApiResponse.success(res, { subscribed: true }, 'Push subscription saved');
    } catch (err: any) {
        return ApiResponse.error(res, err?.message || 'Unexpected error', 'SERVER_ERROR', 500);
    }
});

/**
 * DELETE /api/push/unsubscribe
 * Removes a push subscription (by endpoint).
 * Requires: Authorization: Bearer <token>
 */
router.delete('/unsubscribe', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return ApiResponse.error(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    const { endpoint } = req.body;

    if (!endpoint) {
        return ApiResponse.error(res, 'Endpoint is required', 'VALIDATION_ERROR', 400);
    }

    if (config.useMockData) {
        return ApiResponse.success(res, { unsubscribed: true }, 'Push subscription removed (Mock Mode)');
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
        return ApiResponse.error(res, 'Database not configured', 'SERVER_ERROR', 500);
    }

    try {
        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', endpoint);

        if (error) {
            return ApiResponse.error(res, 'Failed to remove subscription', 'DB_ERROR', 500);
        }

        return ApiResponse.success(res, { unsubscribed: true }, 'Push subscription removed');
    } catch (err: any) {
        return ApiResponse.error(res, err?.message || 'Unexpected error', 'SERVER_ERROR', 500);
    }
});

/**
 * POST /api/push/send-demo
 * Sends a demo/test notification to the authenticated user's all subscribed devices.
 * SECURITY: Requires authentication (authenticateToken) — user can only trigger notifications to THEIR OWN devices.
 * Body: { category: 'climate' | 'mandi' | 'aggregation' | 'crop-risk' | 'sahayak' }
 */
router.post('/send-demo', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return ApiResponse.error(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    if (!ensureVapidConfigured()) {
        return ApiResponse.error(res, 'VAPID keys not configured on server', 'CONFIG_ERROR', 503);
    }

    const { category = 'climate' } = req.body;

    if (config.useMockData) {
        return ApiResponse.success(res, { sent: 1, failed: 0 }, 'Demo notification sent (Mock Mode)');
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
        return ApiResponse.error(res, 'Database not configured', 'SERVER_ERROR', 500);
    }

    const DEMO_PAYLOADS: Record<string, { title: string; body: string; url: string }> = {
        'climate': {
            title: '⛈ BharatFarm Climate Alert',
            body: 'Heavy rainfall expected in your area tomorrow. Review your harvest plan now.',
            url: '/sih/climate-risk'
        },
        'mandi': {
            title: '📊 BharatFarm Mandi Alert',
            body: 'Ludhiana mandi is currently offering a higher estimated net return for wheat.',
            url: '/sih/smart-mandi'
        },
        'aggregation': {
            title: '🤝 BharatFarm Aggregation Update',
            body: 'Your group-selling pool has reached 80% of its target. Join now for better prices.',
            url: '/sih/aggregation'
        },
        'crop-risk': {
            title: '🛡 BharatFarm Crop Risk Alert',
            body: 'Satellite NDVI analysis shows moderate crop stress in your registered field.',
            url: '/sih/crop-insurance'
        },
        'sahayak': {
            title: '🤖 BharatFarm Sahayak',
            body: 'A new advisory from your area\'s agriculture extension officer is available.',
            url: '/sih/sahayak'
        }
    };

    const payload = DEMO_PAYLOADS[category] || DEMO_PAYLOADS['climate'];

    try {
        const { data: subscriptions, error: fetchError } = await supabase
            .from('push_subscriptions')
            .select('endpoint, p256dh, auth')
            .eq('user_id', user.id);

        if (fetchError || !subscriptions || subscriptions.length === 0) {
            return ApiResponse.error(res, 'No push subscriptions found for this account. Enable notifications first.', 'NOT_FOUND', 404);
        }

        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-96.png',
            url: payload.url,
            category,
            data: { category, url: payload.url }
        });

        let sent = 0;
        let failed = 0;
        const invalidEndpoints: string[] = [];

        await Promise.allSettled(
            subscriptions.map(async (sub) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                };

                try {
                    await webpush.sendNotification(pushSubscription, notificationPayload);
                    sent++;
                } catch (err: any) {
                    failed++;
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        invalidEndpoints.push(sub.endpoint);
                    }
                }
            })
        );

        if (invalidEndpoints.length > 0) {
            await supabase
                .from('push_subscriptions')
                .delete()
                .in('endpoint', invalidEndpoints);
        }

        return ApiResponse.success(res, { sent, failed }, `Demo notification: ${sent} delivered, ${failed} failed`);
    } catch (err: any) {
        return ApiResponse.error(res, err?.message || 'Failed to send push notification', 'PUSH_ERROR', 500);
    }
});

export default router;
