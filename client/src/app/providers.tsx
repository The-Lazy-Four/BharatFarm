import React from 'react';
import { AuthProvider, OfflineProvider, LanguageProvider, ThemeProvider, WeatherProvider, DataSaverProvider, PWAProvider } from '../context/index.js';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <DataSaverProvider>
        <AuthProvider>
          <OfflineProvider>
            <LanguageProvider>
              <WeatherProvider>
                <PWAProvider>
                  {children}
                </PWAProvider>
              </WeatherProvider>
            </LanguageProvider>
          </OfflineProvider>
        </AuthProvider>
      </DataSaverProvider>
    </ThemeProvider>
  );
};
