import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'warning' | 'weather' | 'insurance' | 'scheme' | 'mandi';
    icon: string;
    color: string;
    bg: string;
    read: boolean;
    link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
    {
        id: '1',
        title: 'Price-Decrement Warning',
        message: 'High arrival expected for Tomato in Purba Medinipur next week. Check Before You Sow risk score.',
        time: '2 mins ago',
        type: 'warning',
        icon: 'warning',
        color: '#D97706',
        bg: '#FEF3C7',
        read: false,
        link: '/sih/price-risk'
    },
    {
        id: '2',
        title: 'Monsoon Weather Telemetry',
        message: 'Low pressure over Bay of Bengal approaching coastal West Bengal. Prepare field drainage.',
        time: '1 hour ago',
        type: 'weather',
        icon: 'thunderstorm',
        color: '#2563EB',
        bg: '#EFF6FF',
        read: false,
        link: '/sih/climate-risk'
    },
    {
        id: '3',
        title: 'Satellite NDVI Claim Verification',
        message: 'Satellite scan completed for North Paddy Field. Vegetation Index (NDVI: 0.74 - Healthy).',
        time: '4 hours ago',
        type: 'insurance',
        icon: 'verified_user',
        color: '#059669',
        bg: '#ECFDF5',
        read: false,
        link: '/sih/crop-insurance'
    },
    {
        id: '4',
        title: 'PM-KISAN Installment Credited',
        message: 'Direct benefit transfer of ₹2,000 credited under 17th PM-KISAN installment.',
        time: 'Yesterday',
        type: 'scheme',
        icon: 'account_balance',
        color: '#7C3AED',
        bg: '#F5F3FF',
        read: true,
        link: '/schemes'
    },
    {
        id: '5',
        title: 'Smart Mandi Price Update',
        message: 'Wheat mandi price in Haldia rose by ₹120/qtl to ₹2,350/qtl today.',
        time: '2 days ago',
        type: 'mandi',
        icon: 'trending_up',
        color: '#EA580C',
        bg: '#FFF7ED',
        read: true,
        link: '/sih/smart-mandi'
    }
];

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleItemClick = (notification: NotificationItem) => {
        // Mark as read
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        onClose();
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(3px)',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease'
                }}
            />

            {/* Slide-over Panel */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    maxWidth: '420px',
                    background: '#FFFFFF',
                    zIndex: 1001,
                    boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                }}
            >
                {/* Drawer Header */}
                <div
                    style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#F8FAFC'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#16A34A' }}>
                            notifications_active
                        </span>
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                                Notifications
                            </h2>
                            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up ✓'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{
                                    background: '#DCFCE7',
                                    color: '#15803D',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Mark all read
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            style={{
                                background: '#F1F5F9',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#64748B',
                                cursor: 'pointer'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                        </button>
                    </div>
                </div>

                {/* Notification Items List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {notifications.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                style={{
                                    background: item.read ? '#FFFFFF' : '#F0FDF4',
                                    border: `1px solid ${item.read ? '#E2E8F0' : '#BBF7D0'}`,
                                    borderRadius: '14px',
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    transition: 'transform 0.15s ease, boxShadow 0.15s ease',
                                    position: 'relative',
                                    boxShadow: item.read ? '0 1px 3px rgba(0,0,0,0.03)' : '0 4px 12px rgba(22,163,74,0.08)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = item.read ? '0 1px 3px rgba(0,0,0,0.03)' : '0 4px 12px rgba(22,163,74,0.08)';
                                }}
                            >
                                {/* Unread indicator dot */}
                                {!item.read && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: '#16A34A'
                                        }}
                                    />
                                )}

                                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                                    {/* Icon Badge */}
                                    <div
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '10px',
                                            background: item.bg,
                                            color: item.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                            {item.icon}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                                {item.title}
                                            </h3>
                                            <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                {item.time}
                                            </span>
                                        </div>

                                        <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0.3rem 0 0 0', lineHeight: 1.4 }}>
                                            {item.message}
                                        </p>

                                        {item.link && (
                                            <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 700, color: '#16A34A' }}>
                                                <span>Open Feature</span>
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Drawer Footer */}
                <div style={{ padding: '1rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
                        BharatFarm Real-Time Agricultural Alert System
                    </span>
                </div>
            </div>
        </>
    );
};
