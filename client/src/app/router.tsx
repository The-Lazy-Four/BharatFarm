import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.js';
import { KrishiBotPage } from '../features/krishibot/index.js';
import { ScannerPage } from '../features/scanner/index.js';
import { MarketplacePage, CreateListingPage, ProductPage } from '../features/marketplace/index.js';
import { WeatherPage } from '../features/weather/index.js';
import { GroupBuyingPage, GroupDetailsPage } from '../features/groupbuying/index.js';
import { SchemesPage, SchemeDetailsPage } from '../features/schemes/index.js';

export const AppRouter: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/krishibot" replace />} />
        <Route path="/krishibot" element={<KrishiBotPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/new" element={<CreateListingPage />} />
        <Route path="/marketplace/:id" element={<ProductPage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/groupbuying" element={<GroupBuyingPage />} />
        <Route path="/groupbuying/:id" element={<GroupDetailsPage />} />
        <Route path="/schemes" element={<SchemesPage />} />
        <Route path="/schemes/:id" element={<SchemeDetailsPage />} />
        <Route path="*" element={<Navigate to="/krishibot" replace />} />
      </Routes>
    </AppLayout>
  );
};
