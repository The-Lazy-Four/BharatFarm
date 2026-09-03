import { SCANNER_CONSTANTS } from '../constants/scanner.constants';

export const compressImage = async (file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = event => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = event.target?.result as string;
    };
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
