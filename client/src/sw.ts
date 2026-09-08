// BharatFarm Service Worker — Custom handlers
// vite-plugin-pwa injectManifest strategy: Workbox replaces self.__WB_MANIFEST with the precache list.
// @ts-nocheck — compiled with WebWorker lib separately

/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

// REQUIRED: Workbox injectManifest replaces this token at build time
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ── Push Event Handler ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload = {};
    try {
        payload = event.data.json();
    } catch {
        payload = { title: 'BharatFarm', body: event.data.text() };
    }

    const title = payload.title || 'BharatFarm';
    const options = {
        body: payload.body || 'You have a new update from BharatFarm.',
        icon: payload.icon || '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        data: {
            url: payload.url || '/',
            category: payload.category || 'general',
            ...(payload.data || {})
        },
        requireInteraction: false,
        silent: false,
        tag: payload.category || 'bharatfarm-notification',
        renotify: true
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification Click Handler ────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data || {};
    let targetUrl = data.url || '/';

    // Category-based routing when no explicit URL is set
    if (!data.url && data.category) {
        const categoryRoutes = {
            'climate': '/sih/climate-risk',
            'climate-risk': '/sih/climate-risk',
            'mandi': '/sih/smart-mandi',
            'smart-mandi': '/sih/smart-mandi',
            'aggregation': '/sih/aggregation',
            'crop-risk': '/sih/crop-insurance',
            'insurance': '/sih/crop-insurance',
            'sahayak': '/sih/sahayak',
            'system': '/home',
            'general': '/home'
        };
        targetUrl = categoryRoutes[data.category] || '/home';
    }

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is already open, focus it and navigate
                for (const client of clientList) {
                    if ('navigate' in client && 'focus' in client) {
                        client.navigate(targetUrl);
                        return client.focus();
                    }
                }
                // App is closed — open it at the correct route
                return self.clients.openWindow(targetUrl);
            })
    );
});

// ── Skip Waiting on Message ───────────────────────────────────────────────────
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
