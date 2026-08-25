import React from 'react';
import { AuthProvider, OfflineProvider, LanguageProvider } from '../context/index.js';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <OfflineProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </OfflineProvider>
    </AuthProvider>
  );
};
