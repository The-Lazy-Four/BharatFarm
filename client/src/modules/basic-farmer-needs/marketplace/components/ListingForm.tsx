import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@core/ui/Input';
import { Button } from '@core/ui/Button';
import { CreateListingInput } from '../types/marketplace.types';
import { MARKETPLACE_CONSTANTS } from '../constants/marketplace.constants';

/**
 * Adapted from the OLD project's sell form (`handleSellSubmit` in
 * js/marketplace.js). The old form used an AI crop-metadata lookup to
 * auto-fill an image and category; that lookup is out of scope for this
 * migration (not one of the approved features), so category is a plain
 * select here and the seller enters their own details directly.
 */

interface CropLookupResult {
  isCrop: boolean;
  name: string;
  imageUrl: string | null;
  description: string | null;
}

export const ListingForm: React.FC<{ onSubmit: (data: CreateListingInput) => Promise<void> | void }> = ({ onSubmit }) => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [locality, setLocality] = useState('');
  const [form, setForm] = useState<CreateListingInput>({
    title: '',
    category: 'crops',
    price: 0,
    unit: 'kg',
    quantityAvailable: 0,
    location: '',
    sellerPhone: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Crop image preview state
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropLookupStatus, setCropLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const update = (field: keyof CreateListingInput, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const inputStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid rgba(17, 24, 39, 0.25)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem 1rem',
    color: '#111827',
    WebkitTextFillColor: '#111827',
    caretColor: '#111827',
    fontSize: '1rem',
    fontWeight: 500,
    fontFamily: 'var(--font-family)',
    minHeight: '48px',
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#EAF4E4',
    letterSpacing: '0.02em',
    fontFamily: 'var(--font-family)'
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'auto' as const,
    cursor: 'pointer'
  };

  // ── Crop image lookup with debounce ──────────────────────────
  const lookupCropImage = useCallback(async (cropName: string) => {
    if (!cropName.trim() || cropName.trim().length < 2) {
      setCropImage(null);
      setCropLookupStatus('idle');
      return;
    }

    // Abort previous request if pending
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setCropLookupStatus('loading');

    try {
      const resp = await fetch(`/api/marketplace/crop-lookup?q=${encodeURIComponent(cropName.trim())}`, {
        signal: controller.signal
      });
      const data = await resp.json();

      if (controller.signal.aborted) return;

      if (data.success && data.data?.isCrop && data.data?.imageUrl) {
        setCropImage(data.data.imageUrl);
        setCropLookupStatus('found');
      } else if (data.success && data.data?.isCrop && !data.data?.imageUrl) {
        setCropImage(null);
        setCropLookupStatus('found'); // It's a crop, just no image
      } else {
        setCropImage(null);
        setCropLookupStatus('not-found');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setCropImage(null);
        setCropLookupStatus('idle');
      }
    }
  }, []);

  const handleTitleChange = (value: string) => {
    update('title', value);

    // Debounce the crop lookup (600ms after user stops typing)
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setCropImage(null);
      setCropLookupStatus('idle');
      return;
    }

    debounceTimer.current = setTimeout(() => {
      lookupCropImage(value);
    }, 600);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ── Location helpers ─────────────────────────────────────────
  const updateLocation = (district: string, state: string, area = locality) => {
    const location = [area.trim(), district.trim(), state.trim()].filter(Boolean).join(', ');
    setForm(prev => ({ ...prev, location }));
  };

  const updateState = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict('');
    updateLocation('', state);
  };

  const updateDistrict = (district: string) => {
    setSelectedDistrict(district);
    updateLocation(district, selectedState);
  };

  const updateLocality = (value: string) => {
    setLocality(value);
    updateLocation(selectedDistrict, selectedState, value);
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) return setError('Please enter a listing title.');
    if (form.price <= 0) return setError('Price must be greater than 0.');
    if (form.quantityAvailable <= 0) return setError('Quantity must be greater than 0.');
    if (!selectedState) return setError('Please select your state.');
    if (!selectedDistrict.trim()) return setError('Please select or type your district.');
    if (!form.location.trim()) return setError('Please enter your location.');
    if (!form.sellerPhone?.trim()) return setError('Mobile number is required.');
    if (!/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(form.sellerPhone.replace(/\s/g, ''))) {
      return setError('Enter a valid 10 digit Indian mobile number.');
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...form,
        imageUrl: cropImage || undefined
      });
      setSelectedState('');
      setSelectedDistrict('');
      setLocality('');
      setCropImage(null);
      setCropLookupStatus('idle');
      setForm({ title: '', category: 'crops', price: 0, unit: 'kg', quantityAvailable: 0, location: '', sellerPhone: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSubmit}>

      {/* ── Crop / Product Name with Image Preview ─────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={labelStyle}>Crop / Product Name</label>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input
              placeholder="Type or select crop"
              list="marketplace-crop-options"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              style={inputStyle}
              autoComplete="off"
            />
          </div>

          {/* Crop Image Preview Box */}
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: 'var(--radius-sm)',
            border: cropImage
              ? '2px solid var(--signal-lime)'
              : '2px dashed rgba(255,255,255,0.25)',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: cropImage ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}>
            {cropLookupStatus === 'loading' && (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(200,226,26,0.3)',
                borderTopColor: 'var(--signal-lime)',
                borderRadius: '50%',
                animation: 'cropSpin 0.7s linear infinite'
              }} />
            )}

            {cropImage && cropLookupStatus === 'found' && (
              <img
                src={cropImage}
                alt={form.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  animation: 'cropFadeIn 0.35s ease-out'
                }}
                onError={() => {
                  setCropImage(null);
                  setCropLookupStatus('found');
                }}
              />
            )}

            {!cropImage && cropLookupStatus === 'found' && (
              <span className="material-symbols-outlined" style={{
                fontSize: '24px',
                color: 'var(--signal-lime)',
                opacity: 0.7
              }}>eco</span>
            )}

            {cropLookupStatus === 'not-found' && (
              <span className="material-symbols-outlined" style={{
                fontSize: '20px',
                color: 'var(--danger)',
                opacity: 0.6
              }}>block</span>
            )}

            {cropLookupStatus === 'idle' && (
              <span className="material-symbols-outlined" style={{
                fontSize: '22px',
                color: 'rgba(255,255,255,0.2)'
              }}>image</span>
            )}
          </div>
        </div>

        {/* Status text */}
        {cropLookupStatus === 'not-found' && form.title.trim().length >= 2 && (
          <span style={{ fontSize: '0.72rem', color: 'var(--danger)', opacity: 0.85 }}>
            ⚠ Not recognized as a crop or agricultural product
          </span>
        )}

        {cropLookupStatus === 'found' && cropImage && (
          <span style={{ fontSize: '0.72rem', color: 'var(--signal-lime)', opacity: 0.85 }}>
            ✓ Crop identified
          </span>
        )}
      </div>

      {/* Inline keyframes for spinner and fade-in */}
      <style>{`
        @keyframes cropSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes cropFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <datalist id="marketplace-crop-options">
        {MARKETPLACE_CONSTANTS.CROPS.map(crop => (
          <option key={crop} value={crop} />
        ))}
      </datalist>

      {/* ── Category ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={labelStyle}>Category</label>
        <select
          value={form.category}
          onChange={e => update('category', e.target.value)}
          style={selectStyle}
        >
          {MARKETPLACE_CONSTANTS.CATEGORIES.filter(cat => cat !== 'all').map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* ── Price + Unit ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 2 }}>
          <label style={labelStyle}>Price (₹)</label>
          <input
            type="number"
            placeholder="2500"
            value={form.price || ''}
            onChange={e => update('price', Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <label style={labelStyle}>Unit</label>
          <select value={form.unit} onChange={e => update('unit', e.target.value)} style={selectStyle}>
            {MARKETPLACE_CONSTANTS.UNITS.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Quantity ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={labelStyle}>Quantity Available</label>
        <input
          type="number"
          placeholder="10"
          value={form.quantityAvailable || ''}
          onChange={e => update('quantityAvailable', Number(e.target.value))}
          style={inputStyle}
        />
      </div>

      {/* ── State + District ──────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <label style={labelStyle}>State</label>
          <select value={selectedState} onChange={e => updateState(e.target.value)} style={selectStyle} required>
            <option value="">Select State</option>
            {MARKETPLACE_CONSTANTS.STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <label style={labelStyle}>District</label>
          <input
            list="marketplace-district-options"
            placeholder="Select District"
            value={selectedDistrict}
            onChange={e => updateDistrict(e.target.value)}
            style={inputStyle}
            disabled={!selectedState}
            required
          />
          <datalist id="marketplace-district-options">
            {(MARKETPLACE_CONSTANTS.DISTRICTS_BY_STATE[selectedState] || []).map(district => (
              <option key={district} value={district} />
            ))}
          </datalist>
        </div>
      </div>

      {/* ── Locality ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={labelStyle}>Locality / Village</label>
        <input
          placeholder="Enter village or area name"
          value={locality}
          onChange={e => updateLocality(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* ── Mobile Number ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={labelStyle}>Mobile Number (WhatsApp / Call)</label>
        <input
          type="tel"
          placeholder="10 digit mobile number"
          value={form.sellerPhone}
          onChange={e => update('sellerPhone', e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

      <Button type="submit" isLoading={isSubmitting}>
        Post Agri Listing
      </Button>
    </form>
  );
};

