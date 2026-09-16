import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@core/ui/Input';
import { Button } from '@core/ui/Button';
import { CreateListingInput } from '../types/marketplace.types';
import { MARKETPLACE_CONSTANTS } from '../constants/marketplace.constants';
import { useLanguage } from '../../../../context/LanguageContext';

export const ListingForm: React.FC<{ onSubmit: (data: CreateListingInput) => Promise<void> | void }> = ({ onSubmit }) => {
  const { t } = useLanguage();
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
        setCropLookupStatus('found');
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

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) return setError(t('marketplace.errTitle'));
    if (form.price <= 0) return setError(t('marketplace.errPrice'));
    if (form.quantityAvailable <= 0) return setError(t('marketplace.errQuantity'));
    if (!selectedState) return setError(t('marketplace.errState'));
    if (!selectedDistrict.trim()) return setError(t('marketplace.errDistrict'));
    if (!form.location.trim()) return setError(t('marketplace.errLocation'));
    if (!form.sellerPhone?.trim()) return setError(t('marketplace.errMobile'));
    if (!/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(form.sellerPhone.replace(/\s/g, ''))) {
      return setError(t('marketplace.errMobileInvalid'));
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
        <label style={labelStyle}>{t('marketplace.cropProductName')}</label>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input
              placeholder={t('marketplace.cropNamePlaceholder')}
              list="marketplace-crop-options"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              style={inputStyle}
              autoComplete="off"
            />
          </div>

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
            {t('marketplace.cropNotRecognized')}
          </span>
        )}

        {cropLookupStatus === 'found' && cropImage && (
          <span style={{ fontSize: '0.72rem', color: 'var(--signal-lime)', opacity: 0.85 }}>
            {t('marketplace.cropIdentified')}
          </span>
        )}
      </div>

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
        <label style={labelStyle}>{t('basicNeeds.filterCategory')}</label>
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
          <label style={labelStyle}>{t('marketplace.priceLabel')}</label>
          <input
            type="number"
            placeholder="2500"
            value={form.price || ''}
            onChange={e => update('price', Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <label style={labelStyle}>{t('marketplace.unitLabel')}</label>
          <select value={form.unit} onChange={e => update('unit', e.target.value)} style={selectStyle}>
            {MARKETPLACE_CONSTANTS.UNITS.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Quantity ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={labelStyle}>{t('marketplace.quantityLabel')}</label>
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
          <label style={labelStyle}>{t('auth.state')}</label>
          <select value={selectedState} onChange={e => updateState(e.target.value)} style={selectStyle} required>
            <option value="">{t('auth.selectState')}</option>
            {MARKETPLACE_CONSTANTS.STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <label style={labelStyle}>{t('auth.district')}</label>
          <input
            list="marketplace-district-options"
            placeholder={t('auth.selectDistrict')}
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
        <label style={labelStyle}>{t('marketplace.localityLabel')}</label>
        <input
          placeholder={t('marketplace.localityPlaceholder')}
          value={locality}
          onChange={e => updateLocality(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* ── Mobile Number ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={labelStyle}>{t('marketplace.mobileLabel')}</label>
        <input
          type="tel"
          placeholder={t('marketplace.mobilePlaceholder')}
          value={form.sellerPhone}
          onChange={e => update('sellerPhone', e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

      <Button type="submit" isLoading={isSubmitting}>
        {t('marketplace.postListingBtn')}
      </Button>
    </form>
  );
};

