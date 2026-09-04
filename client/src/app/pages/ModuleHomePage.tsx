import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

interface SihCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
}

export const ModuleHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const sihInnovations: SihCard[] = [
    {
      id: 'climate-risk',
      title: 'Climate Risk',
      description: 'Weather insights & procurement',
      icon: 'partly_cloudy_day',
      path: '/sih/climate-risk'
    },
    {
      id: 'aggregation',
      title: 'Aggregation',
      description: 'Group buying & selling',
      icon: 'groups',
      path: '/sih/aggregation'
    },
    {
      id: 'crop-insurance',
      title: 'Crop Insurance',
      description: 'Risk analysis & claim support',
      icon: 'verified_user',
      path: '/sih/crop-insurance'
    },
    {
      id: 'smart-mandi',
      title: 'Smart Mandi',
      description: 'Best prices & nearest markets',
      icon: 'bar_chart',
      path: '/sih/smart-mandi'
    },
    {
      id: 'sahayak',
      title: 'Sahayak',
      description: 'AI + Human support',
      icon: 'eco',
      path: '/sih/sahayak'
    }
  ];

  const filteredInnovations = sihInnovations.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Top Main Navigation Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0.85rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#FFFFFF' }}>agriculture</span>
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1E293B', letterSpacing: '-0.02em' }}>BharatFarm</span>
        </div>

        {/* Global Search Bar */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          margin: '0 1rem'
        }} className="header-search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.5rem',
              borderRadius: '20px',
              border: '1px solid #CBD5E1',
              background: '#F1F5F9',
              fontSize: '0.88rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <span className="material-symbols-outlined" style={{
            position: 'absolute',
            left: '0.8rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: '#64748B'
          }}>search</span>
        </div>

        {/* Header Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            title="Notifications"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
          </button>

          {/* User Avatar Circle */}
          <div
            onClick={logout}
            title={`Logged in as ${user?.fullName || 'Farmer'} (Click to Logout)`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#16A34A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
            }}
          >
            {user?.fullName ? user.fullName[0].toUpperCase() : 'S'}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main style={{
        flex: 1,
        padding: '2.5rem 2rem',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
      }}>
        
        {/* Welcome Banner */}
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: '#0F172A',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Hello, Farmer! 👋
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            marginTop: '0.35rem',
            marginBottom: 0,
            fontWeight: 500
          }}>
            Choose a feature to continue
          </p>
        </div>

        {/* Section A: SIH Innovations */}
        <section>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#16A34A' }}>eco</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                SIH Innovations
              </h2>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>
              5 Advanced Solutions
            </span>
          </div>

          {/* 5 Compact Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredInnovations.map((card) => (
              <div
                key={card.id}
                onClick={() => navigate(card.path)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '1.5rem 1.25rem',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '190px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                className="sih-feature-card"
              >
                <div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#DCFCE7',
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{card.icon}</span>
                  </div>

                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: '0 0 0.35rem 0',
                    lineHeight: 1.2
                  }}>
                    {card.title}
                  </h3>

                  <p style={{
                    fontSize: '0.82rem',
                    color: '#64748B',
                    margin: 0,
                    lineHeight: 1.4,
                    fontWeight: 500
                  }}>
                    {card.description}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '1rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#16A34A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section B: Basic Farmer Needs (Horizontal Banner Card) */}
        <section>
          <div
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
              borderRadius: '20px',
              padding: '2rem',
              border: '1.5px solid #FDE047',
              boxShadow: '0 8px 20px rgba(234, 179, 8, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 2 }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: '#16A34A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(22, 163, 74, 0.3)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>agriculture</span>
              </div>

              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#713F12', margin: '0 0 0.35rem 0' }}>
                  Basic Farmer Needs
                </h2>
                <p style={{ fontSize: '1rem', color: '#854D0E', margin: 0, fontWeight: 700 }}>
                  Your everyday farming companion
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#713F12', fontWeight: 800, fontSize: '1.1rem', zIndex: 2 }}>
              <span>Open Dashboard</span>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_forward</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
