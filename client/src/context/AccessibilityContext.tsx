import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSizeLevel = 'sm' | 'md' | 'lg';

interface AccessibilityContextType {
  fontSize: FontSizeLevel;
  setFontSize: (size: FontSizeLevel) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  skipToContent: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  fontSize: 'md',
  setFontSize: () => {},
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
  resetFontSize: () => {},
  skipToContent: () => {}
});

const STORAGE_KEY = 'bharatfarm_font_size';

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSizeLevel>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'sm' || stored === 'md' || stored === 'lg') return stored;
    } catch {
      // fallback
    }
    return 'md';
  });

  const setFontSize = (size: FontSizeLevel) => {
    setFontSizeState(size);
    try {
      localStorage.setItem(STORAGE_KEY, size);
    } catch {
      // ignore
    }
  };

  const increaseFontSize = () => {
    if (fontSize === 'sm') setFontSize('md');
    else if (fontSize === 'md') setFontSize('lg');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'lg') setFontSize('md');
    else if (fontSize === 'md') setFontSize('sm');
  };

  const resetFontSize = () => {
    setFontSize('md');
  };

  const skipToContent = () => {
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    if (mainContent) {
      mainContent.tabIndex = -1;
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        skipToContent
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
