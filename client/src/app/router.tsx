import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { AppLayout } from '../components/layout/AppLayout.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ModuleHomePage } from './pages/ModuleHomePage.js';

// Innovation Module Pages
import { ClimateRiskPage } from '../features/innovations/ClimateRiskPage.js';
import { AggregationOptimizerPage } from '../features/innovations/AggregationOptimizerPage.js';
import { CropInsuranceVerificationPage } from '../features/innovations/CropInsuranceVerificationPage.js';
import { SmartMandiPage } from '../features/innovations/SmartMandiPage.js';

// Existing Platform Pages
import { MasterDashboardPage } from './pages/MasterDashboardPage.js';
import { SahayakPage } from './pages/SahayakPage.js';
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
import { CropRoadmapPage } from './pages/CropRoadmapPage.js';

/**
 * ProtectedRoute component — Redirects unauthenticated users to /login
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-bg, #0b1d12)',
        color: 'var(--text-primary, #ffffff)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'var(--signal-lime, #16a34a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span className="material-symbols-outlined spin" style={{ fontSize: '28px', color: '#ffffff' }}>
            agriculture
          </span>
        </div>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)' }}>
          Loading BharatFarm Platform...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * PublicRoute component — Redirects authenticated users from /login and /register to post-login home page /
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* STANDALONE POST-LOGIN MODULE HOMEPAGE (NO AppLayout, NO Sidebar, NO Dashboard Shell) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ModuleHomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/module-home"
        element={
          <ProtectedRoute>
            <ModuleHomePage />
          </ProtectedRoute>
        }
      />

      {/* Application Modules & Dashboard Wrapped in AppLayout (Sidebar, Navigation, Shell) */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                {/* 5 SIH Innovation Modules */}
                <Route path="/innovations/climate-risk" element={<ClimateRiskPage />} />
                <Route path="/innovations/aggregation-optimizer" element={<AggregationOptimizerPage />} />
                <Route path="/innovations/satellite-insurance" element={<CropInsuranceVerificationPage />} />
                <Route path="/innovations/smart-mandi" element={<SmartMandiPage />} />
                <Route path="/innovations/sahayak" element={<SahayakPage />} />

                {/* Complete Original BharatFarm Dashboard (Basic Farmer Needs) */}
                <Route path="/dashboard" element={<MasterDashboardPage />} />

                {/* Legacy/Direct Platform Feature Routes (Preserved & Integrated) */}
                <Route path="/sahayak" element={<SahayakPage />} />
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
                <Route path="/crop-roadmap" element={<CropRoadmapPage />} />
                <Route path="/loan-eligibility" element={<LoanEligibilityPage />} />
                <Route path="/orders" element={<OrdersDeliveryPage />} />
                <Route path="/profile" element={<ProfileSettingsPage />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
