import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';

interface Order {
  id: string;
  item: string;
  vendor: string;
  amount: number;
  status: 'DELIVERED' | 'IN_TRANSIT' | 'PROCESSING';
  estimatedDelivery: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  otp: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-8821',
    item: 'NPK 19-19-19 Fertilizer (50kg Bag x 2)',
    vendor: 'National AgriCorp (Ludhiana Hub)',
    amount: 1900,
    status: 'IN_TRANSIT',
    estimatedDelivery: 'Today by 5:00 PM',
    buyerName: 'Ramesh Patel',
    buyerPhone: '+91 98765 43210',
    deliveryAddress: 'Farm No. 4, GT Road, Khanna, Ludhiana, Punjab',
    otp: '4829'
  },
  {
    id: 'ORD-7740',
    item: 'Hybrid Mustard Seeds (RPM-518 5kg)',
    vendor: 'Rajesh Seed Agency',
    amount: 900,
    status: 'DELIVERED',
    estimatedDelivery: 'Aug 22, 2026',
    buyerName: 'Ramesh Patel',
    buyerPhone: '+91 98765 43210',
    deliveryAddress: 'Farm No. 4, GT Road, Khanna, Ludhiana, Punjab',
    otp: '1192'
  },
  {
    id: 'ORD-6512',
    item: 'Knapsack Battery Sprayer (16L)',
    vendor: 'Param Agro Store',
    amount: 2800,
    status: 'DELIVERED',
    estimatedDelivery: 'Aug 15, 2026',
    buyerName: 'Ramesh Patel',
    buyerPhone: '+91 98765 43210',
    deliveryAddress: 'Farm No. 4, GT Road, Khanna, Ludhiana, Punjab',
    otp: '7731'
  }
];

export const OrdersDeliveryPage: React.FC = () => {
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-8821');

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

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
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Logistics Telemetry</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--dark-text)' }}>
            Orders & Delivery — Active Fulfillment Tracker
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Real-time status updates on input orders, group buying shipments, and marketplace deliveries.
          </p>
        </div>
      </div>

      {/* Main Grid Layout matching Stitch */}
      <div className="grid-dashboard">
        {/* Left Column (Span 6): Active Orders List */}
        <div className="col-span-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Your Orders" subtitle="Select an order to view dispatch details and live delivery tracking.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {orders.map(ord => (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  style={{
                    padding: '1.25rem',
                    background: selectedOrderId === ord.id ? 'rgba(215, 242, 26, 0.15)' : 'var(--card-gray)',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${selectedOrderId === ord.id ? 'var(--signal-lime)' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span className={`badge ${ord.status === 'DELIVERED' ? 'badge-primary' : 'badge-warning'}`}>
                        {ord.status.replace('_', ' ')}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.4rem', color: 'var(--dark-text)' }}>{ord.item}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Supplier: {ord.vendor} • #{ord.id}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-text)' }}>₹{ord.amount.toLocaleString('en-IN')}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{ord.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (Span 6): Selected Order Detail, Live Timeline & Delivery Verification OTP (Stitch reference) */}
        <div className="col-span-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title={`Order Details — #${selectedOrder.id}`} subtitle={`Status: ${selectedOrder.status.replace('_', ' ')}`}>
            {/* Dispatch & Address Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'var(--card-gray)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,37,31,0.1)', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>BUYER & DELIVERY ADDRESS</span>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)', marginTop: '0.2rem' }}>{selectedOrder.buyerName}</h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedOrder.buyerPhone}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{selectedOrder.deliveryAddress}</p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SUPPLIER & PICKUP HUB</span>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)', marginTop: '0.2rem' }}>{selectedOrder.vendor}</h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Regional Distribution Hub</p>
              </div>
            </div>

            {/* Tracking Progress Bar matching Stitch */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark-text)', marginBottom: '1rem' }}>Fulfillment Timeline</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--dark-text)' }}>
              <div style={{ paddingLeft: '0.75rem' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-text)' }}>✔ Order Placed & Payment Confirmed</h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aug 24, 2026 • 10:15 AM</p>
              </div>
              <div style={{ paddingLeft: '0.75rem' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-text)' }}>✔ Dispatched from Regional Warehouse</h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aug 25, 2026 • 06:30 AM</p>
              </div>
              <div style={{ paddingLeft: '0.75rem' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-text)' }}>🚚 Out for Doorstep Delivery</h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--dark-text)', fontWeight: 500 }}>{selectedOrder.estimatedDelivery}</p>
              </div>
            </div>

            {/* Delivery Verification Code Box (Stitch reference) */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#FFFDF5', border: '1px solid #FCD34D', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400E' }}>Delivery Verification Code (OTP)</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Share this code with the delivery partner upon arrival.</p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: '#FFFFFF', border: '2px dashed #F59E0B', borderRadius: '12px', fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-text)', letterSpacing: '2px' }}>
                  {selectedOrder.otp}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
