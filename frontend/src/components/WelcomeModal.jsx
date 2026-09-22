import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { useTour } from '../context/TourContext';

/**
 * Modal de bienvenida que aparece la primera vez que un usuario
 * administrador entra al panel. Pregunta si quiere tomar el tour.
 *
 * Estado guardado en localStorage:
 *   - cbp_tour_seen_dashboard   = 'true'    -> nunca mas aparece
 *   - (no establecido)          -> aparece en proximo login
 *
 * El usuario puede:
 *   - Aceptar: inicia el tour del dashboard
 *   - Rechazar: marca como visto y no aparece mas
 *   - Mas tarde: lo muestra de nuevo el boton ? del header
 */
const STORAGE_KEY = 'cbp_tour_seen_dashboard';

export default function WelcomeModal() {
  const { start } = useTour();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Esperar 1.5s antes de mostrar para que cargue la pagina
        const timer = setTimeout(() => setOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch { /* ignore */ }
  }, []);

  const handleAccept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
    setOpen(false);
    setTimeout(() => start('dashboard-general'), 200);
  };

  const handleDismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9980] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full p-7 animate-spring-in">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-3">
            <Sparkles size={28} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-dark-text">
            ¡Bienvenido al Panel del Colegio!
          </h2>
          <p className="text-sm text-slate-600 dark:text-dark-text-muted mt-2">
            Te guiaremos en un recorrido de menos de 1 minuto
            para que conozcas las novedades.
          </p>
        </div>

        <div className="space-y-2 mb-6">
          <Feature icon={MapPin} text="Conoce donde estan las funciones principales" />
          <Feature icon={Sparkles} text="Descubre como crear contenido facilmente" />
          <Feature icon={ArrowRight} text="Aprende a publicar en pocos pasos" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2.5 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-lg transition-colors"
          >
            Quizas luego
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-red-600 press-feedback transition-colors"
          >
            <Sparkles size={14} />
            Empezar tour
          </button>
        </div>
      </div>
    </div>
  );
}

WelcomeModal.propTypes = {};

function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-dark-text-muted">
      <Icon size={16} className="text-primary flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}
