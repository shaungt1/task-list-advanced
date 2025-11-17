import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Util: get initial theme
function getInitialTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(getInitialTheme());

  useEffect(() => {
    console.log('[ThemeContext] useEffect: theme changed to', theme);
    localStorage.setItem('theme', theme);

  }, [theme]);

  const setTheme = (t: 'light' | 'dark') => {
  console.log('[ThemeContext] setTheme called:', t);
  setThemeState(t);
};
  const toggleTheme = () => {
  setThemeState((prev) => {
    const next = prev === 'dark' ? 'light' : 'dark';
    console.log('[ThemeContext] toggleTheme called. Next theme:', next);
    return next;
  });
};

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
