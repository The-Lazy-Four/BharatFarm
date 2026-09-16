import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductListing } from '../types/marketplace.types';
import { SellerInfo } from './SellerInfo';
import { formatCurrency } from '../utils/marketplace.utils';
import { useAuth } from '@core/context/AuthContext';
import { useMarketplace } from '../hooks/useMarketplace';
import { Button } from '@core/ui/Button';
import { useLanguage } from '../../../../context/LanguageContext';

export const ProductDetails: React.FC<{ product: ProductListing }> = ({ product }) => {
  const { user } = useAuth();
  const { deleteListing } = useMarketplace();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isOwner = user && (user.id === product.sellerId || user.email?.split('@')[0] === product.sellerName);

  const handleDelete = async () => {
    if (!window.confirm(t('marketplace.confirmDelete'))) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteListing(product.id);
      navigate('/marketplace');
    } catch (err: any) {
      setDeleteError(err?.message || t('marketplace.deleteFailed'));
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {product.imageUrl && (
        <div style={{
          width: '100%',
          height: '220px',
          overflow: 'hidden',
          borderRadius: 'var(--radius)',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{product.title}</h2>
          <p style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{product.category}</p>
        </div>
        {isOwner && (
          <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isDeleting}>
            {t('marketplace.deactivateListing')}
          </Button>
        )}
      </div>

      {deleteError && (
        <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>⚠ {deleteError}</p>
      )}

      <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
        {formatCurrency(product.price)}
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> / {product.unit}</span>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('marketplace.availableQuantity')}</p>
          <p style={{ fontWeight: 600 }}>
            {product.quantityAvailable} {product.unit}
          </p>
        </div>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('marketplace.location')}</p>
          <p style={{ fontWeight: 600 }}>📍 {product.location}</p>
        </div>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('marketplace.listedOn')}</p>
          <p style={{ fontWeight: 600 }}>{new Date(product.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('marketplace.sellerInformation')}</p>
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


