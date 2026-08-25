import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.js';
import { ListingForm } from '../components/ListingForm.js';
import { useMarketplace } from '../hooks/useMarketplace.js';
import { CreateListingInput } from '../types/marketplace.types.js';

export const CreateListingPage: React.FC = () => {
  const { createListing } = useMarketplace();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (data: CreateListingInput) => {
    const created = await createListing(data);
    setSuccessMessage('✅ Listing published successfully!');
    setTimeout(() => navigate(`/marketplace/${created.id}`), 900);
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link to="/marketplace" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        ← Back to Marketplace
      </Link>
      <Card title="Sell Agricultural Produce / Inputs" subtitle="List your harvest or farm supplies for direct buyer contact.">
        <ListingForm onSubmit={handleSubmit} />
        {successMessage && <p style={{ color: 'var(--primary)', marginTop: '0.75rem' }}>{successMessage}</p>}
      </Card>
    </div>
  );
};
