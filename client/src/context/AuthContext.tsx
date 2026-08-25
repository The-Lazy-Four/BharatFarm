import React, { createContext, useContext, useState } from 'react';
import { AuthUser } from '@bharatfarm/shared';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>({
    id: 'mock-farmer-01',
    email: 'farmer@bharatfarm.org',
    role: 'farmer',
    fullName: 'Ramesh Patel',
    state: 'Punjab'
  });

  const login = (email: string) => {
    setUser({ id: 'user-id', email, role: 'farmer', fullName: 'Logged Farmer' });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
