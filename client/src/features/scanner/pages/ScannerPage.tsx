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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="AI Crop Leaf Health Scanner" subtitle="Instant disease detection with actionable treatment recommendations to protect your yield.">
        {!selectedImage ? (
          <ScannerCamera onCapture={base64 => setSelectedImage(base64)} />
        ) : (
          <div>
            <ImagePreview imageUrl={selectedImage} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ScanButton isScanning={isScanning} onClick={() => scanLeaf(selectedImage)} />
              <Button variant="secondary" onClick={handleReset} disabled={isScanning}>
                Retake
              </Button>
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠️ {error}</p>}
          </div>
        )}
      </Card>
      {result && <ScanResult result={result} />}
    </div>
  );
};
