import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface JwtUserPayload {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
  state?: string;
  district?: string;
}

/**
 * Generate a signed JWT token for an authenticated user.
 */
export const signJwtToken = (user: JwtUserPayload): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || 'farmer',
    fullName: user.fullName || '',
    phone: user.phone || '',
    state: user.state || '',
    district: user.district || ''
  };

  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as any
  };

  return jwt.sign(payload, config.jwt.secret, options);
};

/**
 * Verify and decode a JWT token string.
 * Returns decoded payload if valid, or null if invalid/expired.
 */
export const verifyJwtToken = (token: string): JwtUserPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtUserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
