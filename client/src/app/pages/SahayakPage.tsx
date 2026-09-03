import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { useNavigate } from 'react-router-dom';
import { SihLayout } from '../../components/layout/SihLayout.js';

export const SahayakPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SihLayout
      activeModuleId="sahayak"
      moduleTitle="Sahayak & WhatsApp"
      moduleIcon="💬"
      moduleBadge="Voice & WhatsApp"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem 2.5rem' }}>
        
        {/* Hero Banner Section */}
        <div className="page-header-banner" style={{ background: 'linear-gradient(135deg, #062612 0%, #15803d 100%)', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-primary" style={{ background: '#22c55e', color: '#04210e', fontWeight: 900 }}>
                SIH INNOVATION MODULE #5
              </span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)' }}>• Assisted Agriculture & WhatsApp AI Companion</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
              Sahayak – Assisted Farmer Access & WhatsApp Integration
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.88rem', marginTop: '0.25rem', maxWidth: '780px' }}>
              Bridging the digital divide for smallholder farmers through local human Sahayaks, native voice assistant, and instant 24/7 WhatsApp AI advisory.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="primary" size="md" style={{ background: '#22c55e', border: 'none', color: '#04210e', fontWeight: 800 }} onClick={() => navigate('/krishibot')}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '4px' }}>chat</span> Open Voice & WhatsApp Assistant
            </Button>
          </div>
        </div>

        {/* Problem / Solution Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          {/* Problem Statement Card */}
          <Card title="⚠️ Problem Being Solved" subtitle="Digital exclusion & complex app UIs">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
              Many smallholder farmers face low digital literacy, language barriers, and eye fatigue when attempting to navigate complex smartphone dashboards.
            </p>
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.25)', marginTop: '0.75rem' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', margin: 0 }}>Why Existing Systems Are Insufficient:</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.35, margin: 0 }}>
                App-only solutions force non-tech-savvy farmers to depend on computer centers or remain digitally excluded from online government schemes and MSP group buying.
              </p>
            </div>
          </Card>

          {/* Our Solution Card */}
          <Card title="💡 Our Sahayak & WhatsApp Solution" subtitle="Dual Human + AI Assistance Layer">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
              BharatFarm provides a 2-tier access bridge: (1) Verified local village Sahayaks who assist farmers in-person with consent-based actions, and (2) WhatsApp voice/text AI companion.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
              <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                <strong>💬 WhatsApp AI:</strong> 24/7 Voice & Text
              </div>
              <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                <strong>🤝 Village Sahayak:</strong> Assisted Onboarding
              </div>
            </div>
          </Card>
        </div>

        {/* WhatsApp Integration Simulator */}
        <Card title="📱 WhatsApp AI Assistant Integration" subtitle="Instant advisory on WhatsApp without installing extra apps">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📲</span> BharatFarm Official WhatsApp Companion
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>
                  Send voice notes in Hindi/Punjabi or photos of diseased crops to get instant diagnosis.
                </p>
              </div>
              <Button variant="primary" size="md" onClick={() => alert('WhatsApp Assistant simulator initiated! Text +91 98765 43210')}>
                Connect on WhatsApp ➔
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </SihLayout>
  );
};
