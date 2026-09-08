import React, { useState, useEffect } from 'react';
import { SihLayout } from '../../shared/SihLayout.js';
import { SmartMandiService, MandiRoute } from '../smartMandi.service.js';
import { fieldMappingService, FieldRecord } from '../../field-mapping/fieldMapping.service.js';
import { useAuth } from '../../../../context/AuthContext.js';
import type {
  BuyerRequirement,
  FarmerSupply,
  SupplyPool,
  SmartCollectionPlan,
  MandiNotification,
  StructuredLocation
} from '@bharatfarm/shared';

type ActiveTab = 'buy' | 'sell' | 'mandi-rates' | 'notifications';

const CROP_ICONS: Record<string, string> = {
  Potato: '🥔', Tomato: '🍅', Wheat: '🌾', Paddy: '🌾', Rice: '🍚',
  Onion: '🧅', Chilli: '🌶️', Mustard: '🌻', Maize: '🌽', Soybean: '🫘',
  Cotton: '☁️', Garlic: '🧄', Brinjal: '🍆', Cucumber: '🥒',
  'Bitter Gourd': '🥬', 'Bottle Gourd': '🥦', Peas: '🟢', Banana: '🍌'
};

const POPULAR_CROPS = ['Potato', 'Tomato', 'Wheat', 'Paddy', 'Onion', 'Chilli', 'Mustard', 'Maize', 'Soybean'];

export const SmartMandiPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('buy');

  // ── BUYER STATE ──────────────────────────────────────────
  const [buyerCrop, setBuyerCrop] = useState('Potato');
  const [buyerQty, setBuyerQty] = useState('100');
  const [buyerPrice, setBuyerPrice] = useState('25');
  const [buyerDistrict, setBuyerDistrict] = useState('Purba Medinipur');
  const [buyerVillage, setBuyerVillage] = useState('Haldia');
  const [buyerPostOffice, setBuyerPostOffice] = useState('Haldia');
  const [buyerState, setBuyerState] = useState('West Bengal');
  const [buyerRadius, setBuyerRadius] = useState('10');
  const [buyerDeadline, setBuyerDeadline] = useState('2026-09-15');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [buyerLat, setBuyerLat] = useState<number | undefined>(22.0667);
  const [buyerLng, setBuyerLng] = useState<number | undefined>(88.0698);

  // NLP AI parser state
  const [nlpPrompt, setNlpPrompt] = useState('');
  const [nlpLoading, setNlpLoading] = useState(false);
  const [showNlpBox, setShowNlpBox] = useState(false);

  // Matching & Results state
  const [isSearching, setIsSearching] = useState(false);
  const [activePool, setActivePool] = useState<SupplyPool | null>(null);
  const [activeCollectionPlan, setActiveCollectionPlan] = useState<SmartCollectionPlan | null>(null);
  const [activeRequirement, setActiveRequirement] = useState<BuyerRequirement | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [myRequirements, setMyRequirements] = useState<BuyerRequirement[]>([]);

  // ── FARMER STATE ─────────────────────────────────────────
  const [farmerCrop, setFarmerCrop] = useState('Potato');
  const [farmerQty, setFarmerQty] = useState('50');
  const [farmerPrice, setFarmerPrice] = useState('24');
  const [farmerDistrict, setFarmerDistrict] = useState('Purba Medinipur');
  const [farmerVillage, setFarmerVillage] = useState('Sutahata');
  const [farmerPostOffice, setFarmerPostOffice] = useState('Sutahata');
  const [farmerState, setFarmerState] = useState('West Bengal');
  const [farmerAvailDate, setFarmerAvailDate] = useState('2026-09-12');
  const [farmerNotes, setFarmerNotes] = useState('');
  const [farmerLat, setFarmerLat] = useState<number | undefined>(22.0757);
  const [farmerLng, setFarmerLng] = useState<number | undefined>(88.0758);
  const [mySupplies, setMySupplies] = useState<FarmerSupply[]>([]);
  const [savedMappedFields, setSavedMappedFields] = useState<FieldRecord[]>([]);
  const [isSubmittingSupply, setIsSubmittingSupply] = useState(false);
  const [farmerMatchAlert, setFarmerMatchAlert] = useState<string | null>(null);

  // ── NOTIFICATIONS & APMC RATES ───────────────────────────
  const [notifications, setNotifications] = useState<MandiNotification[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Load initial data & fixtures
  useEffect(() => {
    loadData();
    fieldMappingService.getSavedFields().then(fields => setSavedMappedFields(fields));
  }, [user]);

  const loadData = async () => {
    try {
      const [reqs, supps, notifs] = await Promise.all([
        SmartMandiService.getAllRequirements(),
        SmartMandiService.getAllSupplies(),
        SmartMandiService.getNotifications()
      ]);
      setMyRequirements(reqs);
      setMySupplies(supps);
      setNotifications(notifs);

      // If requirements exist, load the latest pool
      if (reqs.length > 0) {
        const latest = reqs[0];
        setActiveRequirement(latest);
        try {
          const detail = await SmartMandiService.getRequirementById(latest.id);
          setActivePool(detail.pool);
          setActiveCollectionPlan(detail.collectionPlan);
        } catch {}
      }
    } catch (err) {
      console.error('[SmartMandiPage] Load data error:', err);
    }
  };

  // ── 1-CLICK SIH DEMO PRESET ──────────────────────────────
  const handleLoadSihDemo = async () => {
    setIsSearching(true);
    setActionSuccessMsg(null);
    try {
      await SmartMandiService.seedDemo();
      setBuyerCrop('Potato');
      setBuyerQty('100');
      setBuyerPrice('25');
      setBuyerDistrict('Purba Medinipur');
      setBuyerVillage('Haldia');
      setBuyerPostOffice('Haldia');
      setBuyerState('West Bengal');
      setBuyerRadius('10');
      setBuyerLat(22.0667);
      setBuyerLng(88.0698);

      const res = await SmartMandiService.createRequirement({
        buyerId: user?.id || 'buyer_haldia_demo',
        buyerName: user?.fullName || 'Haldia Agro Foods (Buyer)',
        buyerPhone: user?.phone || '+91 98765 43210',
        crop: 'Potato',
        requiredQuantityKg: 100,
        expectedPricePerKg: 25,
        location: {
          district: 'Purba Medinipur',
          village: 'Haldia',
          postOffice: 'Haldia',
          state: 'West Bengal',
          latitude: 22.0667,
          longitude: 88.0698
        },
        searchRadiusKm: 10,
        requiredBy: '2026-09-15',
        notes: 'Need 100 kg fresh harvest potato for processing unit.'
      });

      setActiveRequirement(res.requirement);
      setActivePool(res.pool);
      setActiveCollectionPlan(res.collectionPlan);

      SmartMandiService.triggerVibration();
      setActionSuccessMsg('🎉 SIH Demo Match created: 100 kg Potato fulfilled across 3 nearby farmers in Haldia!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to initialize demo');
    } finally {
      setIsSearching(false);
    }
  };

  // ── BUYER SUBMIT REQUIREMENT ─────────────────────────────
  const handleFindSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerCrop || !buyerQty || !buyerPrice || !buyerDistrict) {
      alert('Please enter all required fields.');
      return;
    }

    setIsSearching(true);
    setActionSuccessMsg(null);
    try {
      const res = await SmartMandiService.createRequirement({
        buyerId: user?.id || 'buyer_local',
        buyerName: user?.fullName || 'Commercial Buyer',
        buyerPhone: user?.phone || '+91 98000 00000',
        crop: buyerCrop,
        requiredQuantityKg: Number(buyerQty),
        expectedPricePerKg: Number(buyerPrice),
        location: {
          district: buyerDistrict,
          village: buyerVillage || buyerDistrict,
          postOffice: buyerPostOffice || buyerDistrict,
          state: buyerState,
          latitude: buyerLat,
          longitude: buyerLng
        },
        searchRadiusKm: Number(buyerRadius),
        requiredBy: buyerDeadline,
        notes: buyerNotes
      });

      setActiveRequirement(res.requirement);
      setActivePool(res.pool);
      setActiveCollectionPlan(res.collectionPlan);

      SmartMandiService.triggerVibration();
      setActionSuccessMsg(`Requirement posted! Found ${res.pool?.farmerCount || 0} matching farmer(s) (${res.pool?.fulfillmentPercentage || 0}% fulfilled).`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to match supply');
    } finally {
      setIsSearching(false);
    }
  };

  // ── AI NLP REQUIREMENT PARSER ────────────────────────────
  const handleNlpParse = async () => {
    if (!nlpPrompt.trim()) return;
    setNlpLoading(true);
    try {
      const parsed = await SmartMandiService.parseNaturalLanguageRequirement(nlpPrompt);
      if (parsed.crop) setBuyerCrop(parsed.crop);
      if (parsed.quantityKg) setBuyerQty(String(parsed.quantityKg));
      if (parsed.expectedPricePerKg) setBuyerPrice(String(parsed.expectedPricePerKg));
      if (parsed.district) setBuyerDistrict(parsed.district);
      if (parsed.village) setBuyerVillage(parsed.village);
      if (parsed.state) setBuyerState(parsed.state);
      setShowNlpBox(false);
    } catch (err: any) {
      alert('AI parser error: ' + (err.message || 'Could not extract requirement'));
    } finally {
      setNlpLoading(false);
    }
  };

  // ── FARMER SUBMIT SUPPLY ─────────────────────────────────
  const handlePostSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerCrop || !farmerQty || !farmerPrice || !farmerDistrict) {
      alert('Please fill all required supply fields.');
      return;
    }

    setIsSubmittingSupply(true);
    setFarmerMatchAlert(null);
    try {
      const res = await SmartMandiService.createSupply({
        farmerId: user?.id || 'farmer_local',
        farmerName: user?.fullName || 'Local Farmer',
        farmerPhone: user?.phone || '+91 98321 99999',
        crop: farmerCrop,
        availableQuantityKg: Number(farmerQty),
        expectedPricePerKg: Number(farmerPrice),
        location: {
          district: farmerDistrict,
          village: farmerVillage || farmerDistrict,
          postOffice: farmerPostOffice || farmerDistrict,
          state: farmerState,
          latitude: farmerLat,
          longitude: farmerLng
        },
        availabilityDate: farmerAvailDate,
        notes: farmerNotes
      });

      SmartMandiService.triggerVibration();
      if (res.matchedRequirementsCount > 0) {
        setFarmerMatchAlert(`🔔 Great news! Your ${farmerCrop} supply matched ${res.matchedRequirementsCount} active buyer requirement(s) in your area!`);
      } else {
        setFarmerMatchAlert(`✓ Supply registered. We will notify you instantly when nearby buyers request ${farmerCrop}.`);
      }

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to post supply');
    } finally {
      setIsSubmittingSupply(false);
    }
  };

  // ── IMPORT FROM FIELD MAPPING ────────────────────────────
  const handleImportMappedField = (field: FieldRecord) => {
    const cropClean = field.crop_name ? field.crop_name.split(' ')[0].replace(/[^a-zA-Z]/g, '') : 'Potato';
    setFarmerCrop(cropClean);
    if (field.location_address) {
      const parts = field.location_address.split(',');
      if (parts[0]) setFarmerVillage(parts[0].trim());
      if (parts[1]) setFarmerDistrict(parts[1].trim());
      if (parts[2]) setFarmerState(parts[2].trim());
    }
    if (field.latitude) setFarmerLat(field.latitude);
    if (field.longitude) setFarmerLng(field.longitude);
    alert(`Imported ${field.field_name} (${field.area_acres} acres of ${cropClean}). Please confirm your available harvestable stock quantity.`);
  };

  // ── FARMER ALLOCATION ACCEPT / DECLINE ───────────────────
  const handleAllocationResponse = async (poolId: string, supplyId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      await SmartMandiService.respondToAllocation(poolId, supplyId, action);
      SmartMandiService.triggerVibration();
      alert(`Allocation ${action.toLowerCase()}ed successfully!`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // ── GPS LOCATION HANDLER ─────────────────────────────────
  const handleGetGps = async (target: 'buyer' | 'farmer') => {
    setGpsLoading(true);
    try {
      const coords = await SmartMandiService.getCurrentLocation();
      if (target === 'buyer') {
        setBuyerLat(coords.latitude);
        setBuyerLng(coords.longitude);
      } else {
        setFarmerLat(coords.latitude);
        setFarmerLng(coords.longitude);
      }
      alert(`GPS location captured: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    } catch (err: any) {
      alert(err.message || 'Could not retrieve GPS coordinates.');
    } finally {
      setGpsLoading(false);
    }
  };

  // Preserved APMC mandi routes
  const mandiOptions: MandiRoute[] = SmartMandiService.getMandiRecommendations(buyerCrop, buyerDistrict);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <SihLayout activeModuleId="smart-mandi" moduleTitle="Smart Mandi" moduleIcon="bar_chart">
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>

        {/* ── HEADER & SEGMENTED TABS ─────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.8rem' }}>📍</span>
              <div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Smart Mandi
                </h1>
                <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '0.15rem 0 0' }}>
                  Multi-Farmer Supply Pooling &amp; Smart Collection Logistics
                </p>
              </div>
            </div>
          </div>

          {/* Top-level Tabs */}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '0.3rem',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            gap: '0.25rem'
          }}>
            <button
              onClick={() => setActiveTab('buy')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'buy' ? '#16A34A' : 'transparent',
                color: activeTab === 'buy' ? '#FFFFFF' : '#475569',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🛒</span>
              <span>BUY</span>
            </button>

            <button
              onClick={() => setActiveTab('sell')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'sell' ? '#16A34A' : 'transparent',
                color: activeTab === 'sell' ? '#FFFFFF' : '#475569',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🌾</span>
              <span>SELL</span>
            </button>

            <button
              onClick={() => setActiveTab('mandi-rates')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'mandi-rates' ? '#0F172A' : 'transparent',
                color: activeTab === 'mandi-rates' ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span>📊</span>
              <span>Mandi Prices</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              style={{
                padding: '0.55rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'notifications' ? '#0F172A' : 'transparent',
                color: activeTab === 'notifications' ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                position: 'relative'
              }}
            >
              <span>🔔</span>
              <span>Alerts</span>
              {unreadNotifCount > 0 && (
                <span style={{
                  background: '#EF4444',
                  color: '#FFF',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  borderRadius: '10px',
                  padding: '0.1rem 0.4rem',
                  lineHeight: 1
                }}>
                  {unreadNotifCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {actionSuccessMsg && (
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            color: '#166534',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{actionSuccessMsg}</span>
            <button
              onClick={() => setActionSuccessMsg(null)}
              style={{ background: 'transparent', border: 'none', color: '#166534', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TAB 1: BUY SECTION (One Requirement -> Multi-Farmer Pool)  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'buy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* SIH Demo Banner & NLP Quick Fill */}
            <div style={{
              background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 4px 14px rgba(6, 78, 59, 0.25)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#34D399', color: '#064E3B', fontSize: '0.7rem', fontWeight: 900, padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                    SIH CORE INNOVATION
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>Automatic Multi-Farmer Supply Pooling</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#A7F3D0', marginTop: '0.25rem' }}>
                  Post what you need. BharatFarm automatically aggregates nearby farmers into one consolidated procurement batch.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowNlpBox(!showNlpBox)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.9rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>smart_toy</span>
                  <span>AI Natural Language</span>
                </button>

                <button
                  onClick={handleLoadSihDemo}
                  disabled={isSearching}
                  style={{
                    background: '#F59E0B',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <span>⚡ 1-Click SIH Demo (Haldia Potato)</span>
                </button>
              </div>
            </div>

            {/* Expandable Natural Language AI Box */}
            {showNlpBox && (
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E40AF', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>psychology</span>
                  <span>Describe your requirement naturally (Gemini AI Parser):</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={nlpPrompt}
                    onChange={e => setNlpPrompt(e.target.value)}
                    placeholder="e.g. I need around 100 kilos of potato near Haldia before Friday at ₹25 per kg"
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.86rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleNlpParse}
                    disabled={nlpLoading}
                    style={{
                      background: '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0 1rem',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {nlpLoading ? 'Extracting...' : 'Parse & Auto-Fill'}
                  </button>
                </div>
              </div>
            )}

            {/* Buyer Post Requirement Form */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem' }}>
                🛒 Post Procurement Requirement
              </h2>

              <form onSubmit={handleFindSupply}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>

                  {/* Crop */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      CROP NEEDED
                    </label>
                    <select
                      value={buyerCrop}
                      onChange={e => setBuyerCrop(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        outline: 'none'
                      }}
                    >
                      {POPULAR_CROPS.map(c => (
                        <option key={c} value={c}>
                          {CROP_ICONS[c] || '🌱'} {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      REQUIRED QUANTITY (KG)
                    </label>
                    <input
                      type="number"
                      value={buyerQty}
                      onChange={e => setBuyerQty(e.target.value)}
                      min="1"
                      placeholder="e.g. 100"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Expected Price */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      EXPECTED PRICE (₹ / KG)
                    </label>
                    <input
                      type="number"
                      value={buyerPrice}
                      onChange={e => setBuyerPrice(e.target.value)}
                      min="1"
                      placeholder="e.g. 25"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Search Radius */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      SEARCH RADIUS
                    </label>
                    <select
                      value={buyerRadius}
                      onChange={e => setBuyerRadius(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    >
                      <option value="2">2 km (Immediate vicinity)</option>
                      <option value="5">5 km (Local block)</option>
                      <option value="10">10 km (Sub-division)</option>
                      <option value="20">20 km (Regional district)</option>
                    </select>
                  </div>
                </div>

                {/* Structured Location Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>District</label>
                    <input
                      type="text"
                      value={buyerDistrict}
                      onChange={e => setBuyerDistrict(e.target.value)}
                      placeholder="District"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Village / Locality</label>
                    <input
                      type="text"
                      value={buyerVillage}
                      onChange={e => setBuyerVillage(e.target.value)}
                      placeholder="Village"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Post Office</label>
                    <input
                      type="text"
                      value={buyerPostOffice}
                      onChange={e => setBuyerPostOffice(e.target.value)}
                      placeholder="P.O."
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>State</label>
                    <input
                      type="text"
                      value={buyerState}
                      onChange={e => setBuyerState(e.target.value)}
                      placeholder="State"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleGetGps('buyer')}
                      disabled={gpsLoading}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #BFDBFE',
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>my_location</span>
                      <span>{buyerLat ? `GPS: ${buyerLat.toFixed(2)}, ${buyerLng?.toFixed(2)}` : 'Get GPS'}</span>
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={isSearching}
                    style={{
                      background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.75rem 2rem',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: isSearching ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {isSearching ? 'sync' : 'hub'}
                    </span>
                    <span>{isSearching ? 'Searching & Pooling...' : 'Find Nearby Supply & Build Pool'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* ── CONSOLIDATED SUPPLY POOL CARD ───────────────────── */}
            {activePool && (
              <div style={{
                background: '#FFFFFF',
                border: activePool.fulfillmentPercentage === 100 ? '2px solid #22C55E' : '2px solid #F59E0B',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 6px 18px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        background: activePool.fulfillmentPercentage === 100 ? '#DCFCE7' : '#FEF3C7',
                        color: activePool.fulfillmentPercentage === 100 ? '#15803D' : '#B45309',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 900
                      }}>
                        {activePool.fulfillmentPercentage === 100 ? '🟢 FULL SUPPLY POOL MATCH' : `🟡 PARTIAL MATCH (${activePool.fulfillmentPercentage}%)`}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Pool ID: {activePool.id.split('_')[1] || activePool.id}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: '0.4rem 0 0' }}>
                      {CROP_ICONS[activePool.crop] || '🌱'} {activePool.crop} · {activePool.matchedQuantityKg} / {activePool.requiredQuantityKg} kg Fulfilled
                    </h3>
                    <div style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '0.15rem' }}>
                      Consolidated from <strong>{activePool.farmerCount} nearby farmers</strong> in your area.
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      Est. Total Product Value
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16A34A' }}>
                      ₹{activePool.estimatedProductValue.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.35rem' }}>
                    <span>Fulfilled: {activePool.matchedQuantityKg} kg</span>
                    <span>Required: {activePool.requiredQuantityKg} kg ({activePool.fulfillmentPercentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${activePool.fulfillmentPercentage}%`,
                      height: '100%',
                      background: activePool.fulfillmentPercentage === 100 ? '#22C55E' : '#F59E0B',
                      borderRadius: '5px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>

                {/* Farmers Allocation Table */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Multi-Farmer Supply Breakdown:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {activePool.allocations.map((alloc, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>👨‍🌾</span>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>
                              {alloc.farmerName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              📍 {alloc.distanceKm} km away · Price: ₹{alloc.pricePerKg}/kg {alloc.priceDifferencePerKg > 0 ? `(+₹${alloc.priceDifferencePerKg})` : '(Exact)'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>
                              {alloc.allocatedQuantityKg} kg
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                              ₹{(alloc.allocatedQuantityKg * alloc.pricePerKg).toLocaleString()}
                            </div>
                          </div>

                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            background: alloc.farmerStatus === 'ACCEPTED' ? '#DCFCE7' : '#EFF6FF',
                            color: alloc.farmerStatus === 'ACCEPTED' ? '#15803D' : '#1D4ED8'
                          }}>
                            {alloc.farmerStatus === 'ACCEPTED' ? '✓ Accepted' : '🔔 Notified'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Explanation banner */}
                {activePool.aiExplanation && (
                  <div style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.82rem',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.25rem'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#16A34A' }}>psychology</span>
                    <span><strong>AI Pool Summary:</strong> {activePool.aiExplanation}</span>
                  </div>
                )}

                {/* Action CTA: View Smart Collection Plan */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    🚚 <strong>Consolidated Transport:</strong> 1 collection route eliminates {activePool.allocations.length - 1} separate trips.
                  </div>
                  <button
                    onClick={() => setShowCollectionModal(true)}
                    style={{
                      background: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.6rem 1.25rem',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>route</span>
                    <span>View Smart Collection Plan</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── SMART COLLECTION PLAN MODAL ─────────────────────── */}
            {showCollectionModal && activeCollectionPlan && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}>
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  maxWidth: '650px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '1.75rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.6rem' }}>🚚</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                          Smart Collection Plan
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          Optimized multi-stop pickup loop for {activeCollectionPlan.totalQuantityKg} kg
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCollectionModal(false)}
                      style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 800 }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Route sequence diagram */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                      Ordered Collection Route (Greedy Shortest Path):
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {/* Origin */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563EB', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                          0
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                            Start: Buyer Receiving Center ({activeCollectionPlan.buyerLocation.village}, {activeCollectionPlan.buyerLocation.district})
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Dispatch vehicle</div>
                        </div>
                      </div>

                      {/* Stops */}
                      {activeCollectionPlan.stops.map((stop) => (
                        <div key={stop.stopNumber} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem', borderLeft: '2px dashed #94A3B8', paddingLeft: '1.2rem', paddingBottom: '0.2rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#16A34A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                            {stop.stopNumber}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                              Stop {stop.stopNumber}: {stop.farmerName} (+{stop.quantityKg} kg)
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                              📍 {stop.location.village} · Leg: {stop.distanceFromPrevKm} km (Cumul: {stop.cumulativeDistanceKm} km)
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Return to Buyer */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0F172A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                          ✓
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                            End: Return to Buyer Center (Total: {activeCollectionPlan.totalQuantityKg} kg Collected)
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700 }}>
                            Total loop: {activeCollectionPlan.totalRouteDistanceKm} km
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logistics Metrics & Savings */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ background: '#F1F5F9', padding: '0.75rem', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Consolidated Loop</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                        {activeCollectionPlan.totalRouteDistanceKm} km
                      </div>
                    </div>

                    <div style={{ background: '#F1F5F9', padding: '0.75rem', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Separate Trips Dist.</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#64748B' }}>
                        {activeCollectionPlan.separateTripsDistanceKm} km
                      </div>
                    </div>

                    <div style={{ background: '#F1F5F9', padding: '0.75rem', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Est. Transport Cost</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                        ₹{activeCollectionPlan.estimatedTransportCost || 'N/A'}
                      </div>
                    </div>

                    <div style={{ background: '#DCFCE7', padding: '0.75rem', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700 }}>Potential Saving</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#15803D' }}>
                        ₹{activeCollectionPlan.potentialTransportSaving || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                    💡 <strong>Efficiency Note:</strong> {activeCollectionPlan.efficiencyNote}
                  </div>

                  <button
                    onClick={() => {
                      alert('Collection order generated. Vehicle dispatch coordinator notified.');
                      setShowCollectionModal(false);
                    }}
                    style={{
                      width: '100%',
                      background: '#16A34A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Confirm &amp; Proceed with Consolidated Route ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TAB 2: SELL SECTION (Farmer Availability & Reverse Match)  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'sell' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#93C5FD', color: '#1E3A8A', fontSize: '0.7rem', fontWeight: 900, padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                    FARMER REVERSE MATCH
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>Smart Mandi — Sell Available Produce</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#DBEAFE', marginTop: '0.25rem' }}>
                  Tell BharatFarm what harvestable stock you have. We automatically search and connect nearby buyers needing your crop.
                </div>
              </div>

              {savedMappedFields.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {savedMappedFields.slice(0, 2).map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleImportMappedField(f)}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255,255,255,0.4)',
                        borderRadius: '8px',
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Import {f.field_name} ({f.crop_name})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {farmerMatchAlert && (
              <div style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '12px',
                padding: '0.85rem 1.25rem',
                color: '#1E40AF',
                fontSize: '0.88rem',
                fontWeight: 700
              }}>
                {farmerMatchAlert}
              </div>
            )}

            {/* Farmer Supply Form */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem' }}>
                🌾 Make Your Crop Available
              </h2>

              <form onSubmit={handlePostSupply}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>

                  {/* Crop */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      CROP TYPE
                    </label>
                    <select
                      value={farmerCrop}
                      onChange={e => setFarmerCrop(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        outline: 'none'
                      }}
                    >
                      {POPULAR_CROPS.map(c => (
                        <option key={c} value={c}>
                          {CROP_ICONS[c] || '🌱'} {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Available Qty */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      AVAILABLE HARVESTABLE QUANTITY (KG)
                    </label>
                    <input
                      type="number"
                      value={farmerQty}
                      onChange={e => setFarmerQty(e.target.value)}
                      min="1"
                      placeholder="e.g. 50"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Expected Price */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      YOUR EXPECTED PRICE (₹ / KG)
                    </label>
                    <input
                      type="number"
                      value={farmerPrice}
                      onChange={e => setFarmerPrice(e.target.value)}
                      min="1"
                      placeholder="e.g. 24"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Ready date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      AVAILABILITY DATE
                    </label>
                    <input
                      type="date"
                      value={farmerAvailDate}
                      onChange={e => setFarmerAvailDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Structured Location */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>District</label>
                    <input
                      type="text"
                      value={farmerDistrict}
                      onChange={e => setFarmerDistrict(e.target.value)}
                      placeholder="District"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Village / Locality</label>
                    <input
                      type="text"
                      value={farmerVillage}
                      onChange={e => setFarmerVillage(e.target.value)}
                      placeholder="Village"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Post Office</label>
                    <input
                      type="text"
                      value={farmerPostOffice}
                      onChange={e => setFarmerPostOffice(e.target.value)}
                      placeholder="P.O."
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>State</label>
                    <input
                      type="text"
                      value={farmerState}
                      onChange={e => setFarmerState(e.target.value)}
                      placeholder="State"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleGetGps('farmer')}
                      disabled={gpsLoading}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #BFDBFE',
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>my_location</span>
                      <span>{farmerLat ? `GPS: ${farmerLat.toFixed(2)}, ${farmerLng?.toFixed(2)}` : 'Get GPS'}</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={isSubmittingSupply}
                    style={{
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.75rem 2rem',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: isSubmittingSupply ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload</span>
                    <span>{isSubmittingSupply ? 'Registering...' : 'Make Available & Match Buyers'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* ── MATCHED BUYER REQUESTS FOR FARMERS ──────────────── */}
            {activePool && activePool.allocations.length > 0 && (
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem' }}>
                  🔔 Incoming Buyer Match Requests
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 1rem' }}>
                  Review nearby commercial buyers matched to your crop supply:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activePool.allocations.map((alloc, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>📦</span>
                          <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                            {activeRequirement?.buyerName || 'Commercial Buyer'} requested {alloc.allocatedQuantityKg} kg {activePool.crop}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                          📍 {alloc.distanceKm} km from you · Buyer Offer: ₹{activeRequirement?.expectedPricePerKg || 25}/kg · Total: ₹{(alloc.allocatedQuantityKg * (activeRequirement?.expectedPricePerKg || 25)).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {alloc.farmerStatus === 'ACCEPTED' ? (
                          <span style={{ background: '#DCFCE7', color: '#15803D', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>
                            ✓ Confirmed Accepted
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAllocationResponse(activePool.id, alloc.farmerSupplyId, 'ACCEPT')}
                              style={{
                                background: '#16A34A',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.45rem 1rem',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              Accept Order ✓
                            </button>
                            <button
                              onClick={() => handleAllocationResponse(activePool.id, alloc.farmerSupplyId, 'DECLINE')}
                              style={{
                                background: '#F1F5F9',
                                color: '#64748B',
                                border: '1px solid #CBD5E1',
                                borderRadius: '8px',
                                padding: '0.45rem 0.85rem',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Supplies List */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.85rem' }}>
                📋 Your Active Supply Listings
              </h3>
              {mySupplies.length === 0 ? (
                <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No supplies posted yet.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {mySupplies.map(s => (
                    <div key={s.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#0F172A' }}>
                          {CROP_ICONS[s.crop] || '🌱'} {s.crop}
                        </span>
                        <span style={{ fontSize: '0.72rem', background: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                          {s.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16A34A', margin: '0.35rem 0 0.15rem' }}>
                        {s.availableQuantityKg} kg @ ₹{s.expectedPricePerKg}/kg
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        📍 {s.location.village}, {s.location.district}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TAB 3: MANDI RATES (Preserved APMC Route Comparison)        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'mandi-rates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '1.75rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem'
            }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Select Crop:</label>
                <select
                  value={buyerCrop}
                  onChange={e => setBuyerCrop(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    outline: 'none',
                    marginTop: '0.4rem'
                  }}
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice / Paddy</option>
                  <option value="Potato">Potato</option>
                  <option value="Tomato">Tomato</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Your Location:</label>
                <input
                  type="text"
                  value={buyerDistrict}
                  onChange={e => setBuyerDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    outline: 'none',
                    marginTop: '0.4rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Top Mandi Options (Net Return = Mandi Price - Freight Cost)
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mandiOptions.map((mandi, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '1.25rem 1.5rem',
                      border: mandi.isOptimalChoice ? '2px solid #16A34A' : '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {mandi.mandiName}
                        </h3>
                        {mandi.isOptimalChoice && (
                          <span style={{ background: '#DCFCE7', color: '#15803D', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                            Best Net Return
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748B', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                        <span>📍 {mandi.distanceKm} km ({mandi.transitTimeMinutes} min)</span>
                        <span>🚚 Freight: -₹{mandi.transportCostPerQtl}/qtl</span>
                        <span>📈 Trend: {mandi.trend}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#16A34A' }}>
                        ₹{mandi.netReturnPerQtl}/q
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                        Gross: ₹{mandi.grossPricePerQtl}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TAB 4: ALERTS & NOTIFICATIONS                               */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'notifications' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                🔔 Live Match &amp; Allocation Notifications
              </h2>
              <button
                onClick={() => {
                  SmartMandiService.triggerVibration();
                  alert('📳 Mobile vibration alert triggered!');
                }}
                style={{
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Test Vibration 📳
              </button>
            </div>

            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                No notifications yet. Post a requirement or supply to trigger automatic matching alerts.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      background: n.read ? '#F8FAFC' : '#F0FDF4',
                      border: n.read ? '1px solid #E2E8F0' : '1px solid #86EFAC',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>
                          {n.type === 'POOL_FULL' ? '🎉' : n.type === 'BUYER_FOUND' ? '👨‍🌾' : '📦'}
                        </span>
                        <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.25rem' }}>
                        {n.body}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        SmartMandiService.markNotificationRead(n.id);
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                        if (n.recipientRole === 'BUYER') setActiveTab('buy');
                        else setActiveTab('sell');
                      }}
                      style={{
                        background: '#0F172A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </SihLayout>
  );
};
