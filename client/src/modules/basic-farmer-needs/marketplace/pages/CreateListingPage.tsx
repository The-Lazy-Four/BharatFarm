import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@core/ui/Card';
import { ListingForm } from '../components/ListingForm';
import { useMarketplace } from '../hooks/useMarketplace';
import { CreateListingInput } from '../types/marketplace.types';
import { useLanguage } from '../../../../context/LanguageContext';

export const CreateListingPage: React.FC = () => {
  const { createListing } = useMarketplace();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = async (data: CreateListingInput) => {
    const created = await createListing(data);
    setSuccessMessage(t('marketplace.publishedSuccess'));
    setTimeout(() => navigate(`/marketplace/${created.id}`), 900);
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link to="/marketplace" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {t('marketplace.backToMarketplace')}
      </Link>
      <Card title={t('marketplace.createListingTitle')} subtitle={t('marketplace.createListingSub')}>
        <ListingForm onSubmit={handleSubmit} />
        {successMessage && <p style={{ color: 'var(--primary)', marginTop: '0.75rem' }}>{successMessage}</p>}
      </Card>
    </div>
  );
};

