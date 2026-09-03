import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { FloatingKrishiBot, SpeakToAiControl } from '../krishibot/index';

/**
 * AppLayout — Unified BharatFarm Layout.
 * Mobile viewports display compact Header + MobileNavigation.
 * Desktop viewports display Sidebar fixed left + main scrollable content.
 */
export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <main className="app-main" style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 'calc(100vh - 56px)'
        }}>
          {children}
        </main>
      </div>
      <MobileNavigation />
      <SpeakToAiControl />
      <FloatingKrishiBot />
    </div>
  );
};

