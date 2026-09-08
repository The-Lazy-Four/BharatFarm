import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { PriceRiskService } from '../../modules/sih/price-risk/priceRisk.service.js';
import { ProfileService } from '../../services/profile.service.js';

export const FarmerProfilePage: React.FC = () => {
    const { user, logout, updateProfile: updateAuthUser, profileImage, setProfileImage, getUserInitials } = useAuth();
    const { language, setLanguage } = useLanguage();
    const navigate = useNavigate();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    const [name, setName] = useState(user?.fullName || 'Souvik Dey');
    const [phone, setPhone] = useState(user?.phone || '+91 9831200001');
    const [state, setState] = useState(user?.state || 'West Bengal');
    const [district, setDistrict] = useState(user?.district || 'Purba Medinipur');
    const [landAcres, setLandAcres] = useState<string>(user?.landSizeAcres ? String(user.landSizeAcres) : '5.0');
    const [primaryCropsStr, setPrimaryCropsStr] = useState<string>(user?.primaryCrops ? user.primaryCrops.join(', ') : 'Paddy, Mustard, Tomato');

    const [smsAlerts, setSmsAlerts] = useState(true);
    const [whatsappAlerts, setWhatsappAlerts] = useState(true);
    const [pushAlerts, setPushAlerts] = useState(true);

    const [isSaving, setIsSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Load field registration info
    const fieldReg = PriceRiskService.getFieldRegistration(user?.id || 'demo_farmer') || {
        fieldName: 'North Paddy Field',
        crop: 'Paddy',
        landSizeAcres: 0.4,
        district: 'Haldia',
        state: 'West Bengal'
    };

    useEffect(() => {
        let isMounted = true;
        ProfileService.getProfile().then(res => {
            if (isMounted && res.success && res.data) {
                const p = res.data;
                setName(p.fullName);
                if (p.phoneNumber) setPhone(p.phoneNumber);
                if (p.state) setState(p.state);
                if (p.district) setDistrict(p.district);
                if (p.landSizeAcres != null) setLandAcres(String(p.landSizeAcres));
                if (p.primaryCrops) setPrimaryCropsStr(p.primaryCrops.join(', '));
                if (p.avatarUrl) setProfileImage(p.avatarUrl);
            }
        }).catch(() => { });
        return () => { isMounted = false; };
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setImageError('Please select a valid photo file (JPG, PNG, WEBP).');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setImageError('Image size exceeds 2MB limit.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                const dataUrl = reader.result;
                setProfileImage(dataUrl);
                ProfileService.updateProfile({ avatarUrl: dataUrl }).catch(() => { });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setProfileImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        ProfileService.updateProfile({ avatarUrl: '' }).catch(() => { });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMsg(null);
        setSavedSuccess(false);

        try {
            const parsedLand = parseFloat(landAcres);
            if (isNaN(parsedLand) || parsedLand < 0) {
                setErrorMsg('Cultivated area must be a positive number.');
                setIsSaving(false);
                return;
            }

            const cropsList = primaryCropsStr.split(',').map(c => c.trim()).filter(Boolean);

            const res = await ProfileService.updateProfile({
                fullName: name,
                phone,
                state,
                district,
                landSizeAcres: parsedLand,
                primaryCrops: cropsList,
                preferredLanguage: language
            });

            if (res.success && res.data) {
                updateAuthUser({
                    fullName: res.data.fullName,
                    phone: res.data.phoneNumber,
                    state: res.data.state,
                    district: res.data.district,
                    landSizeAcres: res.data.landSizeAcres,
                    primaryCrops: res.data.primaryCrops,
                    preferredLanguage: res.data.preferredLanguage
                });
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 3000);
            } else {
                setErrorMsg(res.error?.message || 'Failed to update farmer profile');
            }
        } catch (err: any) {
            setErrorMsg(err?.message || 'An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#F8FAFC',
            color: '#0F172A',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            paddingBottom: '3rem'
        }}>
            {/* Top Header Navigation */}
            <header style={{
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/home')}
                        style={{
                            background: '#F1F5F9',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.45rem 0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            color: '#334155',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                        Back to Platform
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img src="/icons/icon-96.png" alt="BharatFarm" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>Farmer Profile & Settings</span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                    Sign Out
                </button>
            </header>

            {/* Main Container */}
            <main style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

                {/* Profile Card Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #052E16 0%, #14532D 60%, #166534 100%)',
                    borderRadius: '20px',
                    padding: '2rem',
                    color: '#FFFFFF',
                    boxShadow: '0 10px 25px -5px rgba(20, 83, 45, 0.25)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 2 }}>
                        {/* Avatar Circle */}
                        <div style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            background: '#22C55E',
                            border: '4px solid rgba(255, 255, 255, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.2rem',
                            fontWeight: 900,
                            color: '#FFFFFF',
                            overflow: 'hidden',
                            flexShrink: 0,
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
                        }}>
                            {profileImage ? (
                                <img src={profileImage} alt="Farmer Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                getUserInitials()
                            )}
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{name}</h1>
                                <span style={{
                                    background: '#DCFCE7',
                                    color: '#15803D',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem'
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span>
                                    Verified PM-KISAN Farmer
                                </span>
                            </div>

                            <p style={{ margin: '0.35rem 0 0 0', opacity: 0.9, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                                {district}, {state} &nbsp;•&nbsp; 📞 {phone}
                            </p>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" style={{ display: 'none' }} />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        color: '#FFFFFF',
                                        border: '1px solid rgba(255, 255, 255, 0.4)',
                                        borderRadius: '8px',
                                        padding: '0.35rem 0.75rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        backdropFilter: 'blur(4px)'
                                    }}
                                >
                                    {profileImage ? 'Change Photo' : 'Upload Photo'}
                                </button>
                                {profileImage && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.3)',
                                            color: '#FCA5A5',
                                            border: '1px solid rgba(239, 68, 68, 0.4)',
                                            borderRadius: '8px',
                                            padding: '0.35rem 0.75rem',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            {imageError && <p style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '0.35rem' }}>{imageError}</p>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', zIndex: 2 }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Farm</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.1rem' }}>{landAcres} Acres</div>
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Crop</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.1rem' }}>{primaryCropsStr.split(',')[0]}</div>
                        </div>
                    </div>
                </div>

                {/* 2-Column Grid Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>

                    {/* Left Column: Personal & Agricultural Settings Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                                <span className="material-symbols-outlined" style={{ color: '#16A34A', fontSize: '24px' }}>person</span>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Farmer Details & Land Info</h2>
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                        Full Farmer Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.65rem 0.9rem',
                                            borderRadius: '10px',
                                            border: '1px solid #CBD5E1',
                                            fontSize: '0.92rem',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                            Mobile Phone
                                        </label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.9rem',
                                                borderRadius: '10px',
                                                border: '1px solid #CBD5E1',
                                                fontSize: '0.92rem',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                            Cultivated Area (Acres)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={landAcres}
                                            onChange={e => setLandAcres(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.9rem',
                                                borderRadius: '10px',
                                                border: '1px solid #CBD5E1',
                                                fontSize: '0.92rem',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                            District
                                        </label>
                                        <input
                                            type="text"
                                            value={district}
                                            onChange={e => setDistrict(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.9rem',
                                                borderRadius: '10px',
                                                border: '1px solid #CBD5E1',
                                                fontSize: '0.92rem',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            value={state}
                                            onChange={e => setState(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.9rem',
                                                borderRadius: '10px',
                                                border: '1px solid #CBD5E1',
                                                fontSize: '0.92rem',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                        Primary Crops Cultivated
                                    </label>
                                    <input
                                        type="text"
                                        value={primaryCropsStr}
                                        onChange={e => setPrimaryCropsStr(e.target.value)}
                                        placeholder="Paddy, Wheat, Mustard"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.65rem 0.9rem',
                                            borderRadius: '10px',
                                            border: '1px solid #CBD5E1',
                                            fontSize: '0.92rem',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                        App Interface Language
                                    </label>
                                    <select
                                        value={language}
                                        onChange={e => setLanguage(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.65rem 0.9rem',
                                            borderRadius: '10px',
                                            border: '1px solid #CBD5E1',
                                            fontSize: '0.92rem',
                                            background: '#FFFFFF',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="en">English (US/IN)</option>
                                        <option value="hi">हिंदी (Hindi)</option>
                                        <option value="bn">বাংলা (Bengali)</option>
                                    </select>
                                </div>

                                {errorMsg && <p style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>❌ {errorMsg}</p>}
                                {savedSuccess && <p style={{ color: '#16A34A', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>✓ Profile settings updated successfully!</p>}

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    style={{
                                        marginTop: '0.5rem',
                                        background: '#16A34A',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '0.75rem',
                                        fontSize: '0.95rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease'
                                    }}
                                >
                                    {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: SIH Telemetry, Field Registration & Notification Settings */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Field Mapping Registration Card */}
                        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#16A34A', fontSize: '24px' }}>map</span>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Registered Farm Mapping</h2>
                                </div>
                                <span style={{ background: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>ACTIVE</span>
                            </div>

                            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                    <span style={{ color: '#64748B', fontWeight: 600 }}>Field Name:</span>
                                    <span style={{ fontWeight: 800, color: '#0F172A' }}>{fieldReg.fieldName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                    <span style={{ color: '#64748B', fontWeight: 600 }}>Primary Crop:</span>
                                    <span style={{ fontWeight: 800, color: '#0F172A' }}>{fieldReg.crop}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                    <span style={{ color: '#64748B', fontWeight: 600 }}>Mapped GPS Area:</span>
                                    <span style={{ fontWeight: 800, color: '#0F172A' }}>{fieldReg.landSizeAcres} Acres</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                    <span style={{ color: '#64748B', fontWeight: 600 }}>Location:</span>
                                    <span style={{ fontWeight: 800, color: '#0F172A' }}>{fieldReg.district}, {fieldReg.state}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/sih/field-mapping')}
                                style={{
                                    marginTop: '1.25rem',
                                    width: '100%',
                                    background: '#F0FDF4',
                                    color: '#16A34A',
                                    border: '1.5px solid #BBF7D0',
                                    borderRadius: '10px',
                                    padding: '0.65rem',
                                    fontSize: '0.88rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>my_location</span>
                                Walk the Farm / Update Field Boundaries
                            </button>
                        </div>

                        {/* Notification & Telemetry Preferences Card */}
                        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                <span className="material-symbols-outlined" style={{ color: '#16A34A', fontSize: '24px' }}>notifications_active</span>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Agricultural Alerts & Push Settings</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid #F1F5F9' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Web Push & PWA Notifications</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Receive urgent weather & price drop alerts</div>
                                    </div>
                                    <input type="checkbox" checked={pushAlerts} onChange={e => setPushAlerts(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#16A34A' }} />
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid #F1F5F9' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>WhatsApp Telemetry Updates</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Receive daily mandi price summaries via Sahayak</div>
                                    </div>
                                    <input type="checkbox" checked={whatsappAlerts} onChange={e => setWhatsappAlerts(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#16A34A' }} />
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.5rem 0' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>SMS Farmer Advisory</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Critical PM-KISAN & government scheme updates</div>
                                    </div>
                                    <input type="checkbox" checked={smsAlerts} onChange={e => setSmsAlerts(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#16A34A' }} />
                                </label>
                            </div>
                        </div>

                        {/* PWA & System Status */}
                        <div style={{ background: '#F0FDF4', borderRadius: '18px', padding: '1.25rem', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>Offline PWA Sync & Cache</div>
                                <div style={{ fontSize: '0.78rem', color: '#15803D', marginTop: '0.15rem' }}>All telemetry & crop data saved locally for offline use</div>
                            </div>
                            <span style={{ background: '#16A34A', color: '#FFFFFF', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                                ONLINE
                            </span>
                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
};
