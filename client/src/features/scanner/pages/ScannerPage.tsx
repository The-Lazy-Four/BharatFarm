import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card.js';
import { ScannerCamera } from '../components/ScannerCamera.js';
import { ImagePreview } from '../components/ImagePreview.js';
import { ScanButton } from '../components/ScanButton.js';
import { ScanResult } from '../components/ScanResult.js';
import { useScanner } from '../hooks/useScanner.js';
import { Button } from '../../../components/ui/Button.js';

export const ScannerPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { result, isScanning, error, scanLeaf, reset } = useScanner();

  const handleReset = () => {
    setSelectedImage(null);
    reset();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(15, 56, 34, 0.97) 0%, rgba(20, 83, 45, 0.93) 100%)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-3d)',
        color: '#FFFFFF'
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>AI Vision Telemetry</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Leaf Scanner — AI-Powered Crop Health Intelligence
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Capture or upload leaf images for instant pathogen identification and recommended dosage.
          </p>
        </div>
      </div>


      {/* Main Grid Layout matching Stitch */}
      <div className="grid-dashboard">
        {/* Left Column (Span 8): Scanner Frame & Active Analysis */}
        <div className="col-span-8">
          <Card title="Capture Leaf Image" subtitle="Position the leaf within the camera frame ensuring good natural lighting and sharp focus.">
            {!selectedImage ? (
              <ScannerCamera onCapture={base64 => setSelectedImage(base64)} />
            ) : (
              <div>
                <ImagePreview imageUrl={selectedImage} />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <ScanButton isScanning={isScanning} onClick={() => scanLeaf(selectedImage)} />
                  <Button variant="secondary" onClick={handleReset} disabled={isScanning}>
                    Retake Image
                  </Button>
                </div>
                {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠️ {error}</p>}
              </div>
            )}

            {result && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(34,37,31,0.1)' }}>
                <ScanResult result={result} />
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (Span 4): Best Practices Guide & Recent Scans (Stitch reference) */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Capturing a Good Image Guidance */}
          <Card title="Capturing a Good Image" subtitle="Tips for maximum AI vision accuracy">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(215, 242, 26, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--signal-lime)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--dark-text)' }}>wb_sunny</span>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)' }}>Natural Lighting</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Ensure even natural light; avoid harsh shadows or camera flash glares.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: '#FFFDF5', borderRadius: 'var(--radius-sm)', border: '1px solid #FCD34D' }}>
                <span className="material-symbols-outlined" style={{ color: '#D97706' }}>center_focus_weak</span>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)' }}>Focus & Isolation</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Tap to focus directly on the lesion or discolored area of the individual leaf.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(2, 132, 199, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid #7DD3FC' }}>
                <span className="material-symbols-outlined" style={{ color: '#0284C7' }}>image</span>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)' }}>Background Clarity</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Keep camera steady and isolate a single leaf against a clear background.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Scans History Panel */}
          <Card title="Recent Scans History">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--card-gray)', borderRadius: '12px', border: '1px solid rgba(34,37,31,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-text)' }}>Wheat Leaf Blight</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence: 94% • 2 days ago</p>
                </div>
                <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Fungicide Issued</span>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--card-gray)', borderRadius: '12px', border: '1px solid rgba(34,37,31,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-text)' }}>Healthy Rice Canopy</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence: 98% • 5 days ago</p>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Normal</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
