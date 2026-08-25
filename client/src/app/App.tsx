import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers.js';
import { AppRouter } from './router.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  );
};

export default App;
