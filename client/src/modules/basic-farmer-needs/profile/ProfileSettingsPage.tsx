import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@core/ui/Card';
import { Input } from '@core/ui/Input';
import { Button } from '@core/ui/Button';
import { useAuth } from '@core/context/AuthContext';
import { useLanguage } from '@core/context/LanguageContext';

import { ProfileService } from '../../../services/profile.service';

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateProfile: updateAuthUser, profileImage, setProfileImage, getUserInitials, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'offline' | 'security'>('account');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [name, setName] = useState(user?.fullName || 'Ramesh Patel');
  const [phone, setPhone] = useState(user?.phone || '+91 9831200001');
  const [state, setState] = useState(user?.state || 'Punjab');
  const [district, setDistrict] = useState(user?.district || 'Ludhiana');
  const [landAcres, setLandAcres] = useState<string>(user?.landSizeAcres ? String(user.landSizeAcres) : '5.0');
  const [primaryCropsStr, setPrimaryCropsStr] = useState<string>(user?.primaryCrops ? user.primaryCrops.join(', ') : 'Wheat, Rice');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load server-persisted profile on mount
  React.useEffect(() => {
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
        
        updateAuthUser({
          fullName: p.fullName,
          phone: p.phoneNumber,
          state: p.state,
          district: p.district,
          landSizeAcres: p.landSizeAcres,
          primaryCrops: p.primaryCrops,
          preferredLanguage: p.preferredLanguage,
          avatarUrl: p.avatarUrl
        });
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image size exceeds 2MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setProfileImage(dataUrl);
        ProfileService.updateProfile({ avatarUrl: dataUrl }).catch(() => {});
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    ProfileService.updateProfile({ avatarUrl: '' }).catch(() => {});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSaved(false);

    try {
      const parsedLand = parseFloat(landAcres);
      if (isNaN(parsedLand) || parsedLand < 0) {
        setErrorMsg('Land size must be a valid positive number');
        setIsSaving(false);
        return;
      }

      const cropsList = primaryCropsStr
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

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
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg(res.error?.message || 'Failed to update farmer profile');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred while saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Farmer Account Control</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Profile & Account Settings
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage your personal profile, photo avatar, land records, offline sync, and security options.
          </p>
        </div>

        <Button type="button" variant="danger" size="md" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          Sign Out
        </Button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid-dashboard">
        {/* Left Column (Span 4): Settings Navigation & Avatar Control */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* User Profile & Image Avatar Card */}
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-default)' }}>
              {/* Profile Image Avatar Circle */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--signal-lime)',
                border: '3px solid var(--border-lime)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--text-on-lime)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {profileImage ? (
                  <img src={profileImage} alt="Farmer Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getUserInitials()
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', marginTop: '0.15rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>location_on</span> {district}, {state}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--emerald-primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                  {user?.email}
                </p>
              </div>

              {/* Photo Avatar Upload / Change Controls */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>photo_camera</span> {profileImage ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {profileImage && (
                  <Button type="button" variant="danger" size="sm" onClick={handleRemoveImage}>
                    Remove
                  </Button>
                )}
              </div>
              {imageError && (
                <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{imageError}</p>
              )}
            </div>

            {/* Vertical Navigation Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
              {[
                { id: 'account' as const, label: '👤 Account & Land Info' },
                { id: 'preferences' as const, label: '🎛️ Language & Preferences' },
                { id: 'offline' as const, label: '☁️ Offline & Telemetry Sync' },
                { id: 'security' as const, label: '🛡️ Privacy & Security' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--signal-lime)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-on-lime)' : 'var(--text-primary)',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Sync Status Card */}
          <Card title="Offline Telemetry Status">
            <div className="alert-success" style={{ padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Sync Status</span>
                <span className="badge badge-primary">Up to date</span>
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.35rem' }}>
                Last synchronized: Just now (Auto PWA sync enabled)
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column (Span 8): Settings Form Area */}
        <div className="col-span-8">
          <Card title={activeTab === 'account' ? 'Account & Personal Information' : activeTab === 'preferences' ? 'App & Language Preferences' : activeTab === 'offline' ? 'Offline & Data Sync' : 'Privacy & Security Controls'}>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              {activeTab === 'account' && (
                <>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Personal Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                    <Input label="Mobile Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.2rem' }}>Land & Farm Registration</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <Input label="State" value={state} onChange={e => setState(e.target.value)} required />
                    <Input label="District" value={district} onChange={e => setDistrict(e.target.value)} required />
                    <Input label="Total Cultivated Area (Acres)" type="number" step="0.1" value={landAcres} onChange={e => setLandAcres(e.target.value)} required />
                    <Input label="Primary Crops (comma-separated)" value={primaryCropsStr} onChange={e => setPrimaryCropsStr(e.target.value)} placeholder="Wheat, Rice, Cotton" required />
                  </div>
                </>
              )}

              {activeTab === 'preferences' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Primary Language</label>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="input-field"
                      style={{
                        padding: '0.65rem 1rem',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    >
                      <option value="en">English (US/IN)</option>
                      <option value="hi">हिंदी (Hindi)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'offline' && (
                <div className="inset-stat" style={{ padding: '1rem' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Local Cache Storage</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    2.4 MB of weather forecasts, crop diagnostic guides, and offline forms cached locally.
                  </p>
                  <Button type="button" variant="secondary" size="sm" style={{ marginTop: '0.75rem' }}>Clear Local Storage Cache</Button>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="inset-stat" style={{ padding: '1rem' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Aadhaar & KCC Verification Status</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Your identity is verified under PM-KISAN beneficiary record #492019.
                  </p>
                </div>
              )}

              {errorMsg && <p style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.5rem' }}>❌ {errorMsg}</p>}
              {saved && <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.5rem' }}>✓ Settings updated and saved to server!</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

