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
        padding: '0.75rem',
        borderRadius: 'var(--radius)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        gap: '0.6rem',
        transition: 'var(--transition)'
      }}
    >
      {/* Image & Category Overlay */}
      <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface-inset)' }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{
              width: '100%',
              height: '120px',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.35s ease'
            }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-inset)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', opacity: 0.35, color: 'var(--text-muted)' }}>
              agriculture
            </span>
          </div>
        )}

        <div style={{ position: 'absolute', top: '6px', left: '6px', right: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
          <span
            className="badge"
            style={{
              fontSize: '0.6rem',
              background: 'rgba(0,0,0,0.65)',
              color: '#FFFFFF',
              backdropFilter: 'blur(4px)',
              padding: '0.15rem 0.45rem'
            }}
          >
            {product.category}
          </span>
          {product.verified && (
            <span
              className="badge badge-success"
              style={{
                fontSize: '0.6rem',
                padding: '0.15rem 0.45rem'
              }}
            >
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        <h4
          style={{
            fontSize: '0.92rem',
            fontWeight: 750,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '2.4em'
          }}
          title={product.title}
        >
          {product.title}
        </h4>

        {/* Price & Quantity Available */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.15rem' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--emerald-primary)' }}>
            {formatCurrency(product.price)}
            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>/{product.unit}</span>
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--surface-inset)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
            {product.quantityAvailable} {product.unit} left
          </span>
        </div>

        {/* Location & Seller Metadata */}
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.2rem' }}>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            📍 {product.location}
          </span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600, color: 'var(--text-secondary)' }}>
            👤 {product.sellerName}
          </span>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
        <Link
          to={`/marketplace/${product.id}`}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.42rem 0.4rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            background: 'var(--surface-input)',
            color: 'var(--text-primary)',
            fontSize: '0.78rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'var(--transition)'
          }}
        >
          View Product
        </Link>

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '0.42rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              background: '#25D366',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)'
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
              padding: '0.42rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--emerald-mid)',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(22, 101, 52, 0.25)'
            }}
            title="Call Seller Direct"
          >
            📞
          </a>
        )}
      </div>
    </div>
  );
};

