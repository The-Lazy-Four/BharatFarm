import React from 'react';
import { Link } from 'react-router-dom';
import { ProductListing } from '../types/marketplace.types.js';
import { formatCurrency, buildWhatsAppLink, buildTelLink } from '../utils/marketplace.utils.js';

export const ProductCard: React.FC<{ product: ProductListing }> = ({ product }) => {
  const waLink = buildWhatsAppLink(product.sellerWhatsapp, product.sellerPhone);
  const telLink = buildTelLink(product.sellerPhone);

  return (
    <div
      className="card-glass"
      style={{
        padding: '0.65rem',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        gap: '0.4rem'
      }}
    >
      {/* Image & Category Badge Container */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.04)' }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{ width: '100%', height: '95px', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div style={{ height: '95px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-inset)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px', opacity: 0.4 }}>agriculture</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: 'rgba(0,0,0,0.65)',
              color: '#FFFFFF',
              backdropFilter: 'blur(4px)',
              whiteSpace: 'nowrap'
            }}
          >
            {product.category}
          </span>
          {product.verified && (
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                background: 'var(--emerald-mid)',
                color: '#FFFFFF',
                whiteSpace: 'nowrap'
              }}
            >
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {/* Details Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
        <h4
          style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '2.3em'
          }}
          title={product.title}
        >
          {product.title}
        </h4>

        {/* Price & Quantity */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.1rem' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--emerald-mid)' }}>
            {formatCurrency(product.price)}
            <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)' }}>/{product.unit}</span>
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--surface-inset)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
            {product.quantityAvailable} {product.unit} left
          </span>
        </div>

        {/* Location & Seller */}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '0.15rem' }}>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📍 {product.location}</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>👤 {product.sellerName}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem' }}>
        <Link
          to={`/marketplace/${product.id}`}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.38rem 0.2rem',
            borderRadius: '6px',
            border: '1px solid var(--border-default)',
            background: 'var(--surface-input)',
            color: 'var(--text-primary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          View
        </Link>
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '0.38rem 0.5rem',
              borderRadius: '6px',
              background: '#25D366',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}
            title="Chat on WhatsApp"
          >
            💬
          </a>
        )}
        {telLink && (
          <a
            href={telLink}
            style={{
              padding: '0.38rem 0.5rem',
              borderRadius: '6px',
              background: 'var(--emerald-mid)',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}
            title="Call Seller"
          >
            📞
          </a>
        )}
      </div>
    </div>
  );
};
