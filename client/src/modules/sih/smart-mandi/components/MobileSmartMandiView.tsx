import React, { useState } from 'react';
import { SmartMandiService, MandiRoute } from '../smartMandi.service.js';
import { FieldRecord } from '../../field-mapping/fieldMapping.service.js';
import { useAuth } from '../../../../context/AuthContext.js';
import { useLanguage } from '../../../../context/LanguageContext.js';
import type {
  BuyerRequirement,
  FarmerSupply,
  SupplyPool,
  SmartCollectionPlan,
  MandiNotification
} from '@bharatfarm/shared';

interface MobileSmartMandiViewProps {
  // Tab control
  activeTab: 'buy' | 'sell' | 'mandi-rates' | 'notifications';
  setActiveTab: (tab: 'buy' | 'sell' | 'mandi-rates' | 'notifications') => void;

  // Buyer state & handlers
  buyerCrop: string;
  setBuyerCrop: (v: string) => void;
  buyerQty: string;
  setBuyerQty: (v: string) => void;
  buyerPrice: string;
  setBuyerPrice: (v: string) => void;
  buyerDistrict: string;
  setBuyerDistrict: (v: string) => void;
  buyerVillage: string;
  setBuyerVillage: (v: string) => void;
  buyerPostOffice: string;
  setBuyerPostOffice: (v: string) => void;
  buyerState: string;
  setBuyerState: (v: string) => void;
  buyerRadius: string;
  setBuyerRadius: (v: string) => void;
  buyerDeadline: string;
  setBuyerDeadline: (v: string) => void;
  buyerLat?: number;
  buyerLng?: number;
  handleFindSupply: (e: React.FormEvent) => void;
  handleLoadSihDemo: () => void;

  // AI NLP
  nlpPrompt: string;
  setNlpPrompt: (v: string) => void;
  nlpLoading: boolean;
  handleNlpParse: () => void;

  // Results & Pool
  isSearching: boolean;
  activePool: SupplyPool | null;
  activeCollectionPlan: SmartCollectionPlan | null;
  setShowCollectionModal: (show: boolean) => void;

  // Farmer state & handlers
  farmerCrop: string;
  setFarmerCrop: (v: string) => void;
  farmerQty: string;
  setFarmerQty: (v: string) => void;
  farmerPrice: string;
  setFarmerPrice: (v: string) => void;
  farmerDistrict: string;
  setFarmerDistrict: (v: string) => void;
  farmerVillage: string;
  setFarmerVillage: (v: string) => void;
  farmerPostOffice: string;
  setFarmerPostOffice: (v: string) => void;
  farmerState: string;
  setFarmerState: (v: string) => void;
  farmerAvailDate: string;
  setFarmerAvailDate: (v: string) => void;
  farmerLat?: number;
  farmerLng?: number;
  mySupplies: FarmerSupply[];
  isSubmittingSupply: boolean;
  farmerMatchAlert: string | null;
  handlePostSupply: (e: React.FormEvent) => void;
  handleAllocationResponse: (poolId: string, supplyId: string, action: 'ACCEPT' | 'DECLINE') => void;

  // Geolocation
  gpsLoading: boolean;
  handleGetGps: (target: 'buyer' | 'farmer') => void;

  // Notifications & APMC
  notifications: MandiNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<MandiNotification[]>>;
  actionSuccessMsg: string | null;
  setActionSuccessMsg: (msg: string | null) => void;
  mandiOptions: MandiRoute[];
}

const CROP_ICONS: Record<string, string> = {
  Potato: '🥔', Tomato: '🍅', Wheat: '🌾', Paddy: '🌾', Rice: '🍚',
  Onion: '🧅', Chilli: '🌶️', Mustard: '🌻', Maize: '🌽', Soybean: '🫘'
};

const POPULAR_CROPS = ['Potato', 'Tomato', 'Wheat', 'Paddy', 'Onion', 'Chilli', 'Mustard', 'Maize', 'Soybean'];

export const MobileSmartMandiView: React.FC<MobileSmartMandiViewProps> = (props) => {
  const { t } = useLanguage();

  // Collapsible advanced location disclosure
  const [showAdvancedLocation, setShowAdvancedLocation] = useState(false);
  const [showNlpCard, setShowNlpCard] = useState(false);

  const unreadNotifCount = props.notifications.filter(n => !n.read).length;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      boxSizing: 'border-box',
      fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* ── 1. COMPACT PAGE HEADER & SUBTITLE ─────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', padding: '0.15rem 0.25rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: '#DCFCE7',
          color: '#15803D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>storefront</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            color: '#0F172A',
            margin: 0,
            letterSpacing: '-0.02em',
            lineHeight: 1.15
          }}>
            {t('sih.smartMandiTitle')}
          </h1>
          <p style={{
            fontSize: '0.74rem',
            color: '#64748B',
            margin: '0.15rem 0 0 0',
            lineHeight: 1.25,
            fontWeight: 500
          }}>
            {t('sih.smartMandiDesc')}
          </p>
        </div>
      </div>

      {/* ── 2. CLEAN HORIZONTAL SEGMENTED PILL TABS ───────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        background: '#F1F5F9',
        padding: '0.25rem',
        borderRadius: '14px',
        gap: '0.25rem',
        boxSizing: 'border-box'
      }}>
        <button
          type="button"
          onClick={() => props.setActiveTab('buy')}
          style={{
            height: '38px',
            borderRadius: '10px',
            border: 'none',
            background: props.activeTab === 'buy' ? '#16A34A' : 'transparent',
            color: props.activeTab === 'buy' ? '#FFFFFF' : '#475569',
            fontWeight: 800,
            fontSize: '0.76rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            transition: 'all 0.2s ease'
          }}
        >
          <span>🛒</span>
          <span>{t('aggregationPage.buyingPools')}</span>
        </button>

        <button
          type="button"
          onClick={() => props.setActiveTab('sell')}
          style={{
            height: '38px',
            borderRadius: '10px',
            border: 'none',
            background: props.activeTab === 'sell' ? '#16A34A' : 'transparent',
            color: props.activeTab === 'sell' ? '#FFFFFF' : '#475569',
            fontWeight: 800,
            fontSize: '0.76rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            transition: 'all 0.2s ease'
          }}
        >
          <span>🌾</span>
          <span>{t('aggregationPage.sellingPools')}</span>
        </button>

        <button
          type="button"
          onClick={() => props.setActiveTab('mandi-rates')}
          style={{
            height: '38px',
            borderRadius: '10px',
            border: 'none',
            background: props.activeTab === 'mandi-rates' ? '#16A34A' : 'transparent',
            color: props.activeTab === 'mandi-rates' ? '#FFFFFF' : '#475569',
            fontWeight: 800,
            fontSize: '0.76rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            transition: 'all 0.2s ease'
          }}
        >
          <span>📊</span>
          <span>{t('mobileHome.marketPrices')}</span>
        </button>
      </div>

      {/* Notification prompt pill if any unread */}
      {unreadNotifCount > 0 && props.activeTab !== 'notifications' && (
        <div
          onClick={() => props.setActiveTab('notifications')}
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            padding: '0.45rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '0.74rem',
            color: '#B91C1C',
            fontWeight: 700
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>🔔</span>
            <span>{unreadNotifCount} new Mandi match alert(s) waiting</span>
          </div>
          <span>View →</span>
        </div>
      )}

      {/* Success banner */}
      {props.actionSuccessMsg && (
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #86EFAC',
          borderRadius: '12px',
          padding: '0.65rem 0.85rem',
          color: '#166534',
          fontSize: '0.78rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{props.actionSuccessMsg}</span>
          <button
            onClick={() => props.setActionSuccessMsg(null)}
            style={{ background: 'transparent', border: 'none', color: '#166534', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 3. COMPACT SIH DEMO CARD (Prominent & Clean) ──────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0A3B1E 0%, #15803D 100%)',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '0.85rem 1rem',
        boxShadow: '0 4px 12px rgba(10, 59, 30, 0.18)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.62rem',
            fontWeight: 900,
            color: '#86EFAC',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            SIH Core Innovation
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.1rem' }}>
            Aggregation Optimizer
          </div>
          <div style={{ fontSize: '0.7rem', color: '#D1FAE5', marginTop: '0.1rem', lineHeight: 1.2 }}>
            Multi-farmer group buying &amp; collective selling pool
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={props.handleLoadSihDemo}
            disabled={props.isSearching}
            style={{
              background: '#F59E0B',
              color: '#000000',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap'
            }}
          >
            <span>⚡ 1-Click Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNlpCard(!showNlpCard)}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '9999px',
              padding: '0.3rem 0.65rem',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>mic</span>
            <span>Speak to AI</span>
          </button>
        </div>
      </div>

      {/* AI Voice / NLP Expandable prompt */}
      {showNlpCard && (
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #BFDBFE',
          borderRadius: '14px',
          padding: '0.75rem 0.85rem',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)'
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1E40AF', marginBottom: '0.35rem' }}>
            💬 Natural Language Order (AI Voice Parser):
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              type="text"
              value={props.nlpPrompt}
              onChange={e => props.setNlpPrompt(e.target.value)}
              placeholder="e.g. 100 kg potato near Haldia at ₹25/kg"
              style={{
                flex: 1,
                height: '42px',
                padding: '0 0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={props.handleNlpParse}
              disabled={props.nlpLoading}
              style={{
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {props.nlpLoading ? '...' : 'Extract'}
            </button>
          </div>
        </div>
      )}

      {/* ── 4. BUYING POOLS TAB (STEP-BASED COMPACT FLOW) ──────────── */}
      {props.activeTab === 'buy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <form onSubmit={props.handleFindSupply}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {/* STEP 1: WHAT ARE YOU SOURCING? */}
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                color: '#15803D',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                Step 1 • What Are You Buying?
              </div>

              {/* Crop Selector Card (48-52px height) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                  CROP
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={props.buyerCrop}
                    onChange={e => props.setBuyerCrop(e.target.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 2rem 0 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      appearance: 'none',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {POPULAR_CROPS.map(c => (
                      <option key={c} value={c}>
                        {CROP_ICONS[c] || '🌱'} {c}
                      </option>
                    ))}
                  </select>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '18px',
                      color: '#64748B',
                      pointerEvents: 'none'
                    }}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              {/* Quantity & Target Price Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                    QUANTITY (KG)
                  </label>
                  <input
                    type="number"
                    value={props.buyerQty}
                    onChange={e => props.setBuyerQty(e.target.value)}
                    min="1"
                    placeholder="100"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 0.75rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                    TARGET PRICE (₹/KG)
                  </label>
                  <input
                    type="number"
                    value={props.buyerPrice}
                    onChange={e => props.setBuyerPrice(e.target.value)}
                    min="1"
                    placeholder="25"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 0.75rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* STEP 2: WHERE TO SOURCE FROM? */}
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                color: '#15803D',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: '0.35rem'
              }}>
                Step 2 • Location &amp; Radius
              </div>

              {/* Quick Location & GPS Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                    DISTRICT / CENTER
                  </label>
                  <input
                    type="text"
                    value={props.buyerDistrict}
                    onChange={e => props.setBuyerDistrict(e.target.value)}
                    placeholder="Haldia"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 0.75rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                    GPS DETECT
                  </label>
                  <button
                    type="button"
                    onClick={() => props.handleGetGps('buyer')}
                    disabled={props.gpsLoading}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '10px',
                      border: '1.5px solid #BFDBFE',
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      padding: 0
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>my_location</span>
                    <span>{props.buyerLat ? 'GPS OK' : 'Use GPS'}</span>
                  </button>
                </div>
              </div>

              {/* Radius Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                  SEARCH RADIUS
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {['2', '5', '10', '20'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => props.setBuyerRadius(r)}
                      style={{
                        height: '38px',
                        borderRadius: '8px',
                        border: props.buyerRadius === r ? '2px solid #16A34A' : '1px solid #CBD5E1',
                        background: props.buyerRadius === r ? '#DCFCE7' : '#F8FAFC',
                        color: props.buyerRadius === r ? '#15803D' : '#475569',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Progressive Disclosure: Advanced Location */}
              <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAdvancedLocation(!showAdvancedLocation)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: 0
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                    {showAdvancedLocation ? 'keyboard_arrow_up' : 'tune'}
                  </span>
                  <span>{showAdvancedLocation ? 'Hide Advanced Location' : 'Advanced location details (Village, P.O., State)'}</span>
                </button>

                {showAdvancedLocation && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>Village</label>
                      <input
                        type="text"
                        value={props.buyerVillage}
                        onChange={e => props.setBuyerVillage(e.target.value)}
                        placeholder="Haldia"
                        style={{ width: '100%', height: '40px', padding: '0 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>P.O.</label>
                      <input
                        type="text"
                        value={props.buyerPostOffice}
                        onChange={e => props.setBuyerPostOffice(e.target.value)}
                        placeholder="Haldia"
                        style={{ width: '100%', height: '40px', padding: '0 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>State</label>
                      <input
                        type="text"
                        value={props.buyerState}
                        onChange={e => props.setBuyerState(e.target.value)}
                        placeholder="West Bengal"
                        style={{ width: '100%', height: '40px', padding: '0 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Sticky-Feel Submit Button */}
              <button
                type="submit"
                disabled={props.isSearching}
                style={{
                  height: '50px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: props.isSearching ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.28)',
                  marginTop: '0.25rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {props.isSearching ? 'sync' : 'hub'}
                </span>
                <span>{props.isSearching ? t('common.loading') : 'FIND BEST MANDI & POOL →'}</span>
              </button>
            </div>
          </form>

          {/* ── RECOMMENDED MANDI & SUPPLY POOL RESULTS (Compact Cards) ── */}
          {props.activePool && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: props.activePool.fulfillmentPercentage === 100 ? '2px solid #22C55E' : '2px solid #F59E0B',
              padding: '1rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {/* Header Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  background: props.activePool.fulfillmentPercentage === 100 ? '#DCFCE7' : '#FEF3C7',
                  color: props.activePool.fulfillmentPercentage === 100 ? '#15803D' : '#B45309',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 900
                }}>
                  {props.activePool.fulfillmentPercentage === 100 ? '🟢 100% POOL MATCH' : `🟡 ${props.activePool.fulfillmentPercentage}% MATCHED`}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                  {props.activePool.farmerCount} Farmers Pooled
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                  {CROP_ICONS[props.activePool.crop] || '🌱'} {props.activePool.crop}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem' }}>
                  <strong>{props.activePool.matchedQuantityKg} kg</strong> matched of {props.activePool.requiredQuantityKg} kg required
                </div>
              </div>

              {/* Progress */}
              <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${props.activePool.fulfillmentPercentage}%`,
                  height: '100%',
                  background: props.activePool.fulfillmentPercentage === 100 ? '#16A34A' : '#F59E0B',
                  borderRadius: '4px'
                }} />
              </div>

              {/* Compact Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                background: '#F8FAFC',
                padding: '0.75rem',
                borderRadius: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700 }}>EST. PRODUCT VALUE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#16A34A' }}>
                    ₹{props.activePool.estimatedProductValue.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700 }}>COLLECTION SAVINGS</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803D' }}>
                    ₹{props.activeCollectionPlan?.potentialTransportSaving || '450'}
                  </div>
                </div>
              </div>

              {/* Action: Open Logistics Plan Modal */}
              {props.activeCollectionPlan && (
                <button
                  type="button"
                  onClick={() => props.setShowCollectionModal(true)}
                  style={{
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid #16A34A',
                    background: '#F0FDF4',
                    color: '#15803D',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>route</span>
                  <span>View Optimized Pickup Loop ({props.activeCollectionPlan.totalRouteDistanceKm} km)</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 5. SELLING POOLS TAB (FARMER OFFER FORM) ────────────────── */}
      {props.activeTab === 'sell' && (
        <form onSubmit={props.handlePostSupply}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #E2E8F0',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              color: '#1D4ED8',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              Register Harvest Stock for Buyers
            </div>

            {/* Crop */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                OFFERING CROP
              </label>
              <select
                value={props.farmerCrop}
                onChange={e => props.setFarmerCrop(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {POPULAR_CROPS.map(c => (
                  <option key={c} value={c}>
                    {CROP_ICONS[c] || '🌱'} {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity & Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                  AVAILABLE (KG)
                </label>
                <input
                  type="number"
                  value={props.farmerQty}
                  onChange={e => props.setFarmerQty(e.target.value)}
                  min="1"
                  placeholder="50"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 0.75rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                  ASKING (₹/KG)
                </label>
                <input
                  type="number"
                  value={props.farmerPrice}
                  onChange={e => props.setFarmerPrice(e.target.value)}
                  min="1"
                  placeholder="24"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 0.75rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Location & GPS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                  VILLAGE / MANDI
                </label>
                <input
                  type="text"
                  value={props.farmerVillage}
                  onChange={e => props.setFarmerVillage(e.target.value)}
                  placeholder="Sutahata"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 0.75rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                  GPS PIN
                </label>
                <button
                  type="button"
                  onClick={() => props.handleGetGps('farmer')}
                  disabled={props.gpsLoading}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '10px',
                    border: '1.5px solid #BFDBFE',
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>my_location</span>
                  <span>{props.farmerLat ? 'GPS OK' : 'Use GPS'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={props.isSubmittingSupply}
              style={{
                height: '50px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: props.isSubmittingSupply ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                marginTop: '0.25rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload</span>
              <span>{props.isSubmittingSupply ? 'REGISTERING...' : 'LIST HARVEST ON POOL →'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── 6. MANDI RATES TAB (RECOMMENDED MANDI CARD FIRST) ─────── */}
      {props.activeTab === 'mandi-rates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Top Quick Filter Bar */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569' }}>CROP:</span>
            <select
              value={props.buyerCrop}
              onChange={e => props.setBuyerCrop(e.target.value)}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#0F172A',
                outline: 'none'
              }}
            >
              <option value="Potato">🥔 Potato</option>
              <option value="Wheat">🌾 Wheat</option>
              <option value="Rice">🍚 Rice / Paddy</option>
              <option value="Tomato">🍅 Tomato</option>
            </select>

            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginLeft: 'auto' }}>AREA:</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>{props.buyerDistrict}</span>
          </div>

          {/* FIRST RESULT PRIORITY: RECOMMENDED MANDI */}
          {props.mandiOptions.length > 0 && (() => {
            const bestMandi = props.mandiOptions[0];
            return (
              <div style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                borderRadius: '18px',
                border: '2px solid #16A34A',
                padding: '1rem',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    background: '#16A34A',
                    color: '#FFFFFF',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    letterSpacing: '0.04em'
                  }}>
                    RECOMMENDED MANDI
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 800 }}>
                    {bestMandi.trend}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.15 }}>
                    {bestMandi.mandiName}
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '0.15rem' }}>
                    📍 {bestMandi.distanceKm} km away ({bestMandi.transitTimeMinutes} mins travel)
                  </div>
                </div>

                {/* Key Financials */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.4rem',
                  background: 'rgba(255, 255, 255, 0.8)',
                  padding: '0.65rem',
                  borderRadius: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700 }}>GROSS RATE</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>₹{bestMandi.grossPricePerQtl}/q</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: '#DC2626', fontWeight: 700 }}>TRANSPORT</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#DC2626' }}>-₹{bestMandi.transportCostPerQtl}/q</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: '#16A34A', fontWeight: 700 }}>NET RETURN</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#15803D' }}>₹{bestMandi.netReturnPerQtl}/q</div>
                  </div>
                </div>

                {/* Risk Badges */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ background: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>
                    Price Risk: LOW
                  </span>
                  <span style={{ background: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>
                    Logistics Risk: LOW
                  </span>
                </div>

                {/* Short explanation */}
                <div style={{ fontSize: '0.74rem', color: '#14532D', lineHeight: 1.3, fontWeight: 600 }}>
                  💡 <strong>Why this Mandi?</strong> Best net realization after deducting transport freight from your village.
                </div>
              </div>
            );
          })()}

          {/* Nearby Mandis comparison */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
              Compare Other Nearby Mandis:
            </div>

            {props.mandiOptions.slice(1).map((mandi, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '0.75rem 0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                    {mandi.mandiName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    📍 {mandi.distanceKm} km • Freight: -₹{mandi.transportCostPerQtl}/qtl
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#16A34A' }}>
                    ₹{mandi.netReturnPerQtl}/q
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#94A3B8' }}>
                    Gross: ₹{mandi.grossPricePerQtl}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 7. NOTIFICATIONS TAB ──────────────────────────────────── */}
      {props.activeTab === 'notifications' && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            🔔 Live Match Notifications
          </h3>
          {props.notifications.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center', padding: '1rem 0' }}>
              No active notifications. Post a requirement to see matches.
            </div>
          ) : (
            props.notifications.map(n => (
              <div
                key={n.id}
                style={{
                  background: n.read ? '#F8FAFC' : '#F0FDF4',
                  border: n.read ? '1px solid #E2E8F0' : '1px solid #86EFAC',
                  borderRadius: '10px',
                  padding: '0.65rem 0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>{n.title}</div>
                  <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '0.1rem' }}>{n.body}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    SmartMandiService.markNotificationRead(n.id);
                    props.setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                    if (n.recipientRole === 'BUYER') props.setActiveTab('buy');
                    else props.setActiveTab('sell');
                  }}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  View
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
