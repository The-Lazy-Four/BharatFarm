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
  updateProfile: (profile: Partial<AuthUser>) => void;
  setProfileImage: (imageDataUrl: string | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hydrate user state synchronously from localStorage to prevent auth flashes or session loss on reopen
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('bf_user');
      const token = localStorage.getItem('auth_token');
      if (token && savedUser) {
        return JSON.parse(savedUser) as AuthUser;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // If token and user exist, we can mark loading false immediately or verify in background
    return !localStorage.getItem('auth_token');
  });

  const [profileImage, setProfileStateImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem('bf_user_profile_image') || null;
    } catch {
      return null;
    }
  });

  // Verify and refresh user session in background on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const res = await AuthService.getCurrentUser();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
            try {
              localStorage.setItem('bf_user', JSON.stringify(res.data.user));
            } catch {
              // ignore storage error
            }
          } else if (
            res.error?.code === 'UNAUTHORIZED' ||
            res.error?.code === 'INVALID_CREDENTIALS' ||
            res.error?.code === 'TOKEN_EXPIRED'
          ) {
            // Token is explicitly expired or rejected by server — clear state
            AuthService.logout();
            setUser(null);
            try {
              localStorage.removeItem('bf_user');
            } catch {
              // ignore storage error
            }
          }
          // If it was a network error or offline, keep the locally saved user state!
        } catch {
          // Keep the existing user session on network/offline issues
        }
      } else {
        setUser(null);
        try {
          localStorage.removeItem('bf_user');
        } catch {
          // ignore
        }
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
      try {
        localStorage.setItem('bf_user', JSON.stringify(res.data.user));
      } catch {
        // ignore storage error
      }
    }
    return res;
  };

  const register = async (payload: RegisterPayload): Promise<ApiResponse<unknown>> => {
    const res = await AuthService.register(payload);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      try {
        localStorage.setItem('bf_user', JSON.stringify(res.data.user));
      } catch {
        // ignore storage error
      }
    }
    return res;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    try {
      localStorage.removeItem('bf_user');
      localStorage.removeItem('bf_user_profile_image');
    } catch {
      // ignore storage error
    }
  };

  const refreshUser = async () => {
    const res = await AuthService.getCurrentUser();
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      try {
        localStorage.setItem('bf_user', JSON.stringify(res.data.user));
      } catch {
        // ignore storage error
      }
    }
  };

  const updateProfile = (profile: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...profile };
      try {
        localStorage.setItem('bf_user', JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
      return updated;
    });
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
