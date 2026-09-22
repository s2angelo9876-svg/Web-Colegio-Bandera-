import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/api';

/**
 * Hook para registrar visitas a las páginas públicas del portal.
 * Omite rutas administrativas (/admin, /login) y previene envíos duplicados por re-renders.
 */
export function usePageTracker() {
  const location = useLocation();
  const lastTracked = useRef('');

  useEffect(() => {
    const currentPath = location.pathname;

    // No trackear rutas internas del admin ni login
    if (currentPath.startsWith('/admin') || currentPath === '/login') {
      return;
    }

    // Evitar trackear la misma ruta dos veces seguidas
    if (lastTracked.current === currentPath) {
      return;
    }

    lastTracked.current = currentPath;

    // Enviar silenciosamente sin bloquear render
    trackPageView(currentPath).catch(() => {
      // Silenciar errores de tracking en el cliente para no afectar UX
    });
  }, [location.pathname]);
}
