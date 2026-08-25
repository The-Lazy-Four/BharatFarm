import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.js';
import { Spinner } from '../../../components/ui/Spinner.js';
import { EmptyState } from '../../../components/ui/EmptyState.js';
import { GroupDetails } from '../components/GroupDetails.js';
import { useGroupBuyDetails } from '../hooks/useGroupBuying.js';

export const GroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { pool, isLoading, error, joinPool } = useGroupBuyDetails(id);

  if (isLoading) return <Spinner />;

  if (!pool) {
    return (
      <Card title="Group buy not found">
        <EmptyState message="We couldn't find that group buying pool. It may have closed or the link is incorrect." />
        <Link to="/groupbuying" style={{ color: 'var(--primary)' }}>
          ← Back to Group Buying
        </Link>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link to="/groupbuying" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        ← Back to Group Buying
      </Link>
      <Card>
        <GroupDetails pool={pool} onJoin={joinPool} />
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠️ {error}</p>}
      </Card>
    </div>
  );
};
