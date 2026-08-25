import React from 'react';
import { ProductListing } from '../types/marketplace.types.js';
import { SellerInfo } from './SellerInfo.js';
import { formatCurrency } from '../utils/marketplace.utils.js';

export const ProductDetails: React.FC<{ product: ProductListing }> = ({ product }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{product.title}</h2>
        <p style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{product.category}</p>
      </div>

      <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
        {formatCurrency(product.price)}
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> / {product.unit}</span>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Quantity</p>
          <p style={{ fontWeight: 600 }}>
            {product.quantityAvailable} {product.unit}
          </p>
        </div>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</p>
          <p style={{ fontWeight: 600 }}>📍 {product.location}</p>
        </div>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Listed On</p>
          <p style={{ fontWeight: 600 }}>{new Date(product.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Seller</p>
        <SellerInfo
          name={product.sellerName}
          rating={product.sellerRating}
          verified={product.verified}
          phone={product.sellerPhone}
          whatsapp={product.sellerWhatsapp}
        />
      </div>
    </div>
  );
};
