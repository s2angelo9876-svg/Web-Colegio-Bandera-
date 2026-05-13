import { useEffect, useState } from 'react';
import { getNoticias, UPLOADS_URL } from '../services/api';
import { 
  Newspaper, Zap, ArrowRight, Calendar, 
  FileX, RefreshCw, Search, Shield, Info 
} from 'lucide-react';
import Footer from '../components/Footer';

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="h-56 bg-slate-100" />
      <div className="p-8 space-y-4">
        <div className="h-4 bg-slate-50 w-24 rounded-full" />
        <div className="h-8 bg-slate-100 w-full rounded-xl" />
        <div className="h-4 bg-slate-50 w-full rounded" />
        <div className="h-10 bg-slate-50 w-32 rounded-xl mt-6" />
      </div>
    </div>
  );
}

/* ── Noticia card ── */
function NoticiaCard({ n, index }) {
  return (
    <article
      className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 overflow-hidden border border-white group hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 animate-fade-in-up flex flex-col"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Imagen */}
      <div className="h-60 overflow-hidden relative flex-shrink-0">
        <img
          src={
            n.imagen
              ? `${UPLOADS_URL}/${n.imagen}`
              : 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1000'
          }
          alt={n.titulo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1000";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Badge categoría */}
        <div className="absolute top-6 left-6">
          <span className="flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg shadow-red-900/30">
            <Zap size={9} />
            Institucional
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-8 md:p-10 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#003087] group-hover:bg-blue-50 transition-all">
             <Calendar size={14} />
          </div>
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
            {new Date(n.fecha).toLocaleDateString('es-PE', {
              day: '2-digit', month: 'long', year: 'numeric'
            })}
          </span>
        </div>

        {/* Título */}
        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 leading-tight group-hover:text-[#003087] transition-colors line-clamp-2 uppercase tracking-tight">
          {n.titulo}
        </h2>

        {/* Extracto */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-8 font-medium flex-1">
          {n.contenido}
        </p>

        {/* CTA */}
        <div className="pt-6 border-t border-slate-50">
          <button className="group/btn flex items-center gap-3 text-[#003087] text-[11px] font-black uppercase tracking-[0.15em] hover:text-red-600 transition-colors">
            Expandir Noticia
            <div className="w-8 h-8 bg-blue-50 group-hover/btn:bg-red-50 rounded-xl flex items-center justify-center transition-all">
                <ArrowRight
                  size={14}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
            </div>
          </button>
        </div>
      </div>
    </article>
  );
}

function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarNoticias();
  }, []);

  const cargarNoticias = () => {
    setCargando(true);
    getNoticias()
      .then(res => { setNoticias(res.data); setCargando(false); })
      .catch(() => setCargando(false));
  };

  const filtradas = noticias.filter(n => 
    n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.contenido.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Page Header ── */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-[#003087] to-[#001D52]">
        {/* Decoraciones de fondo */}
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
           <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="animate-badge-pop mb-6">
            <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-[2rem] flex items-center justify-center animate-float backdrop-blur-sm">
                <Newspaper size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 animate-fade-in-up">
            Actualidad Bandera
          </h1>
          <div className="w-24 h-1.5 bg-red-500 mx-auto mb-8 rounded-full shadow-lg shadow-red-900/40" />
          <p className="text-xl md:text-2xl text-blue-100 font-light italic max-w-2xl px-4 animate-fade-in-up delay-100 leading-relaxed">
            Mantente informado sobre los últimos acontecimientos, logros y novedades de nuestra institución.
          </p>
        </div>

        {/* Onda decorativa inferior */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
            </svg>
        </div>
      </section>

      {/* ── Grid noticias ── */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 pb-32 relative z-20">
        
        {/* Toolbar */}
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-blue-900/5 border border-white/60 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003087]">
                <Zap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
                {cargando ? 'Buscando artículos...' : `${filtradas.length} Publicaciones`}
              </h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Prensa Institucional</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Buscar noticias..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-[#003087] rounded-xl text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                />
            </div>
            <button
                onClick={cargarNoticias}
                disabled={cargando}
                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-gray-400 hover:text-[#003087] hover:border-blue-100 transition-all rounded-xl shadow-sm disabled:opacity-50"
            >
                <RefreshCw size={20} className={cargando ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Skeletons mientras carga */}
        {cargando && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Grid de noticias */}
        {!cargando && filtradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {filtradas.map((n, i) => (
              <NoticiaCard key={n.id} n={n} index={i} />
            ))}
          </div>
        )}

        {/* Estado vacío */}
        {!cargando && filtradas.length === 0 && (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl border border-slate-50 flex flex-col items-center animate-fade-in">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8">
              <FileX size={48} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tighter">Sin resultados</h3>
            <p className="text-gray-400 text-sm max-w-sm mb-8 font-medium">
              No hemos encontrado noticias que coincidan con tu búsqueda. Prueba con otros términos.
            </p>
            <button 
                onClick={() => setBusqueda('')} 
                className="text-[#003087] font-black text-[11px] uppercase tracking-widest hover:text-red-600 transition-colors underline underline-offset-4"
            >
                Ver todas las noticias
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default Noticias;