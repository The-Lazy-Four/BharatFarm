import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.js';
import { Spinner } from '../../../components/ui/Spinner.js';
import { EmptyState } from '../../../components/ui/EmptyState.js';
import { SchemeDetails } from '../components/SchemeDetails.js';
import { useSchemeDetails } from '../hooks/useSchemes.js';

export const SchemeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { scheme, isLoading } = useSchemeDetails(id);

  if (isLoading) return <Spinner />;

  if (!scheme) {
    return (
      <Card title="Scheme not found">
        <EmptyState message="We couldn't find that scheme. It may have been removed or the link is incorrect." />
        <Link to="/schemes" style={{ color: 'var(--primary)' }}>
          ← Back to Schemes
        </Link>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link to="/schemes" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        ← Back to Schemes
      </Link>
      <Card>
        <SchemeDetails scheme={scheme} />
      </Card>
    </div>
  );
};
