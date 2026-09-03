import React, { useState } from 'react';
import { Card } from '@core/ui/Card';
import { FEATURE_IMAGES } from '@core/constants/featureImages';

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
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Logistics Telemetry</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Orders & Delivery — Active Fulfillment Tracker
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
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
                  className="card-glass"
                  style={{
                    padding: '1.25rem',
                    background: selectedOrderId === ord.id ? 'var(--surface-2)' : 'var(--surface-1)',
                    border: selectedOrderId === ord.id ? '1.5px solid var(--border-lime)' : '1px solid var(--border-default)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{ord.id}</span>
                    <span className={`badge badge-${ord.status === 'IN_TRANSIT' ? 'warning' : 'success'}`}>
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
                    {ord.item}
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Vendor: {ord.vendor}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>₹{ord.amount}</strong>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (Span 6): Order Details & Delivery Proof Card */}
        <div className="col-span-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Order Delivery Image Hero Card */}
          <div className="card-feature-backed" style={{ minHeight: '150px' }}>
            <img src={FEATURE_IMAGES.marketplace.url} alt="Agri Delivery" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <span className="badge badge-primary">Direct Freight Logistics</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem', color: '#FFFFFF' }}>Doorstep Farm Delivery</h4>
              <p style={{ fontSize: '0.75rem', opacity: 0.88, color: '#FFFFFF' }}>OTP-protected handoff by regional agricultural delivery partners.</p>
            </div>
          </div>

          <Card title={`Order Tracking — ${selectedOrder.id}`} subtitle={`Fulfillment Status: ${selectedOrder.status.replace('_', ' ')}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div className="alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600 }}>DELIVERY OTP</span>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>{selectedOrder.otp}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block' }}>ESTIMATED ARRIVAL</span>
                  <strong style={{ fontSize: '0.95rem' }}>{selectedOrder.estimatedDelivery}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="inset-stat">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DELIVERY ADDRESS</span>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {selectedOrder.deliveryAddress}
                  </p>
                </div>

                <div className="inset-stat">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RECIPIENT CONTACT</span>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {selectedOrder.buyerName} ({selectedOrder.buyerPhone})
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

