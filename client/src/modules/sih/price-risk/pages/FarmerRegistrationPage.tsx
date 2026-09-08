import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext.js';
import { PriceRiskService, AVAILABLE_CROPS } from '../priceRisk.service.js';

type Step = 1 | 2 | 3;

const CROP_ICONS: Record<string, string> = {
  Paddy: '🌾', Wheat: '🌿', Cotton: '☁️', Sugarcane: '🎋', Maize: '🌽',
  Potato: '🥔', Mustard: '🌻', Soybean: '🫘', Tomato: '🍅',
  Chilli: '🌶️', Onion: '🧅', Garlic: '🧄', Brinjal: '🍆',
  Cucumber: '🥒', 'Bitter Gourd': '🥬', 'Bottle Gourd': '🥦',
  'Ridge Gourd': '🌿', Peas: '🟢', Coriander: '🌿', Watermelon: '🍉',
  Muskmelon: '🍈', Banana: '🍌', Papaya: '🍈'
};

const POPULAR_CROPS = ['Paddy', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Potato', 'Mustard', 'Soybean', 'Tomato'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export const FarmerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [landSizeAcres, setLandSizeAcres] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [gpsResolved, setGpsResolved] = useState(false);

  // Redirect if already registered
  useEffect(() => {
    if (user && PriceRiskService.hasRegistered(user.id)) {
      navigate('/sih/price-risk', { replace: true });
    }
  }, [user]);

  const handleGpsLocation = async () => {
    setGpsLoading(true);
    setGpsError('');
    try {
      const coords = await PriceRiskService.getCurrentLocation();
      const geo = await PriceRiskService.reverseGeocode(coords.latitude, coords.longitude);
      setDistrict(geo.district);
      setState(geo.state);
      setGpsResolved(true);
    } catch (err: any) {
      setGpsError(err.message || 'Location failed. Please enter manually.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleStep1Continue = () => {
    if (!selectedCrop) return;
    if (!fieldName.trim()) setFieldName(`My ${selectedCrop} Field`);
    setStep(2);
  };

  const handleStep2Continue = () => {
    if (!landSizeAcres || parseFloat(landSizeAcres) <= 0) return;
    if (!district.trim() || !state.trim()) return;
    setStep(3);
  };

  const handleSkipWalk = () => {
    // Demo mode — skip GPS walk, use entered data
    if (landSizeAcres && district && state) {
      handleStep2Continue();
    } else {
      // Set minimal defaults for skip
      setLandSizeAcres(prev => prev || '2');
      setDistrict(prev => prev || 'Purba Medinipur');
      setState(prev => prev || 'West Bengal');
      setStep(3);
    }
  };

  const handleFinish = () => {
    if (!user) return;
    PriceRiskService.saveFieldRegistration(user.id, {
      fieldName: fieldName || `My ${selectedCrop} Field`,
      crop: selectedCrop,
      landSizeAcres: parseFloat(landSizeAcres) || 2,
      district: district || 'Purba Medinipur',
      state: state || 'West Bengal'
    });
    navigate('/sih/price-risk');
  };

  const stepLabels = ['Select Crop', 'Walk Farm', 'Registered'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1.5rem 1rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Back + Title */}
      <div style={{ width: '100%', maxWidth: '560px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <button
            onClick={() => navigate('/home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontWeight: 700, fontSize: '0.9rem' }}
          >
            ← SIH
          </button>
          <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>My Fields (0)</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Field Mapping</h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.2rem 0 0', fontWeight: 500 }}>
          Walk the Farm · SIH Innovation Module
        </p>
      </div>

      {/* Step Progress */}
      <div style={{ width: '100%', maxWidth: '560px', display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {stepLabels.map((label, idx) => {
          const sn = (idx + 1) as Step;
          const isActive = step === sn;
          const isDone = step > sn;
          return (
            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                padding: '0.45rem 0.5rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 800,
                background: isActive ? '#16a34a' : isDone ? '#dcfce7' : 'rgba(255,255,255,0.8)',
                color: isActive ? '#fff' : isDone ? '#16a34a' : '#94a3b8',
                border: `2px solid ${isActive ? '#16a34a' : isDone ? '#86efac' : '#e2e8f0'}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                {isDone ? '✓' : sn}. {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '2rem 1.75rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        border: '1px solid rgba(22,163,74,0.12)'
      }}>

        {/* ── STEP 1: SELECT CROP ── */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>🗺️</span>
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Register New Field</h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Step 1: Choose crop and name your field</p>
              </div>
            </div>

            {/* Field Name */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>
                Field Label / Name
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={e => setFieldName(e.target.value)}
                placeholder={selectedCrop ? `My ${selectedCrop} Field` : 'e.g., North Paddy Field'}
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '1.5px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box',
                  outline: 'none', transition: 'border-color 0.15s',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Select Crop */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.6rem' }}>
                Select Crop
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                {POPULAR_CROPS.map(crop => (
                  <button
                    key={crop}
                    onClick={() => setSelectedCrop(crop)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '12px',
                      border: `2px solid ${selectedCrop === crop ? '#16a34a' : '#e2e8f0'}`,
                      background: selectedCrop === crop ? '#dcfce7' : '#f8fafc',
                      color: selectedCrop === crop ? '#15803d' : '#374151',
                      fontWeight: selectedCrop === crop ? 800 : 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{CROP_ICONS[crop] || '🌱'}</span>
                    <span>{crop}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStep1Continue}
              disabled={!selectedCrop}
              style={{
                width: '100%', padding: '0.95rem', borderRadius: '14px', border: 'none',
                background: selectedCrop ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#e2e8f0',
                color: selectedCrop ? '#ffffff' : '#94a3b8',
                fontSize: '1rem', fontWeight: 800, cursor: selectedCrop ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: selectedCrop ? '0 4px 14px rgba(22,163,74,0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Continue → Walk the Farm 🚶
            </button>
          </div>
        )}

        {/* ── STEP 2: WALK THE FARM ── */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>📍</span>
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Walk the Farm</h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Step 2: Set your field size and location</p>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid #bbf7d0' }}>
              <p style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700, margin: 0 }}>
                🌱 Registering: <strong>{selectedCrop}</strong>
                {fieldName && <span style={{ color: '#64748b', fontWeight: 500 }}> · {fieldName}</span>}
              </p>
            </div>

            {/* Land Size */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>
                Field Size (Acres)
              </label>
              <input
                type="number"
                min="0.1" max="100" step="0.1"
                value={landSizeAcres}
                onChange={e => setLandSizeAcres(e.target.value)}
                placeholder="e.g. 2.5"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
                  boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Location */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                placeholder="e.g. Purba Medinipur"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
                  boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
                  background: gpsResolved ? '#f0fdf4' : '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>
                State
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
                  boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
                  background: gpsResolved ? '#f0fdf4' : '#fff', cursor: 'pointer'
                }}
              >
                <option value="">Select state...</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* GPS Button */}
            <button
              onClick={handleGpsLocation}
              disabled={gpsLoading}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '12px',
                border: '1.5px solid #0ea5e9', background: '#f0f9ff',
                color: '#0284c7', fontWeight: 700, fontSize: '0.9rem',
                cursor: gpsLoading ? 'wait' : 'pointer', marginBottom: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
              }}
            >
              {gpsLoading ? '📡 Detecting location...' : gpsResolved ? '📍 Location detected ✓' : '📍 Use Current GPS Location'}
            </button>

            {gpsError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.65rem 0.85rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: '#dc2626' }}>
                ⚠️ {gpsError}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleSkipWalk}
                style={{
                  flex: 1, padding: '0.85rem', borderRadius: '12px',
                  border: '1.5px solid #e2e8f0', background: '#f8fafc',
                  color: '#64748b', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer'
                }}
              >
                Skip (Demo)
              </button>
              <button
                onClick={handleStep2Continue}
                disabled={!landSizeAcres || !district || !state}
                style={{
                  flex: 2, padding: '0.85rem', borderRadius: '12px', border: 'none',
                  background: (landSizeAcres && district && state) ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#e2e8f0',
                  color: (landSizeAcres && district && state) ? '#fff' : '#94a3b8',
                  fontWeight: 800, fontSize: '0.95rem',
                  cursor: (landSizeAcres && district && state) ? 'pointer' : 'not-allowed',
                  boxShadow: (landSizeAcres && district && state) ? '0 4px 14px rgba(22,163,74,0.3)' : 'none'
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: REGISTERED ── */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem' }}>Field Registered!</h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Your <strong>{selectedCrop}</strong> field has been registered.
              You can now access the <strong>Price Risk Advisor</strong> to check
              market-risk before sowing.
            </p>

            <div style={{
              background: '#f0fdf4', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem',
              border: '1px solid #bbf7d0', textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Registration Summary
              </div>
              {[
                { label: 'Crop', value: selectedCrop },
                { label: 'Field Name', value: fieldName || `My ${selectedCrop} Field` },
                { label: 'Land Size', value: `${landSizeAcres || '2'} acres` },
                { label: 'Location', value: `${district || 'Purba Medinipur'}, ${state || 'West Bengal'}` }
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #dcfce7' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              style={{
                width: '100%', padding: '1rem', borderRadius: '14px', border: 'none',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#ffffff', fontSize: '1rem', fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 4px 18px rgba(22,163,74,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              🌾 Check Price Risk Now →
            </button>
          </div>
        )}
      </div>

      {/* Footer note */}
      <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', maxWidth: '400px' }}>
        Registration stores your field data locally. Only aggregated regional statistics are used for risk analysis — your personal information is never shared.
      </p>
    </div>
  );
};
