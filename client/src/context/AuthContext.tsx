import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, ApiResponse } from '@bharatfarm/shared';
import { AuthService, RegisterPayload } from '../services/auth.service.js';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileImage: string | null;
  getUserInitials: () => string;
  login: (email: string, password?: string) => Promise<ApiResponse<unknown>>;
  register: (payload: RegisterPayload) => Promise<ApiResponse<unknown>>;
  logout: () => void;
  updateProfile: (profile: { name: string; state: string }) => void;
  setProfileImage: (imageDataUrl: string | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [profileImage, setProfileStateImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem('bf_user_profile_image') || null;
    } catch {
      return null;
    }
  });

  // Hydrate user session on mount from real token / stored profile
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const res = await AuthService.getCurrentUser();
        if (res.success && res.data?.user) {
          setUser(res.data.user);
        } else {
          // Token expired or invalid — clear state
          AuthService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const setProfileImage = (imageDataUrl: string | null) => {
    setProfileStateImage(imageDataUrl);
    try {
      if (imageDataUrl) {
        localStorage.setItem('bf_user_profile_image', imageDataUrl);
      } else {
        localStorage.removeItem('bf_user_profile_image');
      }
    } catch {
      // ignore storage error
    }
  };

  const getUserInitials = () => {
    if (!user || !user.fullName) return 'BF';
    const parts = user.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const login = async (email: string, password?: string): Promise<ApiResponse<unknown>> => {
    const res = await AuthService.login(email, password);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (payload: RegisterPayload): Promise<ApiResponse<unknown>> => {
    const res = await AuthService.register(payload);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await AuthService.getCurrentUser();
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
  };

  const updateProfile = (profile: { name: string; state: string }) => {
    setUser(prev => prev ? { ...prev, fullName: profile.name, state: profile.state } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      profileImage,
      getUserInitials,
      login,
      register,
      logout,
      updateProfile,
      setProfileImage,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
