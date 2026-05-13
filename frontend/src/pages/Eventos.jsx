import { useEffect, useState } from 'react';
import { getEventos } from '../services/api';
import {
  CalendarDays, MapPin, Clock, Zap,
  CalendarX, RefreshCw, Tag, Search, ArrowRight, Shield
} from 'lucide-react';
import Footer from '../components/Footer';

function SkeletonEvento() {
  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden flex flex-col md:flex-row animate-pulse shadow-sm">
      <div className="bg-slate-100 md:w-48 h-48 md:h-auto" />
      <div className="p-8 flex-1 space-y-4">
        <div className="h-4 bg-slate-100 w-24 rounded-full" />
        <div className="h-8 bg-slate-100 w-3/4 rounded-xl" />
        <div className="h-4 bg-slate-50 w-full rounded" />
        <div className="h-4 bg-slate-50 w-5/6 rounded" />
        <div className="flex gap-4 pt-4">
          <div className="h-4 bg-slate-100 w-24 rounded" />
          <div className="h-4 bg-slate-100 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}

function EventoCard({ e, index }) {
  const fechaObj = e.fecha_evento ? new Date(e.fecha_evento) : null;
  const dia = fechaObj && !isNaN(fechaObj) ? fechaObj.getDate() : '--';
  const mes = fechaObj && !isNaN(fechaObj)
    ? fechaObj.toLocaleDateString('es-PE', { month: 'short' }).toUpperCase().replace('.', '')
    : 'S/F';
  const anio = fechaObj && !isNaN(fechaObj) ? fechaObj.getFullYear() : '';

  return (
    <div
      className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 flex flex-col md:flex-row overflow-hidden border border-white group animate-fade-in-up mb-8"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Bloque de fecha */}
      <div className="relative bg-[#003087] text-white flex flex-col items-center justify-center px-10 py-10 md:w-48 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out" />
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span className="text-6xl font-black leading-none drop-shadow-lg">{dia}</span>
          <span className="text-sm font-black tracking-[0.3em] uppercase opacity-90">{mes}</span>
          {anio && <span className="text-[10px] opacity-70 font-black mt-1 bg-white/20 px-2 py-0.5 rounded-full">{anio}</span>}
        </div>
      </div>

      {/* Info */}
      <div className="p-8 md:p-12 flex flex-col justify-center flex-grow relative">
        <div className="absolute top-8 right-8 text-slate-50 group-hover:text-blue-50 transition-colors pointer-events-none">
           <CalendarDays size={64} strokeWidth={1} />
        </div>

        <div className="flex items-center gap-3 mb-4 relative z-10">
          <span className="flex items-center gap-1.5 bg-blue-50 text-[#003087] text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-blue-100">
            <Tag size={10} className="text-red-500" />
            Actividad Escolar
          </span>
        </div>

        <h2 className="text-2xl font-black text-gray-900 group-hover:text-[#003087] transition-colors leading-tight uppercase tracking-tight mb-4 relative z-10">
          {e.titulo}
        </h2>

        <p className="text-gray-500 text-lg leading-relaxed font-medium line-clamp-2 mb-8 relative z-10">
          {e.descripcion || 'Participa en esta importante actividad de nuestra comunidad educativa.'}
        </p>

        <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-8 relative z-10">
          {e.lugar && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center shadow-sm">
                <MapPin size={16} className="text-red-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ubicación</span>
                <span className="text-gray-800 text-sm font-bold uppercase">{e.lugar}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm">
              <Clock size={16} className="text-[#003087]" />
            </div>
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Horario</span>
                <span className="text-gray-600 text-sm font-bold uppercase">{e.hora || 'Por confirmar'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Eventos() {
  const [eventos, setEventos]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = () => {
    setCargando(true);
    getEventos()
      .then(res => { setEventos(res.data); setCargando(false); })
      .catch(() => setCargando(false));
  };

  const filtrados = eventos.filter(e => 
    e.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.descripcion && e.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Page Header ── */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-red-700 to-red-900">
        {/* Decoraciones de fondo */}
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
           <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="animate-badge-pop mb-6">
            <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-[2rem] flex items-center justify-center animate-float backdrop-blur-sm">
                <CalendarDays size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 animate-fade-in-up">
            Calendario Escolar
          </h1>
          <div className="w-24 h-1.5 bg-white mx-auto mb-8 rounded-full shadow-lg opacity-30" />
          <p className="text-xl md:text-2xl text-red-100 font-light italic max-w-2xl px-4 animate-fade-in-up delay-100 leading-relaxed">
            Acompaña a nuestra comunidad en las actividades y fechas más importantes del año académico.
          </p>
        </div>

        {/* Onda decorativa inferior */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
            </svg>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 -mt-10 pb-32 relative z-20">
        
        {/* Toolbar */}
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-blue-900/5 border border-white/60 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                <Zap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
                {cargando ? 'Buscando eventos...' : `${filtrados.length} Actividades`}
              </h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Cronograma Institucional 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Buscar evento..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-red-600 rounded-xl text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                />
            </div>
            <button
                onClick={cargar}
                disabled={cargando}
                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-gray-400 hover:text-red-600 hover:border-red-100 transition-all rounded-xl shadow-sm disabled:opacity-50"
            >
                <RefreshCw size={20} className={cargando ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Skeletons */}
        {cargando && (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => <SkeletonEvento key={i} />)}
          </div>
        )}

        {/* Lista eventos */}
        {!cargando && filtrados.length > 0 && (
          <div className="space-y-8">
            {filtrados.map((e, i) => <EventoCard key={e.id} e={e} index={i} />)}
          </div>
        )}

        {/* Vacío */}
        {!cargando && filtrados.length === 0 && (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl border border-slate-50 flex flex-col items-center animate-fade-in">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8">
              <CalendarX size={48} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tighter">Sin eventos</h3>
            <p className="text-gray-400 text-sm max-w-sm mb-8 font-medium">
              No hemos encontrado actividades programadas con esos términos o para este periodo.
            </p>
            <button 
                onClick={() => setBusqueda('')} 
                className="text-[#003087] font-black text-[11px] uppercase tracking-widest hover:text-red-600 transition-colors underline underline-offset-4"
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