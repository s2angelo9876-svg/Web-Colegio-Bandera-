import { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getEventos } from '../services/api';
import {
  CalendarDays, MapPin, Clock, CalendarX, RefreshCw, Tag, Search
} from 'lucide-react';
import Footer from '../components/Footer';

function SkeletonEvento() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row animate-pulse shadow-sm">
      <div className="bg-slate-100 md:w-40 h-32 md:h-auto" />
      <div className="p-6 flex-1 space-y-3">
        <div className="h-3 bg-slate-100 w-24 rounded-full" />
        <div className="h-5 bg-slate-100 w-3/4 rounded" />
        <div className="h-3 bg-slate-50 w-full rounded" />
      </div>
    </div>
  );
}

SkeletonEvento.propTypes = {};

function EventoCard({ e, index }) {
  const fechaObj = e.fecha_evento ? new Date(e.fecha_evento + 'T00:00:00') : null;
  const dia = fechaObj && !isNaN(fechaObj) ? fechaObj.getDate() : '--';
  const mes = fechaObj && !isNaN(fechaObj)
    ? fechaObj.toLocaleDateString('es-PE', { month: 'short' }).toUpperCase().replace('.', '')
    : 'S/F';
  const anio = fechaObj && !isNaN(fechaObj) ? fechaObj.getFullYear() : '';

  return (
    <div
      className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row overflow-hidden group animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative bg-primary text-white flex flex-col items-center justify-center px-8 py-8 md:w-40 flex-shrink-0">
        <span className="text-5xl font-extrabold leading-none">{dia}</span>
        <span className="text-xs font-bold tracking-widest uppercase mt-1 opacity-90">{mes}</span>
        {anio && <span className="text-[10px] opacity-70 font-semibold mt-1 bg-white/20 px-2 py-0.5 rounded-full">{anio}</span>}
      </div>

      <div className="p-6 md:p-8 flex flex-col justify-center flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 bg-blue-50 text-primary text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
            <Tag size={10} />
            Actividad Escolar
          </span>
        </div>

        <h2 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight mb-3">
          {e.titulo}
        </h2>

        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-5">
          {e.descripcion || 'Participa en esta importante actividad de nuestra comunidad educativa.'}
        </p>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-6">
          {e.lugar && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <MapPin size={14} className="text-red-600" />
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ubicación</div>
                <div className="text-slate-800 text-sm font-semibold">{e.lugar}</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock size={14} className="text-primary" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Horario</div>
              <div className="text-slate-800 text-sm font-semibold">{e.hora_evento || 'Por confirmar'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

EventoCard.propTypes = {
  e: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    titulo: PropTypes.string,
    descripcion: PropTypes.string,
    fecha_evento: PropTypes.string,
    hora_evento: PropTypes.string,
    lugar: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

function Eventos() {
  const [eventos, setEventos]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargar = useCallback(() => {
    setCargando(true);
    getEventos()
      .then(res => { setEventos(res.data || []); })
      .catch(() => { /* ignore error */ })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return eventos;
    const q = busqueda.toLowerCase();
    return eventos.filter(e =>
      (e.titulo || '').toLowerCase().includes(q) ||
      (e.descripcion || '').toLowerCase().includes(q)
    );
  }, [eventos, busqueda]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-20">

      <section className="relative py-20 px-6 overflow-hidden bg-primary">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-semibold uppercase tracking-widest mb-6">
            <CalendarDays size={14} />
            Cronograma Académico
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Calendario Escolar
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Acompaña a nuestra comunidad en las actividades y fechas más importantes del año académico.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 -mt-10 pb-20 relative z-20">

        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
              <CalendarDays size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">
                {cargando ? 'Cargando...' : `${filtrados.length} Actividades`}
              </h2>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Cronograma Institucional 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar evento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Buscar evento"
              />
            </div>
            <button
              onClick={cargar}
              disabled={cargando}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/20 rounded-lg transition-all disabled:opacity-50"
              aria-label="Actualizar"
            >
              <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {cargando && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <SkeletonEvento key={i} />)}
          </div>
        )}

        {!cargando && filtrados.length > 0 && (
          <div className="space-y-4">
            {filtrados.map((e, i) => <EventoCard key={e.id || i} e={e} index={i} />)}
          </div>
        )}

        {!cargando && filtrados.length === 0 && (
          <div className="bg-white rounded-xl p-16 text-center border border-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CalendarX size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sin eventos</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              No hemos encontrado actividades programadas con esos términos.
            </p>
            <button
              onClick={() => setBusqueda('')}
              className="text-primary font-semibold text-xs uppercase tracking-wider hover:text-red-600 transition-colors underline underline-offset-4"
            >
              Ver todo el calendario
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default Eventos;
