import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAInstallReturn {
    hasNativePrompt: boolean;
    isInstalled: boolean;
    isIOS: boolean;
    promptInstall: () => Promise<boolean>;
}

export function usePWAInstall(): UsePWAInstallReturn {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
        setIsIOS(ios);

        // Detect if already running as standalone/installed PWA
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            ('standalone' in window.navigator && (window.navigator as any).standalone === true);

        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // Check if install was previously completed in this browser
        const installCompleted = localStorage.getItem('bf_pwa_installed');
        if (installCompleted === 'true') {
            setIsInstalled(true);
        }

        // Capture native install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        // Detect successful install
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            localStorage.setItem('bf_pwa_installed', 'true');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = useCallback(async (): Promise<boolean> => {
        if (!deferredPrompt) return false;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (outcome === 'accepted') {
            setIsInstalled(true);
            localStorage.setItem('bf_pwa_installed', 'true');
            return true;
        }
        return false;
    }, [deferredPrompt]);

    return {
        hasNativePrompt: !!deferredPrompt,
        isInstalled,
        isIOS,
        promptInstall
    };
}
