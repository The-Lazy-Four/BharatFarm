import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';

/**
 * FUTURE DATA STRUCTURE REFERENCE (MODULE 1 DEVELOPMENT)
 * 
 * interface Sahayak {
 *   _id: string;
 *   name: string;
 *   mobile: string;
 *   region: string;
 *   pincode: string;
 *   status: 'ACTIVE' | 'VERIFIED' | 'PENDING';
 *   commissionRate: number;
 *   auditLog: Array<{ actionId: string; timestamp: string; details: string }>;
 * }
 * 
 * interface AssistedAction {
 *   _id: string;
 *   sahayakId: string;
 *   farmerId: string;
 *   actionType: 'CROP_INTENT' | 'MARKET_LISTING' | 'GROUP_BUY' | 'SCHEME_APP';
 *   consentObtained: boolean;
 *   timestamp: string;
 *   details: Record<string, unknown>;
 * }
 * 
 * interface FarmerProfile {
 *   farmerId: string;
 *   fullName: string;
 *   mobile: string;
 *   pincode: string;
 *   landAreaAcres: number;
 *   cropHistory: string[];
 *   createdBySahayak: boolean;
 * }
 */

export const SahayakPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Hero Banner Section */}
      <div className="page-header-banner" style={{ background: 'linear-gradient(135deg, rgba(16, 45, 24, 0.95) 0%, rgba(8, 25, 12, 0.98) 100%)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary" style={{ background: 'var(--signal-lime)', color: 'var(--text-on-lime)', fontWeight: 800 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px', verticalAlign: 'middle' }}>engineering</span>
              MODULE 1 IN DEVELOPMENT
            </span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)' }}>• Core Assisted Agriculture Layer</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Sahayak Assistance Platform
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.88rem', marginTop: '0.25rem', maxWidth: '720px' }}>
            Get help from a trusted local Sahayak to use BharatFarm's digital farming services, submit crop intent, order seeds, and check government schemes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="primary" size="md" onClick={() => alert('Sahayak module integration is currently in development scaffold mode.')}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>handshake</span> Find Local Sahayak
          </Button>
        </div>
      </div>

      {/* Architectural Integration Alert Card */}
      <Card title="Module 1 Integration Architecture" subtitle="How Sahayak bridges farmers with BharatFarm AI services">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div className="inset-stat" style={{ borderLeft: '4px solid var(--emerald-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emerald-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>psychology</span>
              SAHAYAK → AI PREDICTOR
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.3' }}>
              Crop-intent information collected with Sahayak assistance flows into regional crop supply/demand analysis.
            </p>
          </div>

          <div className="inset-stat" style={{ borderLeft: '4px solid var(--signal-lime)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--signal-lime)', fontWeight: 700, fontSize: '0.85rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
              SAHAYAK → GROUP BUYING
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.3' }}>
              Fertilizer & seed requirements identified in Sahayak sessions pool directly into neighborhood discounts.
            </p>
          </div>

          <div className="inset-stat" style={{ borderLeft: '4px solid #38bdf8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>notifications_active</span>
              SAHAYAK → NOTIFICATIONS
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.3' }}>
              Critical harvest alerts, government subsidies, and order dispatches sent via instant SMS & push alerts.
            </p>
          </div>
        </div>
      </Card>

      {/* Section A: Find a Sahayak */}
      <Card title="A. Registered Local Sahayaks" subtitle="Verified community partners available for digital field support">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          {[
            { name: 'Gurpreet Singh', region: 'Ludhiana, Punjab', pincode: '141001', verified: true, jobs: '142 Farmers Assisted' },
            { name: 'Sukhwinder Kaur', region: 'Jalandhar, Punjab', pincode: '144001', verified: true, jobs: '98 Farmers Assisted' },
            { name: 'Harmanpreet Verma', region: 'Patiala, Punjab', pincode: '147001', verified: true, jobs: '215 Farmers Assisted' }
          ].map((item, idx) => (
            <div key={idx} className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-success">
                    <span className="material-symbols-outlined" style={{ fontSize: '12px', marginRight: '3px' }}>verified</span>
                    VERIFIED SAHAYAK
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PIN: {item.pincode}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{item.name}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.region}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--emerald-primary)', fontWeight: 600, marginTop: '0.2rem' }}>{item.jobs}</p>
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" size="sm" style={{ flex: 1 }} onClick={() => alert('Assistance request dispatch simulated.')}>
                  Request Support
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section B: Assisted Tasks */}
      <Card title="B. Assisted Farmer Services" subtitle="Services a Sahayak can perform on behalf of a farmer with explicit consent">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginTop: '0.5rem' }}>
          {[
            { icon: 'how_to_reg', title: 'Farmer Registration', desc: 'KYC & mobile verification' },
            { icon: 'person_add', title: 'Profile Setup', desc: 'Land & soil data entry' },
            { icon: 'grass', title: 'Crop Intent Entry', desc: 'Seasonal planting logging' },
            { icon: 'storefront', title: 'Marketplace Trade', desc: 'Crop listing & MSP lookup' },
            { icon: 'group_add', title: 'Group Buying', desc: 'Fertilizer & seed pooling' },
            { icon: 'account_balance', title: 'Govt Subsidies', desc: 'PM-KISAN application' }
          ].map((task, idx) => (
            <div key={idx} className="inset-stat" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--signal-lime)' }}>{task.icon}</span>
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{task.title}</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{task.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section C: Workflow */}
      <Card title="C. How Sahayak Works" subtitle="Simple 6-step assisted workflow for local farmers">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
          {[
            { step: '01', title: 'Approach', text: 'Farmer contacts local verified Sahayak' },
            { step: '02', title: 'Information', text: 'Farmer details requirement verbally' },
            { step: '03', title: 'Need Identified', text: 'Sahayak selects corresponding service' },
            { step: '04', title: 'Consent', text: 'Farmer grants explicit OTP/Verbal consent' },
            { step: '05', title: 'Digital Action', text: 'BharatFarm module processes request' },
            { step: '06', title: 'Receipt & Update', text: 'Farmer receives SMS & audit record' }
          ].map((st, idx) => (
            <div key={idx} className="inset-stat" style={{ position: 'relative' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--emerald-primary)', opacity: 0.6 }}>{st.step}</span>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{st.title}</h5>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: '1.25' }}>{st.text}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Section D & E: Trust & Security Guarantees */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <Card title="D. Trust & Explicit Consent System" subtitle="Farmer remains in full authority of all account actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.25rem' }}>
            {[
              '✓ Verified Sahayak identity check required before session start',
              '✓ Mandatory OTP consent for crop sales & fertilizer purchases',
              '✓ Zero financial changes permitted without farmer confirmation',
              '✓ Complete tamper-proof audit trail recorded for every action'
            ].map((rule, idx) => (
              <div key={idx} style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', background: 'var(--surface-inset)', fontSize: '0.8rem', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                {rule}
              </div>
            ))}
          </div>
        </Card>

        {/* Section F: Developer Scaffold Dashboard */}
        <Card title="E. Future Developer Dashboard Placeholder" subtitle="Scaffold UI sections for Module 1 implementation">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', marginTop: '0.25rem' }}>
            {[
              { label: 'Assisted Farmers', count: '24 Assigned' },
              { label: 'Pending Requests', count: '3 Active' },
              { label: 'Crop Intent Logs', count: '18 Logged' },
              { label: 'Group Buying Pools', count: '5 Joined' }
            ].map((dash, idx) => (
              <div key={idx} className="inset-stat">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dash.label}</span>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--emerald-primary)', marginTop: '0.2rem' }}>{dash.count}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
};
