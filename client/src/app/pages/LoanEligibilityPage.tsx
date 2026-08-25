import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Link } from 'react-router-dom';
import { FEATURE_IMAGES } from '../../constants/featureImages.js';

export const LoanEligibilityPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Agronomic Credit Scoring Engine</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Loan Eligibility Assessment
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
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
            <div className="alert-success" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-primary">High Eligibility Tier (Grade A)</span>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.35rem 0 0.25rem 0' }}>
                    Est. Credit Limit: ₹3,50,000
                  </h2>
                  <p style={{ fontSize: '0.85rem', opacity: 0.88 }}>
                    Based on 5.0 acres in Ludhiana, Punjab (Wheat & Paddy rotational cycle).
                  </p>
                </div>
                <Link to="/schemes">
                  <Button variant="primary" size="md">Apply via KCC Scheme</Button>
                </Link>
              </div>
            </div>

            {/* Key Assessment Factors Grid */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>Key Evaluation Factors</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="inset-stat">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Land Ownership</span>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>5.0 Acres (Clear Title)</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>✔ Verified via Khatauni</span>
              </div>

              <div className="inset-stat">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NDVI Health Rating</span>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>0.78 / 1.0 (Optimal)</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>✔ Low Crop Failure Risk</span>
              </div>

              <div className="inset-stat">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Collateral Exemption</span>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>Up to ₹1,60,000</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>Zero Collateral Required</span>
              </div>
            </div>
          </Card>

          {/* Recommended Financial Offerings Panel (Stitch reference) */}
          <Card title="Recommended Financial Products" subtitle="Curated credit lines backed by NABARD & partner banks.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem' }}>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Kisan Credit Card (KCC) Limit Enhancement</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Upgrade existing limit with 4% interest subvention under PM-KISAN tie-up.
                  </p>
                </div>
                <Link to="/schemes">
                  <Button variant="outline" size="sm">Explore Scheme ➔</Button>
                </Link>
              </div>

              <div className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem' }}>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Solar Pumpset & Equipment Financing</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    High approval odds for PM-KUSUM solar pump subsidy and tractor loans.
                  </p>
                </div>
                <Link to="/schemes">
                  <Button variant="outline" size="sm">View Partners ➔</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Span 4): Financial Credit Image Hero Card & Document Checklist */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Financial Credit Image Hero Card */}
          <div className="card-feature-backed" style={{ minHeight: '150px' }}>
            <img src={FEATURE_IMAGES.schemes.url} alt="Kisan Credit Card" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <span className="badge badge-primary">NABARD Benchmark</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem', color: '#FFFFFF' }}>Institutional Credit Assessment</h4>
              <p style={{ fontSize: '0.75rem', opacity: 0.88, color: '#FFFFFF' }}>Fast-track loan approval with satellite crop health score validation.</p>
            </div>
          </div>

          <Card title="📑 Required Document Checklist" subtitle="Keep these documents ready for bank branch submission.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div className="alert-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Aadhaar & Bank Account Passbook</span>
              </div>
              <div className="alert-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Land Registry Extract (Khatauni / Khasra)</span>
              </div>
              <div className="alert-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Latest Harvest Mandi Receipts</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
