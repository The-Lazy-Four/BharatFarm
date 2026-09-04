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
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MasterDashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/scanner"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ScannerPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="" element={<MarketplacePage />} />
                <Route path="new" element={<CreateListingPage />} />
                <Route path=":id" element={<ProductPage />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/weather"
        element={
          <ProtectedRoute>
            <AppLayout>
              <WeatherPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/groupbuying/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="" element={<GroupBuyingPage />} />
                <Route path=":id" element={<GroupDetailsPage />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schemes/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="" element={<SchemesPage />} />
                <Route path=":id" element={<SchemeDetailsPage />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/records"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FarmRecordsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calculator"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FarmCalculatorPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crop-roadmap"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CropRoadmapPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CropRoadmapPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-eligibility"
        element={
          <ProtectedRoute>
            <AppLayout>
              <LoanEligibilityPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <AppLayout>
              <OrdersDeliveryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfileSettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};
