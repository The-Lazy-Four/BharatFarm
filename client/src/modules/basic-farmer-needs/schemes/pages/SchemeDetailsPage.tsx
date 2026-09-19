import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@core/ui/Card';
import { Spinner } from '@core/ui/Spinner';
import { EmptyState } from '@core/ui/EmptyState';
import { SchemeDetails } from '../components/SchemeDetails';
import { useSchemeDetails } from '../hooks/useSchemes';
import { useLanguage } from '../../../../context/LanguageContext';

export const SchemeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { scheme, isLoading } = useSchemeDetails(id);
  const { t } = useLanguage();

  if (isLoading) return <Spinner />;

  if (!scheme) {
    return (
      <Card title={t('schemes.notFoundTitle')}>
        <EmptyState message={t('schemes.notFoundDesc')} />
        <Link to="/schemes" style={{ color: 'var(--primary)' }}>
          {t('schemes.backToSchemes')}
        </Link>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link to="/schemes" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {t('schemes.backToSchemes')}
      </Link>
      <Card>
        <SchemeDetails scheme={scheme} />
      </Card>
    </div>
  );
};

