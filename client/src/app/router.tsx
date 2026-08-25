import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.js';
import { MasterDashboardPage } from './pages/MasterDashboardPage.js';
import { ScannerPage } from '../features/scanner/index.js';
import { MarketplacePage, CreateListingPage, ProductPage } from '../features/marketplace/index.js';
import { WeatherPage } from '../features/weather/index.js';
import { GroupBuyingPage, GroupDetailsPage } from '../features/groupbuying/index.js';
import { SchemesPage, SchemeDetailsPage } from '../features/schemes/index.js';
import { FarmRecordsPage } from './pages/FarmRecordsPage.js';
import { FarmCalculatorPage } from './pages/FarmCalculatorPage.js';
import { OrdersDeliveryPage } from './pages/OrdersDeliveryPage.js';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage.js';
import { LoanEligibilityPage } from './pages/LoanEligibilityPage.js';

export const AppRouter: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<MasterDashboardPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/new" element={<CreateListingPage />} />
        <Route path="/marketplace/:id" element={<ProductPage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/groupbuying" element={<GroupBuyingPage />} />
        <Route path="/groupbuying/:id" element={<GroupDetailsPage />} />
        <Route path="/schemes" element={<SchemesPage />} />
        <Route path="/schemes/:id" element={<SchemeDetailsPage />} />
        <Route path="/records" element={<FarmRecordsPage />} />
        <Route path="/calculator" element={<FarmCalculatorPage />} />
        <Route path="/loan-eligibility" element={<LoanEligibilityPage />} />
        <Route path="/orders" element={<OrdersDeliveryPage />} />
        <Route path="/profile" element={<ProfileSettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};
