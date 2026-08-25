import { UserRole } from './auth.js';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phoneNumber?: string;
  location?: {
    state: string;
    district: string;
    pincode: string;
  };
  landSizeAcres?: number;
  primaryCrops?: string[];
  createdAt: string;
  updatedAt: string;
}
