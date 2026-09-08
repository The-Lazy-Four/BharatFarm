import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt(): Promise<void>;
}

interface PWAContextType {
    canInstall: boolean;
    isInstalled: boolean;
    promptInstall: () => Promise<boolean>;
    notificationPermission: NotificationPermission;
    pushSubscription: PushSubscription | null;
    requestNotificationPermission: () => Promise<boolean>;
    subscribeToNotifications: () => Promise<boolean>;
    unsubscribeFromNotifications: () => Promise<void>;
    updateAvailable: boolean;
    applyUpdate: () => void;
    isOnline: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

const VAPID_PUBLIC_KEY = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function isStandalone(): boolean {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).standalone === true
    );
}

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [canInstall, setCanInstall] = useState(false);
    const [isInstalled, setIsInstalled] = useState(isStandalone());
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
    const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (isStandalone()) {
            setIsInstalled(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            deferredPromptRef.current = e as BeforeInstallPromptEvent;
            setCanInstall(true);
        };

        const appInstalled = () => {
            setIsInstalled(true);
            setCanInstall(false);
            deferredPromptRef.current = null;
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', appInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', appInstalled);
        };
    }, []);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
                swRegistrationRef.current = registration;

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            setUpdateAvailable(true);
                        }
                    });
                });

                const sub = await registration.pushManager.getSubscription();
                if (sub) setPushSubscription(sub);

            } catch (err) {
                console.warn('[BharatFarm PWA] SW registration failed:', err);
            }
        };

        registerSW();
    }, []);

    const promptInstall = useCallback(async (): Promise<boolean> => {
        if (!deferredPromptRef.current) return false;
        try {
            await deferredPromptRef.current.prompt();
            const { outcome } = await deferredPromptRef.current.userChoice;
            deferredPromptRef.current = null;
            if (outcome === 'accepted') {
                setCanInstall(false);
                setIsInstalled(true);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
        if (typeof Notification === 'undefined') return false;
        if (Notification.permission === 'granted') return true;
        const result = await Notification.requestPermission();
        setNotificationPermission(result);
        return result === 'granted';
    }, []);

    const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
        if (!swRegistrationRef.current || !VAPID_PUBLIC_KEY) {
            // Fallback request permission
            const granted = await requestNotificationPermission();
            return granted;
        }
        try {
            const granted = await requestNotificationPermission();
            if (!granted) return false;

            const subscription = await swRegistrationRef.current.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource
            });

            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(subscription.toJSON())
            });

            setPushSubscription(subscription);
            return true;
        } catch (err) {
            console.warn('[BharatFarm PWA] Push subscription failed:', err);
            return false;
        }
    }, [requestNotificationPermission]);

    const unsubscribeFromNotifications = useCallback(async (): Promise<void> => {
        if (!pushSubscription) return;
        try {
            await fetch('/api/push/unsubscribe', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ endpoint: pushSubscription.endpoint })
            });
            await pushSubscription.unsubscribe();
            setPushSubscription(null);
        } catch (err) {
            console.warn('[BharatFarm PWA] Unsubscribe failed:', err);
        }
    }, [pushSubscription]);

    const applyUpdate = useCallback(() => {
        if (!swRegistrationRef.current?.waiting) return;
        swRegistrationRef.current.waiting.postMessage({ type: 'SKIP_WAITING' });
        setUpdateAvailable(false);
        window.location.reload();
    }, []);

    return (
        <PWAContext.Provider value={{
            canInstall,
            isInstalled,
            promptInstall,
            notificationPermission,
            pushSubscription,
            requestNotificationPermission,
            subscribeToNotifications,
            unsubscribeFromNotifications,
            updateAvailable,
            applyUpdate,
            isOnline
        }}>
            {children}
        </PWAContext.Provider>
    );
};

export const usePWA = () => {
    const context = useContext(PWAContext);
    if (!context) throw new Error('usePWA must be used within PWAProvider');
    return context;
};
