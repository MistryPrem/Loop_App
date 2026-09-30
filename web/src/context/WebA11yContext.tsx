import React, { createContext, useContext, useState, useEffect } from 'react';

export type WebTheme = 'light' | 'dark' | 'highContrast';

interface A11yContextType {
  theme: WebTheme;
  setTheme: (theme: WebTheme) => void;
  simpleMode: boolean;
  setSimpleMode: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
  announceMessage: string | null;
  announce: (msg: string, assertive?: boolean) => void;
  isAssertive: boolean;
}

const WebA11yContext = createContext<A11yContextType | null>(null);

export const WebA11yProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<WebTheme>(() => {
    return (localStorage.getItem('loop_theme') as WebTheme) || 'light';
  });

  const [simpleMode, setSimpleModeState] = useState<boolean>(() => {
    return localStorage.getItem('loop_simple_mode') === 'true';
  });

  const [reduceMotion, setReduceMotionState] = useState<boolean>(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [announceMessage, setAnnounceMessage] = useState<string | null>(null);
  const [isAssertive, setIsAssertive] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'high-contrast');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'highContrast' || (simpleMode && theme === 'light')) {
      root.classList.add('high-contrast');
    }
    localStorage.setItem('loop_theme', theme);
  }, [theme, simpleMode]);

  const setTheme = (t: WebTheme) => setThemeState(t);
  const setSimpleMode = (enabled: boolean) => {
    setSimpleModeState(enabled);
    localStorage.setItem('loop_simple_mode', String(enabled));
  };
  const setReduceMotion = (enabled: boolean) => setReduceMotionState(enabled);

  const announce = (msg: string, assertive: boolean = false) => {
    setIsAssertive(assertive);
    setAnnounceMessage(msg);
  };

  return (
    <WebA11yContext.Provider
      value={{
        theme,
        setTheme,
        simpleMode,
        setSimpleMode,
        reduceMotion,
        setReduceMotion,
        announceMessage,
        announce,
        isAssertive
      }}
    >
      {/* ARIA Live Regions for real-time announcements */}
      <div
        aria-live={isAssertive ? 'assertive' : 'polite'}
        aria-atomic="true"
        className="sr-only"
      >
        {announceMessage}
      </div>
      {children}
    </WebA11yContext.Provider>
  );
};

export const useWebA11y = (): A11yContextType => {
  const context = useContext(WebA11yContext);
  if (!context) throw new Error('useWebA11y must be used within WebA11yProvider');
  return context;
};
