// agent-edit-test
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'offline' | 'security'>('account');

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('bf_user_profile', JSON.stringify({ name, phone, state, district, landAcres }));
    } catch {
      // ignore
    }
    // Update the AuthContext so other pages sync reactively
    updateProfile({ name, state });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Farmer Account Control</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--dark-text)' }}>
            Profile & Account Settings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage your personal profile, land registration records, offline sync preferences, and security options.
          </p>
        </div>
      </div>

      {/* Main Grid Layout matching Stitch */}
      <div className="grid-dashboard">
        {/* Left Column (Span 4): Settings Navigation & Sync Telemetry (Stitch reference) */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* User Profile Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(34,37,31,0.1)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(215, 242, 26, 0.15)', border: '2px solid var(--signal-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                👨‍🌾
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark-text)' }}>{name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span> {district}, {state}
                </p>
              </div>
            </div>

            {/* Vertical Navigation Tabs matching Stitch */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
              {[
                { id: 'account', label: '👤 Account & Land Info' },
                { id: 'preferences', label: '🎛️ Language & Preferences' },
                { id: 'offline', label: '☁️ Offline & Telemetry Sync' },
                { id: 'security', label: '🛡️ Privacy & Security' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--signal-lime)' : 'transparent',
                    color: 'var(--dark-text)',
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

          {/* Sync Status Banner Card (Stitch reference) */}
          <Card title="Offline Telemetry Status">
            <div style={{ padding: '0.85rem', background: 'rgba(215, 242, 26, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--signal-lime)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-text)' }}>Sync Status</span>
                <span className="badge badge-primary">Up to date</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
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
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark-text)', marginBottom: '0.2rem' }}>Personal Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                    <Input label="Mobile Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark-text)', marginTop: '1rem', marginBottom: '0.2rem' }}>Land & Farm Registration</h4>
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
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid rgba(34,37,31,0.15)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.65rem 1rem',
                        color: 'var(--dark-text)',
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
                <div style={{ padding: '1rem', background: 'var(--card-gray)', borderRadius: '12px', border: '1px solid rgba(34,37,31,0.1)' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)' }}>Local Cache Storage</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    2.4 MB of weather forecasts, crop diagnostic guides, and offline forms cached locally.
                  </p>
                  <Button type="button" variant="secondary" size="sm" style={{ marginTop: '0.75rem' }}>Clear Local Storage Cache</Button>
                </div>
              )}

              {activeTab === 'security' && (
                <div style={{ padding: '1rem', background: 'var(--card-gray)', borderRadius: '12px', border: '1px solid rgba(34,37,31,0.1)' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)' }}>Aadhaar & KCC Verification Status</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Your identity is verified under PM-KISAN beneficiary record #492019.
                  </p>
                </div>
              )}

              {saved && <p style={{ color: 'var(--dark-text)', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.5rem' }}>✓ Settings updated and saved!</p>}

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
