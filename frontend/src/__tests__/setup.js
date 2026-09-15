import '@testing-library/jest-dom';

// Mock de import.meta.env para Vite
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}
