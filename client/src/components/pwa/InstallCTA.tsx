import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall.js';

interface InstallCTAProps {
    /** Visual variant - 'banner' for floating banner, 'button' for inline button */
    variant?: 'banner' | 'button';
    className?: string;
    style?: React.CSSProperties;
}

/**
 * BharatFarm PWA Install CTA
 * Always visible on landing page unless already running in standalone mode.
 * - If native beforeinstallprompt is ready → triggers native browser prompt.
 * - If native prompt is pending/unavailable → opens browser-specific install guide.
 * - If running in standalone mode → displays "✓ BharatFarm Installed".
 */
export const InstallCTA: React.FC<InstallCTAProps> = ({ variant = 'button', style }) => {
    const { hasNativePrompt, isInstalled, isIOS, promptInstall } = usePWAInstall();
    const [guideModalOpen, setGuideModalOpen] = useState(false);
    const [installing, setInstalling] = useState(false);

    const handleInstallClick = async () => {
        if (hasNativePrompt) {
            setInstalling(true);
            try {
                await promptInstall();
            } catch (err) {
                console.error('[PWA] Native install error:', err);
            } finally {
                setInstalling(false);
            }
        } else {
            // Native prompt not yet available — open browser install guide modal
            setGuideModalOpen(true);
        }
    };

    // Already installed badge
    if (isInstalled) {
        if (variant === 'button') {
            return (
                <div
                    id="pwa-installed-badge"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.75rem 1.4rem',
                        borderRadius: '12px',
                        background: 'rgba(34, 197, 94, 0.12)',
                        border: '1.5px solid #22c55e',
                        color: '#15803d',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        ...style
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#16a34a' }}>
                        check_circle
                    </span>
                    BharatFarm Installed
                </div>
            );
        }
        return null;
    }

    // Install Guide Modal (when beforeinstallprompt hasn't disaptched or iOS Safari)
    const InstallGuideModal = () => (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={() => setGuideModalOpen(false)}
        >
            <div
                style={{
                    background: '#0d4a1e',
                    color: '#ffffff',
                    borderRadius: '24px',
                    padding: '2rem 1.75rem',
                    maxWidth: '480px',
                    width: '100%',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <img
                        src="/icons/icon-96.png"
                        alt="BharatFarm"
                        style={{ width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0 }}
                    />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                            Install BharatFarm App
                        </h3>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                            Smart Agriculture Platform
                        </p>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#4ade80', marginBottom: '0.85rem' }}>
                        {isIOS ? '📱 iOS Safari Instructions:' : '📱 How to install on your browser:'}
                    </div>

                    {isIOS ? (
                        <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', lineHeight: 1.6, color: '#e2e8f0' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Tap the <strong>Share button (⬆)</strong> in Safari toolbar.</li>
                            <li style={{ marginBottom: '0.5rem' }}>Scroll down and select <strong>"Add to Home Screen"</strong>.</li>
                            <li>Tap <strong>"Add"</strong> in top right corner.</li>
                        </ol>
                    ) : (
                        <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', lineHeight: 1.6, color: '#e2e8f0' }}>
                            <li style={{ marginBottom: '0.5rem' }}>
                                Open browser menu <strong>(⋮ or ⊕)</strong> in your browser address bar.
                            </li>
                            <li style={{ marginBottom: '0.5rem' }}>
                                Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                            </li>
                            <li>BharatFarm will install to your device launcher for instant offline access.</li>
                        </ol>
                    )}
                </div>

                <button
                    onClick={() => setGuideModalOpen(false)}
                    style={{
                        width: '100%',
                        padding: '0.85rem',
                        borderRadius: '12px',
                        background: '#22c55e',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    Got it!
                </button>
            </div>
        </div>
    );

    if (variant === 'banner') {
        return (
            <>
                <div
                    id="pwa-install-banner"
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        left: '1rem',
                        right: '1rem',
                        zIndex: 999,
                        background: '#0d4a1e',
                        borderRadius: '16px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        ...style
                    }}
                >
                    <img src="/icons/icon-96.png" alt="" style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Install BharatFarm</div>
                        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem' }}>
                            {isIOS ? 'Tap Share → Add to Home Screen' : 'Get the app on your phone'}
                        </div>
                    </div>
                    <button
                        id="pwa-install-btn-banner"
                        onClick={handleInstallClick}
                        disabled={installing}
                        style={{
                            background: '#22c55e',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.55rem 1.1rem',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            opacity: installing ? 0.7 : 1
                        }}
                    >
                        {installing ? 'Installing…' : 'Install App 📱'}
                    </button>
                </div>
                {guideModalOpen && <InstallGuideModal />}
            </>
        );
    }

    // Default 'button' variant
    return (
        <>
            <button
                id="pwa-install-btn"
                onClick={handleInstallClick}
                disabled={installing}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.9rem 1.8rem',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
                    transition: 'all 0.15s ease',
                    opacity: installing ? 0.7 : 1,
                    ...style
                }}
                onMouseEnter={(e) => { if (!installing) (e.currentTarget.style.transform = 'translateY(-2px)'); }}
                onMouseLeave={(e) => { (e.currentTarget.style.transform = 'translateY(0)'); }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                    {isIOS ? 'ios_share' : 'smartphone'}
                </span>
                <span>{installing ? 'Installing…' : isIOS ? 'Add to Home Screen' : 'Install BharatFarm 📱'}</span>
            </button>
            {guideModalOpen && <InstallGuideModal />}
        </>
    );
};
