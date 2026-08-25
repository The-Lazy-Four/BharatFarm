import React from 'react';
import { ScanResult as IScanResult } from '../types/scanner.types.js';
import { ConfidenceIndicator } from './ConfidenceIndicator.js';
import { Card } from '../../../components/ui/Card.js';
import { Badge } from '../../../components/ui/Badge.js';

const SEVERITY_LABEL: Record<IScanResult['severity'], string> = {
  none: 'No Issue',
  low: 'Low',
  medium: 'Moderate',
  high: 'High'
};

const SEVERITY_VARIANT: Record<IScanResult['severity'], 'primary' | 'warning' | 'secondary'> = {
  none: 'primary',
  low: 'secondary',
  medium: 'warning',
  high: 'warning'
};

export const ScanResult: React.FC<{ result: IScanResult }> = ({ result }) => {
  const isHealthy = result.severity === 'none';

  return (
    <Card
      title={isHealthy ? '✅ Diagnosis Complete' : '⚠️ Diagnosis Complete'}
      subtitle={`Analysis finished on the provided ${result.cropName.toLowerCase()} sample.`}
      action={<ConfidenceIndicator confidence={result.confidence} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div
          style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Badge variant={SEVERITY_VARIANT[result.severity]}>{SEVERITY_LABEL[result.severity]}</Badge>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Crop: {result.cropName}</span>
          </div>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>{result.disease}</p>
        </div>

        {result.recommendations.length > 0 && (
          <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>💊 Treatment Plan</h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {result.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {result.preventativeMeasures.length > 0 && (
          <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>🛡️ Prevention</h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {result.preventativeMeasures.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Scanned {new Date(result.scannedAt).toLocaleString()}
        </p>
      </div>
    </Card>
  );
};
