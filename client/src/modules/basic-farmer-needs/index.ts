// Basic Farmer Needs module entry point
// Public API: re-exports everything consumed by the top-level router

// Dashboard Shell
export { AppLayout } from './dashboard/AppLayout';

// Pages exposed to the app router
export { MasterDashboardPage } from './dashboard/MasterDashboardPage';
export { FarmRecordsPage } from './records/FarmRecordsPage';
export { FarmCalculatorPage } from './calculator/FarmCalculatorPage';
export { LoanEligibilityPage } from './loan-eligibility/LoanEligibilityPage';
export { OrdersDeliveryPage } from './orders/OrdersDeliveryPage';
export { ProfileSettingsPage } from './profile/ProfileSettingsPage';
export { CropRoadmapPage } from './roadmap/CropRoadmapPage';

// Feature sub-module public APIs (re-exported for router convenience)
export { ScannerPage } from './scanner/index';
export { MarketplacePage, CreateListingPage, ProductPage } from './marketplace/index';
export { SchemesPage, SchemeDetailsPage } from './schemes/index';
