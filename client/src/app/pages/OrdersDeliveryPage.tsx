import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';

interface Order {
  id: string;
  item: string;
  vendor: string;
  amount: number;
  status: 'DELIVERED' | 'IN_TRANSIT' | 'PROCESSING';
  estimatedDelivery: string;
}

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-8821', item: 'NPK 19-19-19 Fertilizer (50kg)', vendor: 'Sri Agro Corp', amount: 1400, status: 'IN_TRANSIT', estimatedDelivery: 'Tomorrow, 4:00 PM' },
  { id: 'ORD-7740', item: 'Hybrid Mustard Seeds (RPM-518)', vendor: 'Rajesh Seed Agency', amount: 900, status: 'DELIVERED', estimatedDelivery: 'Aug 22, 2026' },
  { id: 'ORD-6512', item: 'Knapsack Sprayer (16L)', vendor: 'Param Agro Store', amount: 2800, status: 'DELIVERED', estimatedDelivery: 'Aug 15, 2026' }
];

export const OrdersDeliveryPage: React.FC = () => {
  const [orders] = useState<Order[]>(MOCK_ORDERS);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <Card title="Orders & Delivery Tracking" subtitle="Track input supplies, group buy deliveries, and direct marketplace sales.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(ord => (
            <Card key={ord.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span className={`badge ${ord.status === 'DELIVERED' ? 'badge-primary' : 'badge-warning'}`}>
                    {ord.status.replace('_', ' ')}
                  </span>
                  <h4 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--text-main)' }}>{ord.item}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vendor: {ord.vendor} • Order ID: {ord.id}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>₹{ord.amount.toLocaleString('en-IN')}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Est. Delivery: {ord.estimatedDelivery}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
