import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getNoticias, UPLOADS_URL } from '../services/api';
import { sanitizeText } from '../utils/sanitize';
import {
  Newspaper, Zap, ArrowRight, Calendar,
  FileX, RefreshCw, Search
} from 'lucide-react';
import Footer from '../components/Footer';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
      <div className="h-48 bg-slate-100" />
      <div className="p-6 space-y-3">
        <div className="h-3 bg-slate-100 w-24 rounded-full" />
        <div className="h-6 bg-slate-100 w-full rounded" />
        <div className="h-3 bg-slate-50 w-full rounded" />
        <div className="h-3 bg-slate-50 w-3/4 rounded" />
      </div>
    </div>
  );
}

SkeletonCard.propTypes = {};

function NoticiaCard({ n, index }) {
  return (
    <article
      className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="h-48 overflow-hidden relative bg-slate-100">
        <img
          src={n.imagen
            ? `${UPLOADS_URL}/${n.imagen}`
            : 'https://placehold.co/600x400/f1f5f9/64748b?text=Noticia'}
          alt={n.titulo || 'Noticia institucional'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/600x400/f1f5f9/64748b?text=Noticia';
          }}
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
          <Zap size={9} />
          Institucional
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-2 text-slate-400">
          <Calendar size={12} />
          <span className="text-[10px] font-medium">
            {n.fecha ? new Date(n.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Fecha no disponible'}
          </span>
        </div>

        <h2 className="text-base font-bold text-slate-900 mb-2 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {n.titulo || 'Sin título'}
        </h2>

        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">
          {sanitizeText(n.contenido)}
        </p>

        <div className="pt-3 border-t border-slate-100">
          <button className="inline-flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider hover:text-red-600 transition-colors">
            Expandir Noticia
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </article>
  );
}

NoticiaCard.propTypes = {
  n: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    titulo: PropTypes.string,
    contenido: PropTypes.string,
    imagen: PropTypes.string,
    fecha: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargarNoticias = useCallback((page = 1) => {
    setCargando(true);
    getNoticias({ page, limit: 6 })
      .then(res => {
        setNoticias(res.data.data || []);
        setPagination(prev => ({ ...prev, totalPages: res.data.pagination?.totalPages || 1 }));
      })
      .catch(() => { /* ignore error */ })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargarNoticias(pagination.page);
  }, [pagination.page, cargarNoticias]);

  const filtradas = useMemo(() => {
    if (!busqueda.trim()) return noticias;
    const q = busqueda.toLowerCase();
    return noticias.filter(n =>
      (n.titulo || '').toLowerCase().includes(q) ||
      (n.contenido || '').toLowerCase().includes(q)
    );
  }, [noticias, busqueda]);

  const handlePageChange = useCallback((newPage) => {
    setPagination(p => ({ ...p, page: newPage }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-20">

      <section className="relative py-20 px-6 overflow-hidden bg-primary">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-semibold uppercase tracking-widest mb-6">
            <Newspaper size={14} />
            Sala de Prensa
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Actualidad Bandera
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Mantente informado sobre los últimos acontecimientos, logros y novedades de nuestra institución.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-10 pb-20 relative z-20">

        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">
                {cargando ? 'Cargando...' : `${filtradas.length} Publicaciones`}
              </h2>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Prensa Institucional</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar noticia..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Buscar noticia"
              />
            </div>
            <button
              onClick={() => cargarNoticias()}
              disabled={cargando}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/20 rounded-lg transition-all disabled:opacity-50"
              aria-label="Actualizar"
            >
              <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {cargando && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!cargando && filtradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtradas.map((n, i) => (
              <NoticiaCard key={n.id || i} n={n} index={i} />
            ))}
          </div>
        )}

        {!cargando && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30 transition-all"
              aria-label="Página anterior"
            >
              <ArrowRight size={16} className="rotate-180" />
            </button>
            <span className="text-sm font-semibold text-slate-700">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30 transition-all"
              aria-label="Página siguiente"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {!cargando && filtradas.length === 0 && (
          <div className="bg-white rounded-xl p-16 text-center border border-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileX size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sin resultados</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              No hemos encontrado noticias que coincidan con tu búsqueda.
            </p>
            <button
              onClick={() => { setBusqueda(''); setPagination(p => ({ ...p, page: 1 })); }}
              className="text-primary font-semibold text-xs uppercase tracking-wider hover:text-red-600 transition-colors underline underline-offset-4"
            >
              Reiniciar filtros
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default Noticias;
