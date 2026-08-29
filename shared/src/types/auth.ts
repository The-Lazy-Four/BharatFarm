export type UserRole = 'farmer' | 'buyer' | 'admin' | 'expert';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  state?: string;
  district?: string;
  landSizeAcres?: number;
  primaryCrops?: string[];
  preferredLanguage?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}
