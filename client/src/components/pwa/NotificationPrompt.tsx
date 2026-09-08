import React, { useState } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications.js';

interface NotificationPromptProps {
    /** If true, shows inline settings UI. If false, shows the initial request dialog. */
    mode?: 'dialog' | 'settings';
    onClose?: () => void;
}

/**
 * BharatFarm Notification Permission Prompt
 * Should ONLY be triggered after a meaningful user action (post-login or explicit button tap),
 * never on initial page load.
 */
export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ mode = 'dialog', onClose }) => {
    const { permission, isSubscribed, isLoading, requestPermissionAndSubscribe, unsubscribe } = usePushNotifications();
    const [done, setDone] = useState(false);

    if (permission === 'unsupported') return null;

    const handleEnable = async () => {
        const success = await requestPermissionAndSubscribe();
        if (success) {
            setDone(true);
            setTimeout(() => {
                onClose?.();
            }, 2000);
        }
    };

    const handleDisable = async () => {
        await unsubscribe();
    };

    // Settings mode - compact toggle
    if (mode === 'settings') {
        if (permission === 'denied') {
            return (
                <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    fontSize: '0.85rem'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '0.4rem' }}>
                        notifications_off
                    </span>
                    Notifications blocked in browser settings. Enable them under Site Settings.
                </div>
            );
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {isSubscribed ? '🔔 Notifications enabled' : '🔔 BharatFarm Alerts'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem' }}>
                        {isSubscribed ? 'You\'ll receive climate, mandi, and crop alerts' : 'Get weather, mandi, and crop alerts'}
                    </div>
                </div>
                <button
                    onClick={isSubscribed ? handleDisable : handleEnable}
                    disabled={isLoading}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(34,197,94,0.4)',
                        background: isSubscribed ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.15)',
                        color: isSubscribed ? '#fca5a5' : '#4ade80',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        opacity: isLoading ? 0.6 : 1
                    }}
                >
                    {isLoading ? '...' : isSubscribed ? 'Disable' : 'Enable'}
                </button>
            </div>
        );
    }

    // Dialog mode
    if (done) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '2rem 1.5rem'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔔</div>
                <h3 style={{ color: '#4ade80', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Notifications enabled!</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
                    You'll receive BharatFarm alerts for climate risks, mandi opportunities, and more.
                </p>
            </div>
        );
    }

    if (permission === 'denied') {
        return (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#fca5a5' }}>notifications_off</span>
                <h3 style={{ color: '#fff', margin: '0.5rem 0', fontSize: '1.1rem' }}>Notifications blocked</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>
                    To enable alerts, go to your browser's Site Settings and allow notifications for BharatFarm.
                </p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem'
        }}>
            <img src="/icons/icon-96.png" alt="BharatFarm" style={{ width: '72px', height: '72px', borderRadius: '18px' }} />
            <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800 }}>
                    Stay informed with BharatFarm
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                    Get important alerts about weather risks, mandi opportunities, crop insurance, and aggregation updates.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', maxWidth: '280px' }}>
                {[
                    { icon: 'partly_cloudy_day', label: 'Climate risk alerts' },
                    { icon: 'pin_drop', label: 'Mandi price opportunities' },
                    { icon: 'groups', label: 'Aggregation pool updates' },
                    { icon: 'satellite_alt', label: 'Crop risk notifications' }
                ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4ade80' }}>{item.icon}</span>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{item.label}</span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', maxWidth: '280px' }}>
                <button
                    id="enable-notifications-btn"
                    onClick={handleEnable}
                    disabled={isLoading}
                    style={{
                        width: '100%', padding: '0.9rem',
                        borderRadius: '14px', background: '#22c55e', color: '#fff',
                        border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                        opacity: isLoading ? 0.6 : 1
                    }}
                >
                    {isLoading ? 'Setting up…' : 'Enable Notifications'}
                </button>
                <button
                    id="dismiss-notifications-btn"
                    onClick={onClose}
                    style={{
                        width: '100%', padding: '0.75rem',
                        borderRadius: '14px', background: 'transparent', color: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(255,255,255,0.15)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                    }}
                >
                    Not Now
                </button>
            </div>
        </div>
    );
};
