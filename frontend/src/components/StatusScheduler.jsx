import PropTypes from 'prop-types';
import { Globe, FileClock, CalendarCheck, Clock, AlertCircle } from 'lucide-react';

export default function StatusScheduler({ estado, fechaPublicacion, onChangeEstado, onChangeFechaPublicacion }) {
  const formatearFechaInput = (isoString) => {
    if (!isoString) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    }
    try {
      const d = new Date(isoString);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider mb-2">
          ¿Cuándo deseas que esté disponible?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Opción 1: Publicar de inmediato */}
          <button
            type="button"
            onClick={() => {
              onChangeEstado('publicado');
              onChangeFechaPublicacion(new Date().toISOString());
            }}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              estado === 'publicado'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-dark-card'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                estado === 'publicado' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                <Globe size={16} />
              </div>
              {estado === 'publicado' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Activo
                </span>
              )}
            </div>
            <p className="font-bold text-sm text-slate-900 dark:text-dark-text">Publicar ahora</p>
            <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1 leading-snug">
              Visible inmediatamente en el portal para todos los visitantes.
            </p>
          </button>

          {/* Opción 2: Borrador */}
          <button
            type="button"
            onClick={() => onChangeEstado('borrador')}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              estado === 'borrador'
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-dark-card'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                estado === 'borrador' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                <FileClock size={16} />
              </div>
              {estado === 'borrador' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                  Borrador
                </span>
              )}
            </div>
            <p className="font-bold text-sm text-slate-900 dark:text-dark-text">Guardar borrador</p>
            <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1 leading-snug">
              Solo visible en tu panel de administración. Nadie en la web lo verá.
            </p>
          </button>

          {/* Opción 3: Programar */}
          <button
            type="button"
            onClick={() => onChangeEstado('programado')}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              estado === 'programado'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-dark-card'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                estado === 'programado' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                <CalendarCheck size={16} />
              </div>
              {estado === 'programado' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  Programado
                </span>
              )}
            </div>
            <p className="font-bold text-sm text-slate-900 dark:text-dark-text">Programar fecha</p>
            <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1 leading-snug">
              Se publicará de forma automática en la fecha y hora elegida.
            </p>
          </button>
        </div>
      </div>

      {/* Selector de fecha y hora si es programado */}
      {estado === 'programado' && (
        <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2 animate-fade-in">
          <label className="block text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 uppercase tracking-wider">
            <Clock size={14} className="text-blue-600 dark:text-blue-400" />
            Fecha y hora de publicación automática
          </label>
          <input
            type="datetime-local"
            value={formatearFechaInput(fechaPublicacion)}
            onChange={(e) => {
              if (e.target.value) {
                onChangeFechaPublicacion(new Date(e.target.value).toISOString());
              }
            }}
            className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-dark-card border border-blue-300 dark:border-blue-700 rounded-lg text-sm text-slate-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            ⏰ El contenido permanecerá oculto al público hasta que llegue este momento exacto.
          </p>
        </div>
      )}

      {estado === 'borrador' && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <AlertCircle size={15} className="flex-shrink-0 text-amber-500" />
          <span>Este contenido se guardará como <strong>Borrador</strong>. Podrás editarlo y publicarlo cuando esté listo.</span>
        </div>
      )}
    </div>
  );
}

StatusScheduler.propTypes = {
  estado: PropTypes.oneOf(['publicado', 'borrador', 'programado']).isRequired,
  fechaPublicacion: PropTypes.string,
  onChangeEstado: PropTypes.func.isRequired,
  onChangeFechaPublicacion: PropTypes.func.isRequired,
};
