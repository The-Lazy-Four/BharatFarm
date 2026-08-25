import { SCANNER_CONSTANTS } from '../constants/scanner.constants.js';

export const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const validateImageFile = (file: File): ImageValidationResult => {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please choose a JPG, PNG, or WEBP image.' };
  }
  if (file.size > SCANNER_CONSTANTS.MAX_FILE_SIZE) {
    const maxMb = SCANNER_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024);
    return { valid: false, error: `Image is too large. Max size is ${maxMb}MB.` };
  }
  return { valid: true };
};

/** Captures the current frame of a <video> element as a base64 JPEG data URL. */
export const captureFrameFromVideo = (video: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.9);
};
