import { useState, useEffect, useCallback } from 'react';

// VAPID public key from environment — only the PUBLIC key is safe to expose
const VAPID_PUBLIC_KEY = (import.meta as Record<string, any>).env?.VITE_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
}

interface UsePushNotificationsReturn {
    permission: NotificationPermission | 'unsupported';
    isSubscribed: boolean;
    isLoading: boolean;
    requestPermissionAndSubscribe: () => Promise<boolean>;
    unsubscribe: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            setPermission('unsupported');
            return;
        }
        setPermission(Notification.permission);

        const checkSubscription = async () => {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            } catch {
                // Silently fail
            }
        };
        checkSubscription();
    }, []);

    const requestPermissionAndSubscribe = useCallback(async (): Promise<boolean> => {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;
        if (!VAPID_PUBLIC_KEY) {
            console.warn('[PWA] VITE_VAPID_PUBLIC_KEY not configured. Push notifications disabled.');
            return false;
        }

        setIsLoading(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result !== 'granted') {
                setIsLoading(false);
                return false;
            }

            const registration = await navigator.serviceWorker.ready;

            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                await existingSubscription.unsubscribe();
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            const authToken = localStorage.getItem('auth_token');
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
                },
                body: JSON.stringify(subscription.toJSON())
            });

            if (response.ok) {
                setIsSubscribed(true);
                localStorage.setItem('bf_push_subscribed', 'true');
                return true;
            } else {
                await subscription.unsubscribe();
                return false;
            }
        } catch (error) {
            console.error('[PWA] Push subscription failed:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const unsubscribe = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                const authToken = localStorage.getItem('auth_token');
                await fetch('/api/push/unsubscribe', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                });
            }
            setIsSubscribed(false);
            localStorage.removeItem('bf_push_subscribed');
        } catch (error) {
            console.error('[PWA] Push unsubscription failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { permission, isSubscribed, isLoading, requestPermissionAndSubscribe, unsubscribe };
}
