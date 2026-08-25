import React, { useState, useRef } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateProfile, profileImage, setProfileImage, getUserInitials } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'offline' | 'security'>('account');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const savedProfile = (() => {
    try {
      const data = localStorage.getItem('bf_user_profile');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  })();

  const [name, setName] = useState(savedProfile.name || user?.fullName || 'Ramesh Patel');
  const [phone, setPhone] = useState(savedProfile.phone || '+91 9831200001');
  const [state, setState] = useState(savedProfile.state || user?.state || 'Punjab');
  const [district, setDistrict] = useState(savedProfile.district || 'Ludhiana');
  const [landAcres, setLandAcres] = useState(savedProfile.landAcres || '5.0');
  const [saved, setSaved] = useState(false);

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
        setProfileImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('bf_user_profile', JSON.stringify({ name, phone, state, district, landAcres }));
    } catch {
      // ignore
    }
    updateProfile({ name, state });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Farmer Account Control</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Profile & Account Settings
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage your personal profile, photo avatar, land records, offline sync, and security options.
          </p>
        </div>
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
                    <Input label="Total Cultivated Area (Acres)" type="number" value={landAcres} onChange={e => setLandAcres(e.target.value)} required />
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

              {saved && <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.5rem' }}>✓ Settings updated and saved!</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
