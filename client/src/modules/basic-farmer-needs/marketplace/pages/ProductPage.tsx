import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@core/ui/Card';
import { Spinner } from '@core/ui/Spinner';
import { EmptyState } from '@core/ui/EmptyState';
import { ProductDetails } from '../components/ProductDetails';
import { useProductListing } from '../hooks/useMarketplace';
import { useLanguage } from '../../../../context/LanguageContext';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, isLoading } = useProductListing(id);
  const { t } = useLanguage();

  if (isLoading) return <Spinner />;

  if (!product) {
    return (
      <Card title={t('marketplace.listingNotFoundTitle')}>
        <EmptyState message={t('marketplace.listingNotFoundDesc')} />
        <Link to="/marketplace" style={{ color: 'var(--primary)' }}>
          {t('marketplace.backToMarketplace')}
        </Link>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link to="/marketplace" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {t('marketplace.backToMarketplace')}
      </Link>
      <Card>
        <ProductDetails product={product} />
      </Card>
    </div>
  );
};

