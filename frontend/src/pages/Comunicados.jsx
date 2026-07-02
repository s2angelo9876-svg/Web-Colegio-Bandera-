import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getComunicados } from '../services/api';
import {
  Bell, Calendar, Tag, FileX, RefreshCw,
  ChevronDown, ChevronUp, Search, Shield, Filter
} from 'lucide-react';
import Footer from '../components/Footer';

const categoryColors = {
  general:    'bg-slate-100 text-slate-700',
  urgente:    'bg-red-100 text-red-700',
  academico:  'bg-blue-100 text-blue-700',
  academico2: 'bg-blue-100 text-blue-700',
  social:     'bg-emerald-100 text-emerald-700',
};

function ComunicadoCard({ c, index }) {
  const [expanded, setExpanded] = useState(false);
  const cat = (c.categoria || 'general').toLowerCase().replace('á', 'a');
  const colorClass = categoryColors[cat] || categoryColors.general;
  const fecha = new Date(c.fecha);
  const isUrgent = cat === 'urgente';

  return (
    <div
      className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex">
        <div className={`w-1.5 ${isUrgent ? 'bg-red-600' : 'bg-primary'} flex-shrink-0`} />

        <div className="flex-1 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${colorClass}`}>
                <Tag size={11} />
                {c.categoria || 'General'}
              </span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar size={13} />
                <span className="text-xs font-medium">
                  {!isNaN(fecha) ? fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Fecha por confirmar'}
                </span>
              </div>
            </div>

            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isUrgent ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
              <Bell size={16} />
            </div>
          </div>

          <h3 className={`text-lg md:text-xl font-bold mb-3 leading-tight ${isUrgent ? 'text-red-600' : 'text-slate-900'}`}>
            {c.titulo}
          </h3>

          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-20 opacity-70'}`}>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {c.contenido}
            </p>
          </div>

          <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider hover:text-red-600 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp size={14} />
                  Contraer
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Leer completo
                </>
              )}
            </button>

            {isUrgent && (
              <div className="flex items-center gap-1.5 text-red-600">
                <Shield size={13} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Prioridad Alta</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ComunicadoCard.propTypes = {
  c: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    titulo: PropTypes.string,
    contenido: PropTypes.string,
    categoria: PropTypes.string,
    fecha: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

function Comunicados() {
  const [comunicados, setComunicados] = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [busqueda, setBusqueda]       = useState('');
  const [categoria, setCategoria]     = useState('todos');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await getComunicados();
      setComunicados(res.data || []);
    } catch { /* ignore error */ } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = comunicados.filter(c => {
    const matchesBusqueda = (c.titulo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                          (c.contenido || '').toLowerCase().includes(busqueda.toLowerCase());
    const matchesCategoria = categoria === 'todos' || (c.categoria || '').toLowerCase() === categoria.toLowerCase();
    return matchesBusqueda && matchesCategoria;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-20">

      {/* Page Header */}
      <section className="relative py-20 px-6 overflow-hidden bg-primary">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-semibold uppercase tracking-widest mb-6">
            <Bell size={14} />
            Avisos Oficiales
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Comunicados
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Mantente al día con los avisos oficiales y circulares emitidas por la Dirección General.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 -mt-10 pb-20 relative z-20">

        {/* Toolbar */}
        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">
                {cargando ? 'Cargando...' : `${filtrados.length} Comunicados`}
              </h2>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Para Padres y Alumnos</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar comunicado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Buscar comunicado"
              />
            </div>

            <div className="relative w-full md:w-44">
              <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                aria-label="Filtrar por categoría"
              >
                <option value="todos">Todas las categorías</option>
                <option value="general">General</option>
                <option value="urgente">Urgente</option>
                <option value="académico">Académico</option>
                <option value="social">Social</option>
              </select>
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

        {/* Skeletons */}
        {cargando && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-8 flex gap-4 animate-pulse">
                <div className="w-1.5 bg-slate-100 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-100 w-32 rounded" />
                  <div className="h-6 bg-slate-100 w-3/4 rounded" />
                  <div className="h-3 bg-slate-50 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista */}
        {!cargando && filtrados.length > 0 && (
          <div className="space-y-4">
            {filtrados.map((c, i) => (
              <ComunicadoCard key={c.id || i} c={c} index={i} />
            ))}
          </div>
        )}

        {/* Vacío */}
        {!cargando && filtrados.length === 0 && (
          <div className="bg-white rounded-xl p-16 text-center border border-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileX size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sin comunicados</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              No hemos encontrado comunicados que coincidan con los filtros seleccionados.
            </p>
            <button
              onClick={() => { setBusqueda(''); setCategoria('todos'); }}
              className="text-primary font-semibold text-xs uppercase tracking-wider hover:text-red-600 transition-colors underline underline-offset-4"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default Comunicados;
