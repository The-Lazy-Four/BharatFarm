import { SCANNER_CONSTANTS } from '../constants/scanner.constants.js';

export const scannerSchema = {
  validate: (body: any) => {
    if (!body || (!body.imageBase64 && !body.imageUrl)) {
      return { error: { message: 'imageBase64 or imageUrl is required' } };
    }

    if (body.imageBase64) {
      if (typeof body.imageBase64 !== 'string') {
        return { error: { message: 'imageBase64 must be a string' } };
      }

      // Check max base64 payload size approx 7MB (~5MB raw image)
      if (body.imageBase64.length > 7 * 1024 * 1024) {
        return { error: { message: 'Image payload is too large. Max allowed size is 5MB.' } };
      }

      const mimeMatch = body.imageBase64.match(/^data:(image\/\w+);base64,/);
      if (mimeMatch && !SCANNER_CONSTANTS.SUPPORTED_FORMATS.includes(mimeMatch[1])) {
        return { error: { message: `Unsupported image format: ${mimeMatch[1]}. Supported: JPG, PNG, WEBP` } };
      }
    }

    return { error: null };
  }
};
