import React, { useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button.js';
import { compressImage, validateImageFile, captureFrameFromVideo } from '../utils/image.utils.js';

/**
 * Capture/upload entry point for a leaf photo. Adapted from the OLD project's
 * `openCamera` / `capturePhoto` / `handleLeafUpload` (js/scanner.js), which
 * used the browser MediaDevices API directly against the DOM. Here the same
 * flow (upload a file OR open a live camera and snap a frame) is expressed
 * as React state instead of manual DOM manipulation.
 */
export const ScannerCamera: React.FC<{ onCapture: (base64: string) => void }> = ({ onCapture }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid image');
      return;
    }

    setError(null);
    const base64 = await compressImage(file);
    onCapture(base64);
  };

  const openCamera = async () => {
    setError(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError('Camera access was denied or is not available. Try uploading a photo instead.');
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const dataUrl = captureFrameFromVideo(videoRef.current);
    closeCamera();
    onCapture(dataUrl);
  };

  return (
    <div>
      {isCameraOpen ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', background: '#000' }}>
            <video ref={videoRef} style={{ width: '100%', maxHeight: '320px', objectFit: 'cover' }} playsInline muted />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={capturePhoto} style={{ flex: 1 }}>📸 Capture</Button>
            <Button variant="secondary" onClick={closeCamera} style={{ flex: 1 }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '3rem 1rem',
            textAlign: 'center',
            background: 'var(--bg-card-hover)'
          }}
        >
          <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</p>
          <p style={{ fontWeight: 600 }}>Scan Your Crop</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 1rem' }}>
            Detect diseases instantly and get treatment recommendations.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button onClick={openCamera}>📷 Open Camera</Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>🖼️ Upload from Gallery</Button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Supports JPG, PNG, WEBP (Max 5MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      )}
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
};
