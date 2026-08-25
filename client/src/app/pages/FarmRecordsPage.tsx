import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(15, 56, 34, 0.97) 0%, rgba(20, 83, 45, 0.93) 100%)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-3d)',
        color: '#FFFFFF'
      }}>
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
        {/* Left Column (Span 8): Recent Activity Logs */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Activity & Expense Logs" subtitle="Historical record of all farm operations and input applications.">
            {showAdd && (
              <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1.25rem', background: '#FFFDF5', border: '1px solid #FCD34D', borderRadius: 'var(--radius-sm)' }}>
                <Input label="Crop Name" placeholder="e.g. Wheat (PBW 725)" value={crop} onChange={e => setCrop(e.target.value)} required />
                <Input label="Activity / Task" placeholder="e.g. Sowing, Fertigation" value={activity} onChange={e => setActivity(e.target.value)} required />
                <Input label="Cost (₹)" type="number" placeholder="0" value={cost} onChange={e => setCost(e.target.value)} />
                <Input label="Notes" placeholder="Additional details..." value={notes} onChange={e => setNotes(e.target.value)} />
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button type="submit" size="sm">Save Entry</Button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {records.map(rec => (
                <div key={rec.id} style={{ padding: '1rem', background: 'var(--card-gray)', borderRadius: '12px', border: '1px solid rgba(34,37,31,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-primary">{rec.crop}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.date}</span>
                    </div>
                    <h4 style={{ marginTop: '0.4rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark-text)' }}>{rec.activity}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{rec.notes}</p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-text)' }}>₹{rec.cost.toLocaleString('en-IN')}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Input Cost</span>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.2rem' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (Span 4): Seasonal Expense Summary & Record Details (Stitch reference) */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Seasonal Financial Summary" subtitle="Total tracked expenses for active Rabi season.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(215, 242, 26, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--signal-lime)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL EXPENDITURE</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.25rem 0' }}>
                  ₹{totalExpense.toLocaleString('en-IN')}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across {records.length} logged activity passes</p>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--card-gray)', borderRadius: '12px', border: '1px solid rgba(34,37,31,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fertilizers & Chemicals</span>
                  <strong style={{ color: 'var(--dark-text)' }}>₹3,600</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Labor & Machinery</span>
                  <strong style={{ color: 'var(--dark-text)' }}>₹650</strong>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Export & Audit">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Export farm logs as certified PDF records for bank loan verification or organic certification compliance.
            </p>
            <Button variant="secondary" size="sm" style={{ width: '100%', marginTop: '0.75rem' }}>
              📄 Export Certified Logs (PDF)
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
