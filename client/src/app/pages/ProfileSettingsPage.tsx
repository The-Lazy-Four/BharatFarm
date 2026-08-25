import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [name, setName] = useState(user?.fullName || 'Ramesh Patel');
  const [phone, setPhone] = useState('+91 9831200001');
  const [state, setState] = useState(user?.state || 'Punjab');
  const [district, setDistrict] = useState('Ludhiana');
  const [landAcres, setLandAcres] = useState('5.0');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="Farmer Profile & Account Settings" subtitle="Manage your personal details, farm location, preferred language, and notification preferences.">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
            <Input label="State" value={state} onChange={e => setState(e.target.value)} required />
            <Input label="District" value={district} onChange={e => setDistrict(e.target.value)} required />
            <Input label="Total Land Holding (Acres)" type="number" value={landAcres} onChange={e => setLandAcres(e.target.value)} required />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>App Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  padding: '0.66rem 1rem',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
              </select>
            </div>
          </div>

          {saved && <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Profile saved successfully!</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
