import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { HelpCircle } from 'lucide-react';

/**
 * HelpTooltip: muestra un icono (?) que al hacer hover/click
 * despliega un texto de ayuda para guiar al usuario no-tecnico.
 *
 * Uso:
 *   <HelpTooltip text="Esta imagen aparecera en la portada principal" />
 *   <FieldLabel label="Titulo" help="Texto de ayuda" required />
 */
export default function HelpTooltip({ text, position = 'top' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!text) return null;

  const positions = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  const arrows = {
    top:    'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-900',
    left:   'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-900',
    right:  'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-900',
  };

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Mostrar ayuda"
        className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-primary hover:text-white transition-colors text-xs font-bold"
      >
        ?
      </button>

      {open && (
        <div
          role="tooltip"
          className={`absolute z-50 ${positions[position]} w-64 p-3 bg-slate-900 dark:bg-dark-card text-white text-xs leading-relaxed rounded-lg shadow-xl pointer-events-none animate-fade-in`}
        >
          {text}
          <span
            className={`absolute w-0 h-0 border-4 ${arrows[position]}`}
            aria-hidden="true"
          />
        </div>
      )}
    </span>
  );
}

HelpTooltip.propTypes = {
  text: PropTypes.string,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
};

// Variante alternativa como icono (Lucide)
export function HelpIcon({ text, position = 'top' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!text) return null;

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Mostrar ayuda"
        className="ml-1.5 inline-flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
      >
        <HelpCircle size={14} />
      </button>
      {open && (
        <div
          role="tooltip"
          className={`absolute z-50 ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : 'top-full left-1/2 -translate-x-1/2 mt-2'} w-64 p-3 bg-slate-900 text-white text-xs leading-relaxed rounded-lg shadow-xl pointer-events-none animate-fade-in`}
        >
          {text}
        </div>
      )}
    </span>
  );
}

HelpIcon.propTypes = {
  text: PropTypes.string,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
};
