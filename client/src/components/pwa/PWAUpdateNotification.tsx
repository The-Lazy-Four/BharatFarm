import React, { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * PWAUpdateNotification
 * Shows a non-intrusive banner when a new service worker version is available.
 * Never force-refreshes the page — user must click Update.
 */
export const PWAUpdateNotification: React.FC = () => {
    const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('[SW] Service worker registered:', r?.scope);
        },
        onRegisterError(error: unknown) {
            console.error('[SW] Service worker registration failed:', error);
        }
    });

    const [dismissed, setDismissed] = useState(false);

    if (!needRefresh || dismissed) return null;

    return (
        <div
            role="alert"
            aria-live="polite"
            style={{
                position: 'fixed',
                bottom: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                background: '#0d4a1e',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '0.9rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                maxWidth: 'calc(100vw - 2rem)',
                width: 'max-content',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                backdropFilter: 'blur(8px)'
            }}
        >
            <span
                className="material-symbols-outlined"
                style={{ fontSize: '22px', color: '#4ade80', flexShrink: 0 }}
            >
                system_update
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                    BharatFarm update available
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.1rem' }}>
                    Tap to reload and get the latest version
                </div>
            </div>
            <button
                id="pwa-update-btn"
                onClick={() => updateServiceWorker(true)}
                style={{
                    background: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.5rem 1rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                }}
            >
                Update
            </button>
            <button
                onClick={() => setDismissed(true)}
                aria-label="Dismiss update notification"
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    flexShrink: 0
                }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
        </div>
    );
};
