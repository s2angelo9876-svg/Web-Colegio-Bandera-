import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

// Lee el tema actual considerando localStorage y prefers-color-scheme.
// (El script anti-flash en index.html ya aplicó .dark al <html>).
function getInitialTheme() {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch { /* ignore */ }
  // Fallback a la preferencia del sistema operativo
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Aplicar/remover clase .dark en <html> cuando cambia el tema
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch { /* ignore */ }
  }, [theme]);

  // Escuchar cambios en prefers-color-scheme SOLO si el usuario
  // no ha elegido manualmente (no hay localStorage 'theme').
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      try {
        // Solo aplicar si el usuario no ha hecho override manual
        if (localStorage.getItem('theme')) return;
      } catch { return; }
      setTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({ theme, isDarkMode: theme === 'dark', toggleDarkMode, setTheme }),
    [theme, toggleDarkMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
