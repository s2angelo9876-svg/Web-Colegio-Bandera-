import React, { useEffect, useState } from 'react';
import { API, UPLOADS_URL } from '../services/api';
import {
  GraduationCap, BookOpen, Award, Star, Users,
  UserX, RefreshCw, Zap, ArrowRight, Shield, Search
} from 'lucide-react';
import Footer from '../components/Footer';

/* ── Skeleton card ── */
function SkeletonDocente() {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="bg-slate-100 aspect-[3/4]" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-slate-100 w-3/4 rounded-lg mx-auto" />
        <div className="h-3 bg-slate-50 w-1/2 rounded-full mx-auto" />
        <div className="h-10 bg-slate-50 w-full rounded-xl mx-auto" />
      </div>
    </div>
  );
}

/* ── Card docente ── */
function DocenteCard({ doc, index }) {
  const cargoColor =
    doc.cargo?.toLowerCase().includes('director') ? 'bg-red-600 shadow-red-900/40' :
    doc.cargo?.toLowerCase().includes('coordinad') ? 'bg-blue-700 shadow-blue-900/40' :
    'bg-[#003087] shadow-blue-900/40';

  return (
    <div
      className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-[0_20px_60px_rgba(0,48,135,0.12)] transition-all duration-500 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Imagen con overlay en hover */}
      <div className="aspect-[3/4] overflow-hidden bg-slate-50 relative">
        <img
          src={doc.imagen_url?.startsWith('http') ? doc.imagen_url : `${UPLOADS_URL}/${doc.imagen_url}`}
          alt={doc.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
              e.target.src = "https://placehold.co/600x800/f8fafc/64748b?text=Docente";
          }}
        />

        {/* Overlay de hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#001D52]/90 via-[#003087]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Info en overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
          <div className="flex items-center gap-2">
            <BookOpen size={13} className="text-blue-300 flex-shrink-0" />
            <span className="text-white text-[10px] font-black uppercase tracking-widest leading-tight">
              {doc.especialidad || 'Especialista'}
            </span>
          </div>
        </div>

        {/* Badge cargo */}
        <div className="absolute top-4 left-4">
          <span className={`${cargoColor} text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-lg flex items-center gap-1.5`}>
            <Award size={10} />
            {doc.cargo?.split(' ')[0] || 'Docente'}
          </span>
        </div>
      </div>

      {/* Info inferior */}
      <div className="p-6 text-center relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        <h3 className="text-[#003087] font-black text-base leading-tight uppercase tracking-tight mb-1 group-hover:text-red-600 transition-colors">
          {doc.nombre}
        </h3>
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">
          {doc.cargo}
        </p>
        
        <div className="bg-slate-50 rounded-xl py-2 px-4 inline-flex items-center gap-2 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          <p className="text-[10px] font-black uppercase tracking-tighter text-gray-500">{doc.especialidad || 'Institucional'}</p>
        </div>
      </div>
    </div>
  );
}

const Docentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = () => {
    setCargando(true);
    setError(false);
    API.get('/docentes')
      .then(res => { setDocentes(res.data); setCargando(false); })
      .catch(() => { setCargando(false); setError(true); });
  };

  const filtrados = docentes.filter(d => 
    d.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    d.cargo.toLowerCase().includes(busqueda.toLowerCase())
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
                <GraduationCap size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 animate-fade-in-up">
            Plana Docente
          </h1>
          <div className="w-24 h-1.5 bg-red-500 mx-auto mb-8 rounded-full shadow-lg shadow-red-900/40" />
          <p className="text-xl md:text-2xl text-blue-100 font-light italic max-w-2xl px-4 animate-fade-in-up delay-100 leading-relaxed">
            Profesionales comprometidos con la excelencia educativa y la formación integral de nuestros alumnos.
          </p>
        </div>

        {/* Onda decorativa inferior */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
            </svg>
        </div>
      </section>

      {/* ── Grid docentes ── */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 pb-32 relative z-20">
        
        {/* Toolbar */}
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-blue-900/5 border border-white/60 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003087]">
                <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
                {cargando ? 'Cargando docentes...' : `${filtrados.length} Miembros Activos`}
              </h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Personal académico calificado</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Buscar docente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-[#003087] rounded-xl text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                />
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

        {/* Skeletons */}
        {cargando && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
            {[...Array(10)].map((_, i) => <SkeletonDocente key={i} />)}
          </div>
        )}

        {/* Grid real */}
        {!cargando && !error && filtrados.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
            {filtrados.map((doc, i) => (
              <DocenteCard key={doc.id} doc={doc} index={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!cargando && error && (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl border border-red-50 flex flex-col items-center animate-fade-in">
            <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mb-8">
              <UserX size={48} className="text-red-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tighter">Error de conexión</h3>
            <p className="text-gray-400 text-sm max-w-sm mb-10 font-medium leading-relaxed">
              No se pudo establecer conexión con el servidor institucional. Por favor, verifica tu conexión a internet o intenta más tarde.
            </p>
            <button
              onClick={cargar}
              className="flex items-center gap-3 bg-[#003087] text-white font-black px-10 py-5 rounded-2xl hover:bg-red-600 transition-all shadow-xl shadow-blue-900/20 active:scale-95 uppercase tracking-widest text-[11px]"
            >
              <RefreshCw size={16} />
              Reintentar Conexión
            </button>
          </div>
        )}

        {/* Vacío */}
        {!cargando && !error && filtrados.length === 0 && (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl border border-slate-50 flex flex-col items-center animate-fade-in">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8">
              <Search size={48} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tighter">Sin coincidencias</h3>
            <p className="text-gray-400 text-sm max-w-sm mb-8 font-medium">
              No hemos encontrado ningún docente que coincida con tu búsqueda. Prueba con otros términos.
            </p>
            <button 
                onClick={() => setBusqueda('')} 
                className="text-[#003087] font-black text-[11px] uppercase tracking-widest hover:text-red-600 transition-colors underline underline-offset-4"
            >
                Limpiar filtros
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Docentes;