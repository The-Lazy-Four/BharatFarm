import React, { createContext, useContext, useState } from 'react';
import { AuthUser } from '@bharatfarm/shared';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  updateProfile: (profile: { name: string; state: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const defaultUser: AuthUser = {
      id: 'mock-farmer-01',
      email: 'farmer@bharatfarm.org',
      role: 'farmer',
      fullName: 'Ramesh Patel',
      state: 'Punjab'
    };
    try {
      const saved = localStorage.getItem('bf_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultUser,
          fullName: parsed.name || defaultUser.fullName,
          state: parsed.state || defaultUser.state
        };
      }
    } catch {
      // ignore
    }
    return defaultUser;
  });

  const login = (email: string) => {
    setUser({ id: 'user-id', email, role: 'farmer', fullName: 'Logged Farmer', state: 'Punjab' });
  };

  const logout = () => setUser(null);

  const updateProfile = (profile: { name: string; state: string }) => {
    setUser(prev => prev ? { ...prev, fullName: profile.name, state: profile.state } : null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
