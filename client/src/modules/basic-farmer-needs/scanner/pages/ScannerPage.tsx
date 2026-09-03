import React, { useState } from 'react';
import { Card } from '@core/ui/Card';
import { ScannerCamera } from '../components/ScannerCamera';
import { ImagePreview } from '../components/ImagePreview';
import { ScanButton } from '../components/ScanButton';
import { ScanResult } from '../components/ScanResult';
import { useScanner } from '../hooks/useScanner';
import { Button } from '@core/ui/Button';
import { FEATURE_IMAGES } from '@core/constants/featureImages';

const COMMON_CROPS = ['Tomato', 'Rice', 'Wheat', 'Cotton', 'Potato', 'Sugarcane', 'Maize', 'Chilli', 'Soybean'];

export const ScannerPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [question, setQuestion] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');

  const { result, history, isScanning, isLoadingHistory, error, scanLeaf, deleteScan, reset } = useScanner();

  const handleReset = () => {
    setSelectedImage(null);
    setQuestion('');
    reset();
  };

  const handleScanClick = () => {
    if (!selectedImage) return;
    scanLeaf({
      imageBase64: selectedImage,
      cropHint: selectedCrop,
      question: question.trim() || undefined
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Visual Header Banner */}
      <div className="page-header-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>AI Vision Telemetry</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
              Leaf Scanner — AI-Powered Crop Health Intelligence
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Capture or upload leaf images for instant pathogen identification, symptoms, and safety-verified advisory.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: 'var(--radius)' }}>
            <Button
              variant={activeTab === 'scan' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('scan')}
              style={{ fontSize: '0.85rem' }}
            >
              📷 Live Scanner
            </Button>
            <Button
              variant={activeTab === 'history' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('history')}
              style={{ fontSize: '0.85rem' }}
            >
              📜 Scan History ({history.length})
            </Button>
          </div>
        </div>
      </div>

      {activeTab === 'scan' ? (
        /* Main Grid Layout matching Stitch */
        <div className="grid-dashboard">
          {/* Left Column (Span 8): Scanner Frame & Active Analysis */}
          <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card title="Capture Leaf Image" subtitle="Position the crop leaf inside the frame with natural lighting.">
              {/* Optional Crop Selector & Question */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                    Crop Type (Optional Hint)
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={e => setSelectedCrop(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)'
                    }}
                  >
                    {COMMON_CROPS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 2, minWidth: '240px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                    Specific Observation / Question (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Yellow spots appeared after heavy rains"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
              </div>

              {!selectedImage ? (
                <ScannerCamera onCapture={base64 => setSelectedImage(base64)} />
              ) : (
                <div>
                  <ImagePreview imageUrl={selectedImage} />
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <ScanButton isScanning={isScanning} onClick={handleScanClick} />
                    <Button variant="secondary" onClick={handleReset} disabled={isScanning}>
                      Retake Image
                    </Button>
                  </div>
                  {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠️ {error}</p>}
                </div>
              )}

              {result && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
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
                      Tap to focus directly on the lesion or discolored area of the leaf.
                    </p>
                  </div>
                </div>

                <div className="alert-info" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span className="material-symbols-outlined">image</span>
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Single Leaf Close-up</h5>
                    <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.2rem' }}>
                      Fill 70% of the camera frame with the affected crop leaf area.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* History View */
        <Card title="Scan Telemetry History" subtitle="Saved scan diagnoses and historical crop pathogen records">
          {isLoadingHistory ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading scan history...</p>
          ) : history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No historical scans recorded yet. Perform your first scan!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.map(item => (
                <div
                  key={item.scanId}
                  style={{
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${item.severity === 'high' ? 'badge-warning' : 'badge-primary'}`}>
                        {item.cropName}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(item.scannedAt).toLocaleDateString()} at {new Date(item.scannedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.disease}</h4>
                    {item.recommendations.length > 0 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Top tip: {item.recommendations[0]}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        reset();
                        setActiveTab('scan');
                        scanLeaf({ imageBase64: 'data:image/jpeg;base64,mock', cropHint: item.cropName });
                      }}
                      style={{ fontSize: '0.8rem' }}
                    >
                      View Report
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => deleteScan(item.scanId)}
                      style={{ fontSize: '0.8rem', color: 'var(--danger)' }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

