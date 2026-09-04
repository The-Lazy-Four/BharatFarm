import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { AppLayout } from '../components/layout/AppLayout.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { LandingPage } from './pages/LandingPage.js';
import { ModuleHomePage } from './pages/ModuleHomePage.js';

// SIH Launcher Dashboard & Feature Workspaces
import {
  SihDashboardPage,
  ClimateRiskPage,
  AggregationOptimizerPage,
  CropInsuranceVerificationPage,
  SmartMandiPage,
  SahayakPage
} from '../modules/sih/index.js';

// Existing Platform Pages (Basic Farmer Needs)
import {
  MasterDashboardPage,
  ScannerPage,
  MarketplacePage, CreateListingPage, ProductPage,
  WeatherPage,
  GroupBuyingPage, GroupDetailsPage,
  SchemesPage, SchemeDetailsPage,
  FarmRecordsPage,
  FarmCalculatorPage,
  OrdersDeliveryPage,
  ProfileSettingsPage,
  LoanEligibilityPage,
  CropRoadmapPage
} from '../modules/basic-farmer-needs/index.js';

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
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Landing Page */}
      <Route
        path="/"
        element={<LandingPage />}
      />

      {/* 2. Public Auth Routes */}
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

      {/* 3. Main Dashboard After Login */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <ModuleHomePage />
          </ProtectedRoute>
        }
      />

      {/* Alias /sih to /home */}
      <Route path="/sih" element={<Navigate to="/home" replace />} />
      <Route path="/module-home" element={<Navigate to="/home" replace />} />

      {/* 4. SIH Innovation Pages (5 Separate Pages) */}
      <Route
        path="/sih/climate-risk"
        element={
          <ProtectedRoute>
            <ClimateRiskPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sih/aggregation"
        element={
          <ProtectedRoute>
            <AggregationOptimizerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sih/crop-insurance"
        element={
          <ProtectedRoute>
            <CropInsuranceVerificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sih/smart-mandi"
        element={
          <ProtectedRoute>
            <SmartMandiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sih/sahayak"
        element={
          <ProtectedRoute>
            <SahayakPage />
          </ProtectedRoute>
        }
      />

      {/* Backward Compatibility Aliases for SIH Routes */}
      <Route path="/innovations/climate-risk" element={<Navigate to="/sih/climate-risk" replace />} />
      <Route path="/innovations/aggregation-optimizer" element={<Navigate to="/sih/aggregation" replace />} />
      <Route path="/innovations/satellite-insurance" element={<Navigate to="/sih/crop-insurance" replace />} />
      <Route path="/innovations/smart-mandi" element={<Navigate to="/sih/smart-mandi" replace />} />
      <Route path="/innovations/sahayak" element={<Navigate to="/sih/sahayak" replace />} />

      {/* 5. Basic Farmer Needs Section (Detached Platform wrapped in AppLayout) */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                {/* Master Dashboard */}
                <Route path="/dashboard" element={<MasterDashboardPage />} />

                {/* Platform Utilities */}
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
                <Route path="/roadmap" element={<CropRoadmapPage />} />
                <Route path="/loan-eligibility" element={<LoanEligibilityPage />} />
                <Route path="/orders" element={<OrdersDeliveryPage />} />
                <Route path="/profile" element={<ProfileSettingsPage />} />
                
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
