import React, { useState, useEffect, useRef } from 'react';
import { ClimateRiskService } from '../climateRisk.service';
import { GeocodeResult } from '../types';

interface Props {
  selectedLocation: string;
  selectedCrop: string;
  selectedStage: string;
  onLocationSelect: (loc: { displayName: string; lat: number; lon: number }) => void;
  onCropChange: (crop: string) => void;
  onStageChange: (stage: string) => void;
  onRefresh: () => void;
  isAnalyzing: boolean;
  dataSource: string;
}

export const TopSelectorHeader: React.FC<Props> = ({
  selectedLocation,
  selectedCrop,
  selectedStage,
  onLocationSelect,
  onCropChange,
  onStageChange,
  onRefresh,
  isAnalyzing,
  dataSource
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search for locations
  useEffect(() => {
    if (!isSearching || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      const results = await ClimateRiskService.geocodeLocation(searchQuery);
      setSuggestions(results);
      setLoadingSuggestions(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearching]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (loc: GeocodeResult) => {
    onLocationSelect({
      displayName: loc.displayName,
      lat: loc.latitude,
      lon: loc.longitude
    });
    setIsSearching(false);
    setSearchQuery('');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      borderRadius: '12px',
      padding: '1rem 1.25rem',
      color: '#FFFFFF',
      boxShadow: '0 4px 16px rgba(6, 78, 59, 0.18)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem'
    }}>
      {/* Top row: Title + Clean Source Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            background: '#22c55e',
            color: '#052e16',
            fontWeight: 900,
            fontSize: '0.72rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '4px',
            letterSpacing: '0.04em'
          }}>
            CLIMATE RISK PLANNER
          </span>
          <span style={{ fontSize: '0.82rem', color: '#a7f3d0', fontWeight: 600 }}>
            {selectedLocation} • {selectedCrop} ({selectedStage})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#86efac',
            padding: '0.2rem 0.5rem',
            borderRadius: '999px'
          }}>
            {dataSource.includes('LIVE') ? 'LIVE WEATHER • Open-Meteo' : 'DEMO WEATHER • Open-Meteo'}
          </span>
        </div>
      </div>

      {/* Control bar: Compact Location Search + Crop + Stage + Refresh */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.65rem',
        alignItems: 'center'
      }}>
        {/* Searchable Location Control */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          {!isSearching ? (
            <div
              onClick={() => { setIsSearching(true); setSearchQuery(''); }}
              style={{
                background: 'rgba(255, 255, 255, 0.09)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '8px',
                padding: '0.48rem 0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
              title="Click to search any location"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                <span style={{ color: '#4ade80', fontSize: '1rem' }}>📍</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {selectedLocation.split(',')[0]}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: 600, textDecoration: 'underline' }}>
                Change
              </span>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                autoFocus
                placeholder="Type city (e.g. Haldia, Kolkata)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.48rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #22c55e',
                  background: '#042f2e',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {/* Autocomplete dropdown */}
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: '#022c22',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                zIndex: 999,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                {loadingSuggestions ? (
                  <div style={{ padding: '0.6rem', fontSize: '0.75rem', color: '#a7f3d0', textAlign: 'center' }}>
                    Searching coordinates...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectLocation(loc)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        fontSize: '0.78rem'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#064e3b')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ fontWeight: 800, color: '#FFFFFF' }}>{loc.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country} • {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                      </div>
                    </div>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <div style={{ padding: '0.6rem', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                    No matching location found
                  </div>
                ) : (
                  <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#86efac' }}>
                    Popular: Haldia, Kolkata, Kharagpur, Burdwan, Ludhiana
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Crop dropdown */}
        <select
          value={selectedCrop}
          onChange={(e) => onCropChange(e.target.value)}
          style={{
            padding: '0.48rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.82rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="Paddy" style={{ background: '#022c22' }}>🌾 Paddy (Rice)</option>
          <option value="Wheat" style={{ background: '#022c22' }}>🌾 Wheat</option>
          <option value="Mustard" style={{ background: '#022c22' }}>🌱 Mustard</option>
          <option value="Maize" style={{ background: '#022c22' }}>🌽 Maize</option>
          <option value="Cotton" style={{ background: '#022c22' }}>☁️ Cotton</option>
          <option value="Jute" style={{ background: '#022c22' }}>🌿 Jute</option>
        </select>

        {/* Crop Stage dropdown */}
        <select
          value={selectedStage}
          onChange={(e) => onStageChange(e.target.value)}
          style={{
            padding: '0.48rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.82rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="Sowing" style={{ background: '#022c22' }}>Stage: Sowing</option>
          <option value="Vegetative" style={{ background: '#022c22' }}>Stage: Vegetative</option>
          <option value="Flowering" style={{ background: '#022c22' }}>Stage: Flowering</option>
          <option value="Grain Filling" style={{ background: '#022c22' }}>Stage: Grain Filling</option>
          <option value="Maturity" style={{ background: '#022c22' }}>Stage: Near Maturity</option>
          <option value="Ready to Harvest" style={{ background: '#022c22' }}>Stage: Ready to Harvest</option>
        </select>

        {/* Refresh / Re-analyze button */}
        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          style={{
            padding: '0.48rem 0.9rem',
            borderRadius: '8px',
            border: 'none',
            background: '#22c55e',
            color: '#052e16',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
          }}
        >
          <span>{isAnalyzing ? 'Analyzing...' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  );
};
