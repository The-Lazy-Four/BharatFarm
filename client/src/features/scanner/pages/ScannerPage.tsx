import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card.js';
import { ScannerCamera } from '../components/ScannerCamera.js';
import { ImagePreview } from '../components/ImagePreview.js';
import { ScanButton } from '../components/ScanButton.js';
import { ScanResult } from '../components/ScanResult.js';
import { useScanner } from '../hooks/useScanner.js';
import { Button } from '../../../components/ui/Button.js';
import { FEATURE_IMAGES } from '../../../constants/featureImages.js';

export const ScannerPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { result, isScanning, error, scanLeaf, reset } = useScanner();

  const handleReset = () => {
    setSelectedImage(null);
    reset();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Visual Header Banner */}
      <div className="page-header-banner">
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
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-default)' }}>
                <ScanResult result={result} />
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (Span 4): Best Practices Guide & Image Hero Card */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Diagnostic Imagery Hero Card */}
          <div className="card-feature-backed" style={{ minHeight: '140px' }}>
            <img src={FEATURE_IMAGES.scanner.url} alt="Leaf Disease Diagnosis" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <span className="badge badge-success">Neural Vision v3</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem', color: '#FFFFFF' }}>Instant Pathogen Identification</h4>
              <p style={{ fontSize: '0.75rem', opacity: 0.88, color: '#FFFFFF' }}>Trained on 50,000+ Indian crop disease samples.</p>
            </div>
          </div>

          {/* Capturing a Good Image Guidance */}
          <Card title="Capturing a Good Image" subtitle="Tips for maximum AI vision accuracy">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="alert-success" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span className="material-symbols-outlined">wb_sunny</span>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Natural Lighting</h5>
                  <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.2rem' }}>
                    Ensure even natural light; avoid harsh shadows or camera flash glares.
                  </p>
                </div>
              </div>

              <div className="alert-warning" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span className="material-symbols-outlined">center_focus_weak</span>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Focus & Isolation</h5>
                  <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.2rem' }}>
                    Tap to focus directly on the lesion or discolored area of the individual leaf.
                  </p>
                </div>
              </div>

              <div className="alert-info" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span className="material-symbols-outlined">image</span>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Single Leaf Close-up</h5>
                  <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.2rem' }}>
                    Fill 70% of the camera viewfinder frame with the affected crop leaf area.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
