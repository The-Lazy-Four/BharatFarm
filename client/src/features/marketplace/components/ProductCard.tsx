import React from 'react';
import { Link } from 'react-router-dom';
import { ProductListing } from '../types/marketplace.types.js';
import { Card } from '../../../components/ui/Card.js';
import { Badge } from '../../../components/ui/Badge.js';
import { formatCurrency, buildWhatsAppLink, buildTelLink } from '../utils/marketplace.utils.js';

export const ProductCard: React.FC<{ product: ProductListing }> = ({ product }) => {
  const waLink = buildWhatsAppLink(product.sellerWhatsapp, product.sellerPhone);
  const telLink = buildTelLink(product.sellerPhone);

  return (
    <Card
      title={product.title}
      action={
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          {product.verified && <Badge variant="primary">✓ Verified</Badge>}
          <Badge variant="secondary">{product.category}</Badge>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {product.imageUrl && (
          <div style={{
            width: '100%',
            height: '130px',
            overflow: 'hidden',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '0.5rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <img
              src={product.imageUrl}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
          {formatCurrency(product.price)}{' '}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {product.unit}</span>
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Available: {product.quantityAvailable} {product.unit}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {product.location}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👤 {product.sellerName}</p>

        <Link
          to={`/marketplace/${product.id}`}
          style={{
            textAlign: 'center',
            padding: '0.55rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          View Details
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.55rem',
                borderRadius: 'var(--radius)',
                background: '#128C7E',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              💬 WhatsApp
            </a>
          )}
          {telLink && (
            <a
              href={telLink}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.55rem',
                borderRadius: 'var(--radius)',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              📞 Call
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};
