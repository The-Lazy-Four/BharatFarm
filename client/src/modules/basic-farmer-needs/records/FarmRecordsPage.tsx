import React, { useState } from 'react';
import { Card } from '@core/ui/Card';
import { Button } from '@core/ui/Button';
import { Input } from '@core/ui/Input';
import { FEATURE_IMAGES } from '@core/constants/featureImages';

interface FarmRecord {
  id: string;
  date: string;
  crop: string;
  activity: string;
  cost: number;
  notes: string;
}

const MOCK_RECORDS: FarmRecord[] = [
  { id: '1', date: '2026-08-20', crop: 'Wheat', activity: 'Fertilizer Application (NPK)', cost: 2400, notes: 'Applied 50kg bag on Block A' },
  { id: '2', date: '2026-08-15', crop: 'Paddy', activity: 'Irrigation Pass', cost: 650, notes: 'Pumpset ran for 6 hours' },
  { id: '3', date: '2026-08-10', crop: 'Mustard', activity: 'Pesticide Spraying', cost: 1200, notes: 'Preventative neem oil spray' }
];

export const FarmRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<FarmRecord[]>(() => {
    try {
      const saved = localStorage.getItem('bf_farm_records');
      return saved ? JSON.parse(saved) : MOCK_RECORDS;
    } catch {
      return MOCK_RECORDS;
    }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [crop, setCrop] = useState('');
  const [activity, setActivity] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop || !activity) return;
    const newRecord: FarmRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      crop,
      activity,
      cost: Number(cost) || 0,
      notes
    };
    const updated = [newRecord, ...records];
    setRecords(updated);
    try {
      localStorage.setItem('bf_farm_records', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setCrop(''); setActivity(''); setCost(''); setNotes('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    try {
      localStorage.setItem('bf_farm_records', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const totalExpense = records.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Field Telemetry & Log</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Farm Records — Input & Activity Tracker
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Track day-to-day farming activities, input expenses, and harvest yields for full agronomic traceability.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Close Logger' : '➕ Add Field Record'}
        </Button>
      </div>

      {/* Main Grid Layout matching Stitch */}
      <div className="grid-dashboard">
        {/* Left Column (Span 8): Logger Form & Activity Table */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {showAdd && (
            <Card title="📝 Log New Activity" subtitle="Record input applications, labor charges, or field operations.">
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <Input label="Crop Name" placeholder="e.g. Wheat (PBW 725)" value={crop} onChange={e => setCrop(e.target.value)} required />
                  <Input label="Activity Type" placeholder="e.g. Fertilizer, Spray, Sowing" value={activity} onChange={e => setActivity(e.target.value)} required />
                  <Input label="Total Cost (₹)" type="number" placeholder="e.g. 2500" value={cost} onChange={e => setCost(e.target.value)} />
                </div>
                <Input label="Notes & Observations" placeholder="e.g. Split application before expected rain" value={notes} onChange={e => setNotes(e.target.value)} />
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button type="submit">Save Activity Log</Button>
                </div>
              </form>
            </Card>
          )}

          <Card title="📋 Recent Agronomic Log Entries" subtitle="Chronological record of field activities and input expenditures.">
            {records.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                No farm records logged yet. Click "Add Field Record" above to start tracking.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                {records.map(record => (
                  <div key={record.id} className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-primary">{record.crop}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{record.date}</span>
                      </div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.3rem' }}>
                        {record.activity}
                      </h4>
                      {record.notes && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {record.notes}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>₹{record.cost.toLocaleString()}</strong>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(record.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (Span 4): Hero Card & Financial Summary */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Farm Records Image Hero Card */}
          <div className="card-feature-backed" style={{ minHeight: '150px' }}>
            <img src={FEATURE_IMAGES.records.url} alt="Field Operations Log" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <span className="badge badge-primary">Digital Register</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem', color: '#FFFFFF' }}>Agronomic Field Register</h4>
              <p style={{ fontSize: '0.75rem', opacity: 0.88, color: '#FFFFFF' }}>Maintain verifiable records for crop loan applications & subsidy compliance.</p>
            </div>
          </div>

          <Card title="📊 Seasonal Expenditure Summary">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
              <div className="inset-stat">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL LOGGED EXPENSE</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                  ₹{totalExpense.toLocaleString()}
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>across {records.length} field operations</span>
              </div>

              <div className="alert-info">
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>tips_and_updates</span> Smart Record Tip
                </h5>
                <p style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '0.2rem', lineHeight: '1.4' }}>
                  Consistently logging fertilizer split dates helps KrishiBot provide exact harvest window estimates.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

