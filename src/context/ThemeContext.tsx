import React, { createContext, useContext, useState, useEffect } from 'react';
import { DashboardTheme, ThemeConfig } from '../types';

export const THEME_CONFIGS: Record<DashboardTheme, ThemeConfig> = {
  slate: {
    id: 'slate',
    name: 'Modern Slate',
    isDark: false,
    accentColor: '#2563eb', // Blue 600
    bgClass: 'bg-slate-50 text-slate-900',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Dark',
    isDark: true,
    accentColor: '#3b82f6', // Blue 500
    bgClass: 'bg-slate-950 text-slate-100',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Clean',
    isDark: false,
    accentColor: '#059669', // Emerald 600
    bgClass: 'bg-emerald-50/40 text-slate-900',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire Deep',
    isDark: true,
    accentColor: '#6366f1', // Indigo 500
    bgClass: 'bg-slate-950 text-indigo-50',
  },
  amber: {
    id: 'amber',
    name: 'Warm Amber',
    isDark: false,
    accentColor: '#d97706', // Amber 600
    bgClass: 'bg-amber-50/40 text-slate-900',
  },
};

interface ThemeContextType {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  isDark: boolean;
  themeConfig: ThemeConfig;
}

const STORAGE_KEY_THEME = 'mailverify_dashboard_theme_v1';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<DashboardTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME) as DashboardTheme;
      if (saved && THEME_CONFIGS[saved]) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'slate';
  });

  const setTheme = (newTheme: DashboardTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    } catch {
      // ignore
    }
  };

  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.slate;
  const isDark = themeConfig.isDark;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, isDark]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
