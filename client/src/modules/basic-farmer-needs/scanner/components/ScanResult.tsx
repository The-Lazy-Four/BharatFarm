import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanResult as IScanResult } from '../types/scanner.types';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { Card } from '@core/ui/Card';
import { Badge } from '@core/ui/Badge';
import { Button } from '@core/ui/Button';
import { useLanguage } from '../../../../context/LanguageContext';

const SEVERITY_VARIANT: Record<IScanResult['severity'], 'primary' | 'warning' | 'secondary'> = {
  none: 'primary',
  low: 'secondary',
  medium: 'warning',
  high: 'warning'
};

export const ScanResult: React.FC<{ result: IScanResult }> = ({ result }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isNotPlant = result.status === 'not_a_plant';
  const isHealthy = result.severity === 'none' && !isNotPlant;

  const severityLabels: Record<IScanResult['severity'], string> = {
    none: t('scanner.severityNoIssue'),
    low: t('scanner.severityLow'),
    medium: t('scanner.severityMedium'),
    high: t('scanner.severityHigh')
  };

  const handleAskShayak = () => {
    const prompt = t('scanner.askShayakPrompt', {
      crop: result.cropName,
      disease: result.disease,
      confidence: Math.round(result.confidence * 100)
    });
    navigate(`/krishibot?initialPrompt=${encodeURIComponent(prompt)}`);
  };

  const handleViewRoadmap = () => {
    navigate(`/roadmap?crop=${encodeURIComponent(result.cropName)}`);
  };

  const isAiUnavailable = result.status === 'ai_unavailable' || result.aiUnavailable;

  if (isAiUnavailable) {
    return (
      <Card title={t('scanner.aiUnavailableTitle')} subtitle={t('scanner.aiUnavailableSub')}>
        <div style={{ padding: '1.25rem', background: 'rgba(234, 179, 8, 0.08)', borderRadius: 'var(--radius)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
            <span className="material-symbols-outlined">cloud_off</span>
            <span>{t('scanner.aiReachabilityIssue')}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
            {t('scanner.aiUnavailableDesc')}
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <Button variant="primary" onClick={() => window.location.reload()} style={{ fontSize: '0.85rem' }}>
              {t('common.retry')}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isNotPlant) {
    return (
      <Card title={t('scanner.invalidImageTitle')} subtitle={t('scanner.invalidImageSub')}>
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <p style={{ fontWeight: 600, color: 'var(--danger)' }}>{t('scanner.nonPlantDetected')}</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.3rem', color: 'var(--text-main)' }}>
            {t('scanner.nonPlantDesc')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={isHealthy ? t('scanner.healthyTitle') : t('scanner.diagnosisTitle')}
      subtitle={t('scanner.analysisCompleted', { crop: result.cropName })}
      action={<ConfidenceIndicator confidence={result.confidence} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Main Status Banner */}
        <div
          style={{
            background: isHealthy ? 'rgba(34, 197, 94, 0.08)' : 'rgba(234, 179, 8, 0.08)',
            border: `1px solid ${isHealthy ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
            borderRadius: 'var(--radius)',
            padding: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Badge variant={SEVERITY_VARIANT[result.severity]}>{severityLabels[result.severity]}</Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {t('basicNeeds.primaryCrop')}: <strong>{result.cropName}</strong>
            </span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{result.disease}</h3>
        </div>

        {/* Weather advisory alert if attached */}
        {result.weatherWarning && (
          <div className="alert-info" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>cloud_sync</span>
            <div>
              <strong>{t('scanner.weatherContext')}</strong> {result.weatherWarning}
            </div>
          </div>
        )}

        {/* Symptoms observed */}
        {result.symptoms && result.symptoms.length > 0 && (
          <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 700 }}>
              {t('scanner.observedSymptoms')}
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {result.symptoms.map((sym, i) => (
                <li key={i}>{sym}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Immediate Recommendations */}
        {result.recommendations.length > 0 && (
          <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 700 }}>
              {t('scanner.actionableGuidance')}
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {result.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preventative Measures */}
        {result.preventativeMeasures.length > 0 && (
          <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 700 }}>
              {t('scanner.longTermPrevention')}
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {result.preventativeMeasures.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety & Legal Disclaimer */}
        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius)', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
            ℹ️ <strong>{t('scanner.safetyDisclaimer')}</strong> {result.disclaimer}
          </p>
        </div>

        {/* Cross-Module Integration Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <Button onClick={handleAskShayak} style={{ flex: 1, minWidth: '200px' }}>
            {t('scanner.askShayakBtn')}
          </Button>
          <Button variant="outline" onClick={handleViewRoadmap} style={{ flex: 1, minWidth: '180px' }}>
            {t('scanner.checkRoadmapBtn')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

