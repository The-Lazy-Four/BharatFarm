import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Link } from 'react-router-dom';

export const LoanEligibilityPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="Kisan Credit Card (KCC) & Agri Loan Eligibility" subtitle="Instant assessment of your credit limit based on land holding, crop history, and PM-Kisan record.">
        <div style={{ padding: '1rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-primary">High Eligibility Tier</span>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginTop: '0.4rem' }}>Est. Loan Limit: ₹3,50,000</h3>
            </div>
            <Link to="/schemes">
              <Button size="sm">Apply via Schemes</Button>
            </Link>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Based on your 5.0 acres in Ludhiana, Punjab growing Wheat & Paddy. Zero collateral required up to ₹1.6 Lakhs under KCC scheme.
          </p>
        </div>
      </Card>
    </div>
  );
};
