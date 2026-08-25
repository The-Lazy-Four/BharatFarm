import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Link } from 'react-router-dom';

export const LoanEligibilityPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Agronomic Credit Scoring Engine</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--dark-text)' }}>
            Loan Eligibility Assessment
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Complete assessment to evaluate your farm's readiness for financial products and KCC limit upgrades.
          </p>
        </div>
      </div>

      {/* Main Grid Layout matching Stitch */}
      <div className="grid-dashboard">
        {/* Left Column (Span 8): Credit Assessment Metrics & Score Breakdown */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Assessment Output Card */}
          <Card title="Assessment Results" subtitle="Based on your verified land records, crop history, and platform telemetry.">
            <div style={{ padding: '1.25rem', background: 'rgba(215, 242, 26, 0.15)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--signal-lime)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-primary">High Eligibility Tier (Grade A)</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.35rem 0 0.25rem 0' }}>
                    Est. Credit Limit: ₹3,50,000
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Based on 5.0 acres in Ludhiana, Punjab (Wheat & Paddy rotational cycle).
                  </p>
                </div>
                <Link to="/schemes">
                  <Button variant="primary" size="md">Apply via KCC Scheme</Button>
                </Link>
              </div>
            </div>

            {/* Key Assessment Factors Grid */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark-text)', marginBottom: '0.85rem' }}>Key Evaluation Factors</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--card-gray)', borderRadius: '12px', border: '1px solid rgba(34,37,31,0.1)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Land Ownership</span>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-text)', marginTop: '0.2rem' }}>5.0 Acres (Clear Title)</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--dark-text)', fontWeight: 600 }}>✔ Verified via Khatauni</span>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--card-gray)', borderRadius: '12px', border: '1px solid rgba(34,37,31,0.1)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NDVI Health Rating</span>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-text)', marginTop: '0.2rem' }}>0.78 / 1.0 (Optimal)</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--dark-text)', fontWeight: 600 }}>✔ Low Crop Failure Risk</span>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--card-gray)', borderRadius: '12px', border: '1px solid rgba(34,37,31,0.1)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Collateral Exemption</span>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-text)', marginTop: '0.2rem' }}>Up to ₹1,60,000</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--dark-text)', fontWeight: 600 }}>Zero Collateral Required</span>
              </div>
            </div>
          </Card>

          {/* Recommended Financial Offerings Panel (Stitch reference) */}
          <Card title="Recommended Financial Products" subtitle="Curated credit lines backed by NABARD & partner banks.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ padding: '1rem', background: 'var(--card-gray)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,37,31,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark-text)' }}>Kisan Credit Card (KCC) Limit Enhancement</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Upgrade existing limit with 4% interest subvention under PM-KISAN tie-up.
                  </p>
                </div>
                <Button variant="outline" size="sm">Explore Scheme ➔</Button>
              </div>

              <div style={{ padding: '1rem', background: 'var(--card-gray)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,37,31,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark-text)' }}>Solar Pumpset & Equipment Financing</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    High approval odds for PM-KUSUM solar pump subsidy and tractor loans.
                  </p>
                </div>
                <Button variant="outline" size="sm">View Partners ➔</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Span 4): Advisor Contact & Legal Disclaimer (Stitch reference) */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Connect with Agri Financial Advisor">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Speak with a dedicated NABARD agronomist to assist with paperwork, collateral waiver certificates, and bank branch submission.
            </p>
            <Button variant="secondary" size="md" style={{ width: '100%', marginTop: '1rem' }}>
              📞 Request Advisor Call
            </Button>
          </Card>

          <Card title="Disclaimer & Notice">
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              The BharatFarm Eligibility Assessment is a proprietary indicative tool designed to evaluate readiness for agricultural credit products based on farm telemetry. This is NOT an official credit bureau score (CIBIL). Final interest rates and sanction limits are governed by individual partner bank policies.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
