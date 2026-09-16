import React from 'react';
import { Badge } from '@core/ui/Badge';
import { buildWhatsAppLink, buildTelLink } from '../utils/marketplace.utils';
import { useLanguage } from '../../../../context/LanguageContext';

export const SellerInfo: React.FC<{
  name: string;
  rating?: number;
  verified?: boolean;
  phone?: string;
  whatsapp?: string;
}> = ({ name, rating, verified, phone, whatsapp }) => {
  const { t } = useLanguage();
  const waLink = buildWhatsAppLink(whatsapp, phone);
  const telLink = buildTelLink(phone);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
        <span>👤 {name}</span>
        {rating !== undefined && <span style={{ color: 'var(--text-muted)' }}>⭐ {rating.toFixed(1)}</span>}
        {verified && <Badge variant="primary">{t('marketplace.govtVerified')}</Badge>}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '0.7rem',
              borderRadius: 'var(--radius)',
              background: '#128C7E',
              color: '#fff',
              fontWeight: 600
            }}
          >
            {t('marketplace.whatsappChat')}
          </a>
        )}
        {telLink && (
          <a
            href={telLink}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '0.7rem',
              borderRadius: 'var(--radius)',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 600
            }}
          >
            {t('marketplace.callFarmer')}
          </a>
        )}
      </div>
    </div>
  );
};

