import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@core/ui/Card';
import { Spinner } from '@core/ui/Spinner';
import { EmptyState } from '@core/ui/EmptyState';
import { ProductDetails } from '../components/ProductDetails';
import { useProductListing } from '../hooks/useMarketplace';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, isLoading } = useProductListing(id);

  if (isLoading) return <Spinner />;

  if (!product) {
    return (
      <Card title="Listing not found">
        <EmptyState message="We couldn't find that listing. It may have been removed or the link is incorrect." />
        <Link to="/marketplace" style={{ color: 'var(--primary)' }}>
          ← Back to Marketplace
        </Link>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link to="/marketplace" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        ← Back to Marketplace
      </Link>
      <Card>
        <ProductDetails product={product} />
      </Card>
    </div>
  );
};

