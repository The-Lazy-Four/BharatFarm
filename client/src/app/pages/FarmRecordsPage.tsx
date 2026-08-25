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
  const [records, setRecords] = useState<FarmRecord[]>(MOCK_RECORDS);
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
    setRecords([newRecord, ...records]);
    setCrop(''); setActivity(''); setCost(''); setNotes('');
    setShowAdd(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Card
        title="Farm Records & Field Management"
        subtitle="Log day-to-day farming activities, input expenses, and harvest yields for full traceability."
        action={
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Cancel' : '+ Add Log Entry'}
          </Button>
        }
      >
        {showAdd && (
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem', padding: '1rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)' }}>
            <Input label="Crop Name" placeholder="e.g. Wheat" value={crop} onChange={e => setCrop(e.target.value)} required />
            <Input label="Activity / Task" placeholder="e.g. Sowing, Fertilizer" value={activity} onChange={e => setActivity(e.target.value)} required />
            <Input label="Cost (₹)" type="number" placeholder="0" value={cost} onChange={e => setCost(e.target.value)} />
            <Input label="Notes" placeholder="Additional details..." value={notes} onChange={e => setNotes(e.target.value)} />
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" size="sm">Save Entry</Button>
            </div>
          </form>
        )}
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {records.map(rec => (
          <Card key={rec.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-primary">{rec.crop}</span>
                <h4 style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>{rec.activity}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{rec.notes}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>₹{rec.cost.toLocaleString('en-IN')}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.date}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
