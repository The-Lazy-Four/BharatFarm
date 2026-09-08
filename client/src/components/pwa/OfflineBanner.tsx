import React from 'react';
import { useOffline } from '../../context/OfflineContext.js';

/**
 * OfflineBanner
 * Shown at the top of the app when the device is offline.
 * Does not block usage — cached shell remains accessible.
 */
export const OfflineBanner: React.FC = () => {
    const { isOnline } = useOffline();

    if (isOnline) return null;

    return (
        <div
            id="offline-banner"
            role="alert"
            aria-live="assertive"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10000,
                background: '#78350f',
                color: '#fff',
                padding: '0.6rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                borderBottom: '1px solid rgba(251, 146, 60, 0.4)'
            }}
        >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#fbbf24', flexShrink: 0 }}>
                wifi_off
            </span>
            <span style={{ flex: 1 }}>
                You're offline — Some live agriculture data may be unavailable until your connection returns.
            </span>
        </div>
    );
};
