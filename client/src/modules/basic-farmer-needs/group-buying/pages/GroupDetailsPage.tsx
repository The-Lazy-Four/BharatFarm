import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@core/ui/Card';
import { Spinner } from '@core/ui/Spinner';
import { EmptyState } from '@core/ui/EmptyState';
import { GroupDetails } from '../components/GroupDetails';
import { useGroupBuyDetails } from '../hooks/useGroupBuying';
import { useLanguage } from '../../../../context/LanguageContext';

export const GroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { pool, isLoading, error, joinPool } = useGroupBuyDetails(id);
  const { t } = useLanguage();

  if (isLoading) return <Spinner />;

  if (!pool) {
    return (
      <Card title={t('groupBuying.notFoundTitle')}>
        <EmptyState message={t('groupBuying.notFoundDesc')} />
        <Link to="/groupbuying" style={{ color: 'var(--primary)' }}>
          {t('groupBuying.backToGroupBuying')}
        </Link>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link to="/groupbuying" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {t('groupBuying.backToGroupBuying')}
      </Link>
      <Card>
        <GroupDetails pool={pool} onJoin={joinPool} />
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠️ {error}</p>}
      </Card>
    </div>
  );
};

