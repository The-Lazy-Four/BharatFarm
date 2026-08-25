import { SCANNER_CONSTANTS } from '../constants/scanner.constants.js';

export const scannerSchema = {
  validate: (body: any) => {
    if (!body || (!body.imageBase64 && !body.imageUrl)) {
      return { error: { message: 'imageBase64 or imageUrl is required' } };
    }

    if (body.imageBase64 && typeof body.imageBase64 !== 'string') {
      return { error: { message: 'imageBase64 must be a base64-encoded string' } };
    }

    const mimeMatch =
      typeof body.imageBase64 === 'string' ? body.imageBase64.match(/^data:(image\/\w+);base64,/) : null;
    if (mimeMatch && !SCANNER_CONSTANTS.SUPPORTED_FORMATS.includes(mimeMatch[1])) {
      return { error: { message: `Unsupported image format: ${mimeMatch[1]}` } };
    }

    return { error: null };
  }
};
