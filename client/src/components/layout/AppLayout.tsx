import React from 'react';
import { Sidebar } from './Sidebar.js';
import { MobileNavigation } from './MobileNavigation.js';
import { FloatingKrishiBot } from '../../features/krishibot/index.js';

/**
 * AppLayout — Stitch Master Style Fix layout.
 * No top header bar; logo is inside the sidebar.
 * Sidebar fixed left, main area fills remaining space.
 */
export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className="app-main" style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: '100vh'
      }}>
        {children}
      </main>
      <MobileNavigation />
      <FloatingKrishiBot />
    </div>
  );
};
