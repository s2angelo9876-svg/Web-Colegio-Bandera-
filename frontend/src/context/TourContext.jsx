import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';

const TourContext = createContext();

const STORAGE_KEY_PREFIX = 'cbp_tour_';

/**
 * Proveedor global del sistema de tours.
 *
 * Cada tour tiene un ID unico. El estado (completado, paso actual)
 * se persiste en localStorage con la clave cbp_tour_<tourId>.
 *
 * API:
 *   const { start, stop, isActive, currentStep, nextStep, prevStep,
 *           skip, complete, isCompleted } = useTour();
 *
 *   start('dashboard-general');  // inicia un tour
 *   nextStep();                   // avanza al siguiente paso
 *   skip();                       // cierra el tour sin completar
 *   complete();                   // marca como completado y cierra
 *   isCompleted('dashboard-general'); // consulta si completo
 */
export function TourProvider({ children }) {
  const [activeTour, setActiveTour] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  // Usamos sessionStorage para el currentStep: si navega, el tour sigue donde estaba
  const sessionStep = useRef(0);

  // Restaurar paso activo al montar (si la pagina se recargo durante un tour)
  useEffect(() => {
    try {
      const active = sessionStorage.getItem(STORAGE_KEY_PREFIX + 'active');
      if (active) {
        setActiveTour(active);
        sessionStep.current = parseInt(sessionStorage.getItem(STORAGE_KEY_PREFIX + 'step') || '0', 10);
        setCurrentStep(sessionStep.current);
      }
    } catch { /* ignore */ }
  }, []);

  const storageKey = (tourId) => STORAGE_KEY_PREFIX + tourId;

  const start = useCallback((tourId) => {
    setActiveTour(tourId);
    sessionStep.current = 0;
    setCurrentStep(0);
    try {
      sessionStorage.setItem(STORAGE_KEY_PREFIX + 'active', tourId);
      sessionStorage.setItem(STORAGE_KEY_PREFIX + 'step', '0');
    } catch { /* ignore */ }
  }, []);

  const stop = useCallback(() => {
    setActiveTour(null);
    sessionStep.current = 0;
    setCurrentStep(0);
    try {
      sessionStorage.removeItem(STORAGE_KEY_PREFIX + 'active');
      sessionStorage.removeItem(STORAGE_KEY_PREFIX + 'step');
    } catch { /* ignore */ }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => {
      const next = s + 1;
      sessionStep.current = next;
      try { sessionStorage.setItem(STORAGE_KEY_PREFIX + 'step', String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => {
      const prev = Math.max(0, s - 1);
      sessionStep.current = prev;
      try { sessionStorage.setItem(STORAGE_KEY_PREFIX + 'step', String(prev)); } catch { /* ignore */ }
      return prev;
    });
  }, []);

  const skip = useCallback(() => {
    // NO marca como completado: el usuario podra relanzarlo
    stop();
  }, [stop]);

  const complete = useCallback(() => {
    if (!activeTour) return;
    try {
      localStorage.setItem(storageKey(activeTour), 'true');
    } catch { /* ignore */ }
    stop();
  }, [activeTour, stop]);

  const isCompleted = useCallback((tourId) => {
    try {
      return localStorage.getItem(storageKey(tourId)) === 'true';
    } catch { return false; }
  }, []);

  const resetTour = useCallback((tourId) => {
    try {
      localStorage.removeItem(storageKey(tourId));
    } catch { /* ignore */ }
  }, []);

  const value = useMemo(() => ({
    activeTour,
    currentStep,
    isActive: !!activeTour,
    start,
    stop,
    nextStep,
    prevStep,
    skip,
    complete,
    isCompleted,
    resetTour,
  }), [activeTour, currentStep, start, stop, nextStep, prevStep, skip, complete, isCompleted, resetTour]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

TourProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour debe usarse dentro de <TourProvider>');
  return ctx;
}
