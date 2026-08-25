import React from 'react';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { MobileNavigation } from './MobileNavigation.js';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main className="app-main" style={{ flex: 1, padding: '2rem', background: 'var(--bg-dark)', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
};
