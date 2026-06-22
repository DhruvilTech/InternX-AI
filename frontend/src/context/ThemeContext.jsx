import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

function getInitialTheme() {
  const stored = localStorage.getItem('internx-theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system'; // System theme as default
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [activeTheme, setActiveTheme] = useState('dark');

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const resolved = theme === 'system'
        ? (mediaQuery.matches ? 'dark' : 'light')
        : theme;
      
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      setActiveTheme(resolved);
    };

    handleChange();
    localStorage.setItem('internx-theme', theme);

    // Register media query listener for system auto theme changes
    if (theme === 'system') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((current) => {
      if (current === 'dark') return 'light';
      if (current === 'light') return 'system';
      return 'dark'; // Cycle dark -> light -> system
    });
  };

  const setTheme = (newTheme) => {
    if (['dark', 'light', 'system'].includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      activeTheme,
      setTheme,
      toggleTheme,
      isDark: activeTheme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
