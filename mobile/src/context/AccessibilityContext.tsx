import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, PixelRatio, Dimensions, AccessibilityInfo } from 'react-native';
import { themes, ColorRole } from '@loop/shared/designTokens';

export type ThemeType = 'light' | 'dark' | 'highContrast';

interface AccessibilityPreferences {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  fontScale: number;
  reduceMotion: boolean;
  screenReaderActive: boolean;
  simpleMode: boolean; // Patient mode: one item, huge cards
  setSimpleMode: (enabled: boolean) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;
  colors: ColorRole;
  scaleSize: (baseDp: number, maxMultiplier?: number) => number;
}

const AccessibilityContext = createContext<AccessibilityPreferences | null>(null);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<ThemeType | null>(null);
  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(false);
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const [screenReaderActive, setScreenReaderActive] = useState<boolean>(false);

  // Monitor system accessibility settings
  useEffect(() => {
    const motionSub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const screenReaderSub = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderActive);

    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderActive);

    return () => {
      motionSub?.remove();
      screenReaderSub?.remove();
    };
  }, []);

  // Determine active theme
  let activeTheme: ThemeType = themeOverride || (systemColorScheme === 'dark' ? 'dark' : 'light');
  if (simpleMode && !themeOverride) {
    // In Simple Patient Mode, default to High Contrast for maximum visibility
    activeTheme = 'highContrast';
  }

  const colors = themes[activeTheme];
  const systemFontScale = PixelRatio.getFontScale();

  /**
   * Theme-aware scalable sizing calculation based on system font scale.
   * Caps at sensible maxMultiplier (e.g. 2.5) to maintain layout harmony without clipping.
   */
  const scaleSize = (baseDp: number, maxMultiplier: number = 2.5): number => {
    const scale = Math.min(systemFontScale, maxMultiplier);
    return Math.round(baseDp * scale);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        theme: activeTheme,
        setTheme: (t) => setThemeOverride(t),
        fontScale: systemFontScale,
        reduceMotion,
        screenReaderActive,
        simpleMode,
        setSimpleMode,
        ttsEnabled,
        setTtsEnabled,
        colors,
        scaleSize
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityPreferences => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
