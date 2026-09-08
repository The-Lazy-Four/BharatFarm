import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers.js';
import { AppRouter } from './router.js';
import { PWAUpdateNotification } from '../components/pwa/PWAUpdateNotification.js';
import { OfflineBanner } from '../components/pwa/OfflineBanner.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProviders>
        {/* PWA: Offline detection banner — shown globally */}
        <OfflineBanner />
        {/* PWA: New SW update notification — safe, non-intrusive */}
        <PWAUpdateNotification />
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  );
};

export default App;
