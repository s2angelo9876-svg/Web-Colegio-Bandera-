import { useEffect, useState } from 'react';
import { getComunicados } from '../services/api';
import {
  Bell, Calendar, Tag, FileX, RefreshCw,
  Zap, ChevronDown, ChevronUp, Search, Info, Shield, Filter
} from 'lucide-react';
import Footer from '../components/Footer';

const categoryColors = {
  general:    'bg-slate-100 text-slate-700',
  urgente:    'bg-red-100 text-red-700 border-red-200',
  académico:  'bg-blue-100 text-blue-700 border-blue-200',
  social:     'bg-emerald-100 text-emerald-700 border-emerald-200',
};

function ComunicadoCard({ c, index }) {
  const [expanded, setExpanded] = useState(false);
  const cat = (c.categoria || 'general').toLowerCase();
  const colorClass = categoryColors[cat] || categoryColors.general;
  const fecha = new Date(c.fecha);

  return (
    <div
      className="bg-white rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 overflow-hidden animate-fade-in-up mb-6 group"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="flex">
        {/* Franja lateral dinámica */}
        <div className={`w-2 ${cat === 'urgente' ? 'bg-red-600' : 'bg-[#003087]'} flex-shrink-0 rounded-l-[2.5rem] group-hover:w-3 transition-all duration-500`} />

        <div className="flex-1 p-8 md:p-10">
          {/* Header card */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Categoría badge */}
              <span className={`flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border ${colorClass}`}>
                <Tag size={10} />
                {c.categoria || 'General'}
              </span>
              {/* Fecha */}
              <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#003087] transition-colors">
                <Calendar size={13} />
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {!isNaN(fecha) ? fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Fecha por confirmar'}
                </span>
              </div>
            </div>

            {/* Icono decorativo de campana */}
            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-red-600 group-hover:bg-red-50 transition-all">
               <Bell size={18} />
            </div>
          </div>

          {/* Título */}
          <h3 className="text-xl md:text-2xl font-black text-[#003087] mb-4 leading-tight uppercase tracking-tight group-hover:text-red-600 transition-colors">
            {c.titulo}
          </h3>

          {/* Contenido (colapsable) */}
          <div className={`overflow-hidden transition-all duration-700 ease-in-out ${expanded ? 'max-h-[1000px] opacity-100' : 'max-h-16 opacity-70'}`}>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed whitespace-pre-line font-medium">
              {c.contenido}
            </p>
          </div>

          {/* Botón de expansión mejorado */}
          <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-50">
             <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-3 text-[#003087] text-[10px] font-black uppercase tracking-[0.2em] hover:text-red-600 transition-all group/btn"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={14} className="group-hover/btn:-translate-y-1 transition-transform" />
                    Contraer Información
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} className="group-hover/btn:translate-y-1 transition-transform" />
                    Leer comunicado completo
                  </>
                )}
              </button>

              {cat === 'urgente' && (
                 <div className="flex items-center gap-2 text-red-600 animate-pulse">
                    <Shield size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Prioridad Alta</span>
                 </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Comunicados() {
  const [comunicados, setComunicados] = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [busqueda, setBusqueda]       = useState('');
  const [categoria, setCategoria]     = useState('todos');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await getComunicados();
      setComunicados(res.data);
    } catch (e) {
      console.error('Error cargando comunicados', e);
    } finally {
      setCargando(false);
    }
  };

  const filtrados = comunicados.filter(c => {
    const matchesBusqueda = c.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
                          c.contenido.toLowerCase().includes(busqueda.toLowerCase());
    const matchesCategoria = categoria === 'todos' || c.categoria?.toLowerCase() === categoria.toLowerCase();
    return matchesBusqueda && matchesCategoria;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Page Header ── */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-[#003087] to-[#001D52]">
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
           <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="animate-badge-pop mb-6">
            <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-[2rem] flex items-center justify-center animate-float backdrop-blur-sm">
                <Bell size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 animate-fade-in-up">
            Comunicados
          </h1>
          <div className="w-24 h-1.5 bg-red-500 mx-auto mb-8 rounded-full shadow-lg" />
          <p className="text-xl md:text-2xl text-blue-100 font-light italic max-w-2xl px-4 animate-fade-in-up delay-100 leading-relaxed">
            Mantente al día con los avisos oficiales y circulares emitidas por la Dirección General.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
            </svg>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 -mt-10 pb-32 relative z-20">
        
        {/* Toolbar */}
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-blue-900/5 border border-white/60 backdrop-blur-sm flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003087]">
                <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
                {cargando ? 'Cargando avisos...' : `${filtrados.length} Comunicados`}
              </h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Información para Padres y Alumnos</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Filtrar por título..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-[#003087] rounded-xl text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
               <div className="relative flex-1 md:w-40">
                  <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-[#003087] rounded-xl text-sm font-bold text-gray-700 appearance-none outline-none shadow-inner cursor-pointer"
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
                  className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-gray-400 hover:text-[#003087] hover:border-blue-100 transition-all rounded-xl shadow-sm disabled:opacity-50"
                >
                  <RefreshCw size={20} className={cargando ? 'animate-spin' : ''} />
                </button>
            </div>
          </div>
        </div>

        {/* Skeletons */}
        {cargando && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 p-10 flex gap-6 animate-pulse">
                <div className="w-2 bg-slate-100 rounded-full h-32" />
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-slate-100 w-32 rounded-lg" />
                  <div className="h-10 bg-slate-100 w-3/4 rounded-xl" />
                  <div className="h-4 bg-slate-50 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista */}
        {!cargando && filtrados.length > 0 && (
          <div className="space-y-6">
            {filtrados.map((c, i) => (
              <ComunicadoCard key={c.id} c={c} index={i} />
            ))}
          </div>
        )}

        {/* Vacío */}
        {!cargando && filtrados.length === 0 && (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl border border-slate-50 flex flex-col items-center animate-fade-in">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8">
              <FileX size={48} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tighter">Sin comunicados</h3>
            <p className="text-gray-400 text-sm max-w-sm mb-8 font-medium">
              No hemos encontrado comunicados que coincidan con los filtros seleccionados en este momento.
            </p>
            <button 
                onClick={() => { setBusqueda(''); setCategoria('todos'); }} 
                className="text-[#003087] font-black text-[11px] uppercase tracking-widest hover:text-red-600 transition-colors underline underline-offset-4"
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