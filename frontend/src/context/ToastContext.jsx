import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext();

const ICONS = {
  success: <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />,
  error:   <XCircle size={18} className="text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />,
  info:    <Info size={18} className="text-blue-500 flex-shrink-0" />,
};

const COLORS = {
  success: 'border-emerald-500 bg-white',
  error:   'border-red-500 bg-white',
  warning: 'border-amber-500 bg-white',
  info:    'border-blue-500 bg-white',
};

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Escuchar eventos globales (ej. desde interceptors de Axios)
  useEffect(() => {
    const handler = (e) => {
      const { type, message } = e.detail || {};
      if (type && message) {
        const id = ++nextId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
      }
    };
    window.addEventListener('app:toast', handler);
    return () => window.removeEventListener('app:toast', handler);
  }, []);

  const push = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  const value = useMemo(() => ({
    success: (msg, duration) => push(msg, 'success', duration),
    error:   (msg, duration) => push(msg, 'error', duration),
    warning: (msg, duration) => push(msg, 'warning', duration),
    info:    (msg, duration) => push(msg, 'info', duration),
    remove,
  }), [push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[1000] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border-l-4 ${COLORS[t.type]} shadow-lg animate-spring-in`}
          >
            {ICONS[t.type]}
            <p className="flex-1 text-sm text-slate-700 font-medium leading-snug">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
              aria-label="Cerrar notificación"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
