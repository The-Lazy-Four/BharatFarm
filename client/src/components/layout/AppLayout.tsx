import React from 'react';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { useIsMobile } from '../../hooks/useIsMobile.js';

import { FloatingKrishiBot, SpeakToAiControl } from '../../modules/basic-farmer-needs/krishibot/index.js';

/**
 * AppLayout — Unified BharatFarm Layout.
 * On mobile viewports, the child page provides its own mobile headers and navigation,
 * so we avoid rendering the fixed desktop header, sidebar, and floating controls.
 * Desktop viewports display Sidebar fixed left + main scrollable content.
 */
export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
        {children}
      </div>
    );
  }

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

      <SpeakToAiControl />
      <FloatingKrishiBot />
    </div>
  );
};

