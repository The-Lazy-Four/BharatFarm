import React from 'react';
import { AuthProvider, OfflineProvider, LanguageProvider, ThemeProvider, WeatherProvider, DataSaverProvider } from '../context/index.js';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <DataSaverProvider>
        <AuthProvider>
          <OfflineProvider>
            <LanguageProvider>
              <WeatherProvider>
                {children}
              </WeatherProvider>
            </LanguageProvider>
          </OfflineProvider>
        </AuthProvider>
      </DataSaverProvider>
    </ThemeProvider>
  );
};
