import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { PriceRiskService } from '../../modules/sih/price-risk/priceRisk.service.js';
import { ProfileService } from '../../services/profile.service.js';
import { MobileBottomNav } from '../../components/mobile/MobileBottomNav';

interface MobileFarmerProfileViewProps {
  user: any;
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  state: string;
  setState: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  landAcres: string;
  setLandAcres: (v: string) => void;
  primaryCropsStr: string;
  setPrimaryCropsStr: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  profileImage: string | null;
  getUserInitials: () => string;
  fieldReg: any;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => void;
  isSaving: boolean;
  savedSuccess: boolean;
  errorMsg: string | null;
  pushAlerts: boolean;
  setPushAlerts: (v: boolean) => void;
}

export const MobileFarmerProfileView: React.FC<MobileFarmerProfileViewProps> = ({
  user,
  name,
  setName,
  phone,
  setPhone,
  state,
  setState,
  district,
  setDistrict,
  landAcres,
  setLandAcres,
  primaryCropsStr,
  setPrimaryCropsStr,
  language,
  setLanguage,
  profileImage,
  getUserInitials,
  fieldReg,
  handleImageSelect,
  handleSave,
  handleLogout,
  isSaving,
  savedSuccess,
  errorMsg,
  pushAlerts,
  setPushAlerts
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Derive member since date or fallback
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Apr 2025';

  const userRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Farmer';

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#F8FAFC',
      paddingBottom: '82px',
      fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* 1. COMPACT HEADER */}
      <header style={{
        padding: '0.75rem 1rem',
        background: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F172A',
              cursor: 'pointer',
              padding: 0
            }}
            aria-label="Back to Home"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          </button>
          <h1 style={{ fontSize: '1.18rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Profile
          </h1>
        </div>

        <button
          onClick={() => setShowSettingsModal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#475569',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="App Settings"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>settings</span>
        </button>
      </header>

      <main style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* 2. PROFILE CARD */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '1.1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              {/* Avatar with Camera Overlay */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'relative',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#14532D',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(20, 83, 45, 0.2)'
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  getUserInitials()
                )}
                {/* Camera icon badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #FFFFFF'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>photo_camera</span>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.15rem 0', letterSpacing: '-0.01em' }}>
                  {name}
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, lineHeight: 1.25 }}>
                  {userRole}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginTop: '0.15rem' }}>
                  {district}, {state}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditingPersonal(!isEditingPersonal)}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '9999px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#1E293B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                flexShrink: 0
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#475569' }}>edit</span>
              <span>{isEditingPersonal ? 'Done' : 'Edit'}</span>
            </button>
          </div>

          {/* Member since + Account type row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.65rem',
            marginTop: '0.95rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid #F1F5F9'
          }}>
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '0.6rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#16A34A' }}>calendar_month</span>
              <div>
                <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 600 }}>Member since</div>
                <div style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 800 }}>{memberSince}</div>
              </div>
            </div>

            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '0.6rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#16A34A' }}>eco</span>
              <div>
                <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 600 }}>Account type</div>
                <div style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 800 }}>{userRole}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PERSONAL INFORMATION SECTION */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '1.05rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#15803D' }}>person</span>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Personal Information
              </h3>
            </div>
            <button
              onClick={() => setIsEditingPersonal(!isEditingPersonal)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#15803D',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
              <span>{isEditingPersonal ? 'Close' : 'Edit'}</span>
            </button>
          </div>

          {isEditingPersonal ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                    Cultivated Area (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={landAcres}
                    onChange={e => setLandAcres(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                    Primary Crops
                  </label>
                  <input
                    type="text"
                    value={primaryCropsStr}
                    onChange={e => setPrimaryCropsStr(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {errorMsg && <div style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 700 }}>❌ {errorMsg}</div>}
              {savedSuccess && <div style={{ color: '#16A34A', fontSize: '0.75rem', fontWeight: 700 }}>✓ Profile updated!</div>}

              <button
                type="submit"
                disabled={isSaving}
                style={{
                  background: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginTop: '0.35rem'
                }}
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Full Name</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>{name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Phone Number</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>{phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Email</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>{user?.email || 'souvik@example.com'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Language</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>
                  {language === 'hi' ? 'हिंदी (Hindi)' : language === 'bn' ? 'বাংলা (Bengali)' : 'English'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Location</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>{district}, {state}</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. REGISTERED FARM SECTION */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '1.05rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#15803D' }}>landscape</span>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Registered Farm
              </h3>
            </div>
            <span
              onClick={() => navigate('/sih/field-mapping')}
              style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803D', cursor: 'pointer' }}
            >
              View All
            </span>
          </div>

          <div
            onClick={() => navigate('/sih/field-mapping')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              cursor: 'pointer',
              background: '#F8FAFC',
              borderRadius: '14px',
              padding: '0.65rem 0.75rem',
              border: '1px solid #E2E8F0'
            }}
          >
            {/* Farm thumbnail */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80"
                alt={fieldReg.fieldName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                <h4 style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {fieldReg.fieldName}
                </h4>
                <span style={{
                  background: '#DCFCE7',
                  color: '#15803D',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  fontSize: '0.65rem',
                  fontWeight: 800
                }}>
                  Primary
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 600 }}>
                {fieldReg.crop} • {fieldReg.landSizeAcres} Acres
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#16A34A' }}>location_on</span>
                <span>{fieldReg.district}, {fieldReg.state}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. QUICK ACTIONS SECTION (4 Clean Action Cards) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.6rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#15803D' }}>bolt</span>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Quick Actions
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {/* Update Farm */}
            <div
              onClick={() => setIsEditingPersonal(true)}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '0.75rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#DCFCE7',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.35rem'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>eco</span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.15 }}>
                Update<br />Farm Details
              </span>
            </div>

            {/* Field Mapping */}
            <div
              onClick={() => navigate('/sih/field-mapping')}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '0.75rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#F0FDFA',
                color: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.35rem'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>map</span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.15 }}>
                Field<br />Mapping
              </span>
            </div>

            {/* Soil Insights */}
            <div
              onClick={() => navigate('/sih/climate-risk')}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '0.75rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#EFF6FF',
                color: '#1D4ED8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.35rem'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>psychology</span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.15 }}>
                Soil<br />Insights
              </span>
            </div>

            {/* Help & Support */}
            <div
              onClick={() => navigate('/sih/sahayak')}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '0.75rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#F5F3FF',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.35rem'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>support_agent</span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.15 }}>
                Help &<br />Support
              </span>
            </div>
          </div>
        </div>

        {/* 6. APP SETTINGS SECTION */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '1.05rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#15803D' }}>settings</span>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                App Settings
              </h3>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>chevron_right</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Language Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0',
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>translate</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>Language</span>
              </div>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#15803D',
                  cursor: 'pointer',
                  outline: 'none',
                  textAlign: 'right'
                }}
              >
                <option value="en">English &gt;</option>
                <option value="hi">हिंदी &gt;</option>
                <option value="bn">বাংলা &gt;</option>
              </select>
            </div>

            {/* Notifications Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0',
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>notifications</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>Notifications</span>
              </div>
              <span
                onClick={() => setPushAlerts(!pushAlerts)}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: pushAlerts ? '#15803D' : '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                {pushAlerts ? 'On' : 'Off'} &gt;
              </span>
            </div>

            {/* Theme Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>dark_mode</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>Theme</span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>
                System Default &gt;
              </span>
            </div>
          </div>
        </div>

        {/* 7. LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: '0.4rem',
            width: '100%',
            background: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            borderRadius: '14px',
            padding: '0.85rem',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            boxShadow: '0 1px 3px rgba(220, 38, 38, 0.08)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          <span>Logout</span>
        </button>
      </main>

      {/* Settings Modal Sheet (if opened) */}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '1.25rem',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Preferences & System</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1rem' }}>
              PWA Offline Cache: <strong style={{ color: '#16A34A' }}>Active (v1.3.0)</strong><br />
              Central AI Gateway: <strong style={{ color: '#16A34A' }}>Connected</strong>
            </div>
            <button
              onClick={() => setShowSettingsModal(false)}
              style={{
                width: '100%',
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 8. MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav type="main" />
    </div>
  );
};
