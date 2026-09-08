import React from 'react';
import { AiInsightResult } from '../types';

interface Props {
  insight: AiInsightResult | null;
  dominantThreat?: string;
}

export const WhatToDoNowHero: React.FC<Props> = ({ insight, dominantThreat }) => {
  if (!insight) return null;

  const isSevere = insight.severity === 'SEVERE' || insight.severity === 'HIGH';
  const accentColor = isSevere ? '#dc2626' : '#16a34a';
  const bgGradient = isSevere
    ? 'linear-gradient(135deg, #450a0a 0%, #1f2937 100%)'
    : 'linear-gradient(135deg, #052e16 0%, #1e293b 100%)';

  return (
    <div style={{
      background: bgGradient,
      borderRadius: '12px',
      padding: '1.1rem 1.25rem',
      color: '#FFFFFF',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      border: `1px solid ${isSevere ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.3)'}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            background: accentColor,
            color: '#FFFFFF',
            fontSize: '0.7rem',
            fontWeight: 900,
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            letterSpacing: '0.04em'
          }}>
            WHAT TO DO NOW
          </span>
          <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
            {insight.timing}
          </span>
        </div>

        <span style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: insight.source === 'OPENROUTER_AI' ? '#86efac' : '#94a3b8',
          background: 'rgba(255,255,255,0.08)',
          padding: '0.15rem 0.45rem',
          borderRadius: '999px'
        }}>
          {insight.source === 'OPENROUTER_AI' ? '⚡ AI INSIGHT • OpenRouter' : '📋 RULE-BASED INSIGHT'}
        </span>
      </div>

      {/* Decision Headline */}
      <h2 style={{
        fontSize: '1.15rem',
        fontWeight: 800,
        margin: '0 0 0.65rem 0',
        color: '#FFFFFF',
        lineHeight: 1.3
      }}>
        {insight.headline}
      </h2>

      {/* Maximum 3 Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.6rem'
      }}>
        {insight.actions.slice(0, 3).map((action, idx) => (
          <div key={idx} style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '0.55rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#f8fafc'
          }}>
            <span style={{
              background: accentColor,
              color: '#FFFFFF',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.68rem',
              fontWeight: 900,
              flexShrink: 0
            }}>
              {idx + 1}
            </span>
            <span>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
