import React from 'react';
import { AuthProvider, OfflineProvider, LanguageProvider, ThemeProvider } from '../context/index.js';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OfflineProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </OfflineProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
