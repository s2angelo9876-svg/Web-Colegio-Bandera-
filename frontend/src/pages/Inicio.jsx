import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Sparkles, BookOpen, Trophy, Calendar, Users, GraduationCap,
  Newspaper, Bell, Play, Star, MapPin, Phone, Shield, Zap, Globe, Award,
  Info, X, ChevronRight, ClipboardList, BookMarked, ExternalLink
} from 'lucide-react';
import Footer from '../components/Footer';
import { API, UPLOADS_URL } from '../services/api';
import { sanitizeText } from '../utils/sanitize';

function Inicio() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    hero_titulo_1: 'Bandera',
    hero_titulo_2: 'del Perú',
    hero_subtitulo: 'Honor, Lealtad, Trabajo. Forjando la excelencia con tradición y prestigio.',
    stats_anios: '65',
    stats_alumnos: '1200+',
    stats_docentes: '60+',
    stats_logros: '98%',
  });

  const [noticias, setNoticias] = useState([]);
  const [comunicados, setComunicados] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [latestNoticia, setLatestNoticia] = useState(null);
  const [latestComunicado, setLatestComunicado] = useState(null);

  // Modal para video interactivo
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await API.get('/configuracion');
        if (res.data && Object.keys(res.data).length > 0) {
          setConfig(prev => ({ ...prev, ...res.data }));
        }
      } catch { /* ignore error */ }
    };

    const fetchData = async () => {
      try {
        const [resNoticias, resComunicados] = await Promise.all([
          API.get('/noticias'),
          API.get('/comunicados')
        ]);

        const listNoticias = resNoticias.data || [];
        const listComunicados = resComunicados.data || [];

        setNoticias(listNoticias);
        setComunicados(listComunicados);

        if (listNoticias.length > 0) {
          setLatestNoticia(listNoticias[0]);
        }
        if (listComunicados.length > 0) {
          setLatestComunicado(listComunicados[0]);
        }

        const combinados = [
          ...listNoticias.map(n => ({ ...n, tipoItem: 'noticia', fechaOrden: n.fecha || n.created_at })),
          ...listComunicados.map(c => ({ ...c, tipoItem: 'comunicado', fechaOrden: c.fecha || c.created_at }))
        ];

        combinados.sort((a, b) => new Date(b.fechaOrden) - new Date(a.fechaOrden));
        setRecentItems(combinados.slice(0, 3));

      } catch { /* ignore error */ }
    };

    fetchConfig();
    fetchData();
  }, []);

  const stats = [
    { icon: Award,          value: config.stats_anios,    label: 'Años de Prestigio' },
    { icon: Users,          value: config.stats_alumnos, label: 'Alumnos Activos' },
    { icon: GraduationCap,  value: config.stats_docentes,   label: 'Plana Docente' },
    { icon: Trophy,         value: config.stats_logros,   label: 'Tasa de Éxito' },
  ];

  const pilares = [
    {
      icon: BookOpen,
      title: 'Liderazgo Académico',
      desc: 'Metodologías pedagógicas de vanguardia que estimulan el pensamiento crítico y el alto rendimiento.',
      iconColor: 'text-primary',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      line: 'bg-primary'
    },
    {
      icon: Shield,
      title: 'Valores Históricos',
      desc: 'Disciplina, honor y respeto mutuo son los pilares éticos e identitarios de nuestros estudiantes.',
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50 dark:bg-red-950/40',
      line: 'bg-red-600'
    },
    {
      icon: Globe,
      title: 'Habilidades Digitales',
      desc: 'Impulsamos el dominio tecnológico en aulas de innovación para resolver problemas del mundo real.',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      line: 'bg-blue-500'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg font-sans selection:bg-red-500 selection:text-white overflow-hidden transition-colors duration-300">

      {/* ══════════════════════════════════════════
          CINEMATIC HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden bg-primary-dark">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1523050335392-9af560c12e74?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover scale-105 opacity-20 dark:opacity-10"
            alt="I.E. Bandera del Perú"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/95 to-transparent" />
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center w-full">
          
          {/* Left Block: Text & CTAs */}
          <div className="lg:col-span-7 text-left space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 bg-red-600 text-white text-[9px] font-black px-5 py-2.5 rounded-full uppercase tracking-[0.25em] shadow-xl shadow-red-900/30">
                <Zap size={11} className="animate-pulse text-white" />
                Mesa de Partes Virtual
              </span>
              <span className="flex items-center gap-2 bg-white/10 border border-white/20 text-white text-[9px] font-black px-4 py-2.5 rounded-full uppercase tracking-widest">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                Colegio Emblemático
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl xl:text-8xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-lg">
              {config.hero_titulo_1}<br />
              <span className="text-red-500 italic relative">
                {config.hero_titulo_2}
                <span className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-full blur-xs" />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100/90 font-light italic max-w-2xl border-l-4 border-red-600 pl-6 leading-relaxed">
              {config.hero_subtitulo}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/mesa-partes"
                className="group flex items-center gap-3 bg-red-600 hover:bg-white hover:text-primary text-white font-black px-8 py-5 rounded-2xl transition-all duration-500 shadow-2xl shadow-red-900/40 active:scale-95 uppercase tracking-widest text-[11px]"
              >
                Mesa de Partes
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <button
                onClick={() => setVideoOpen(true)}
                className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-black px-8 py-5 rounded-2xl transition-all backdrop-blur-md active:scale-95 uppercase tracking-widest text-[11px]"
              >
                <Play size={16} fill="currentColor" className="text-red-500 animate-pulse" />
                Conoce más
              </button>
            </div>
          </div>

          {/* Right Block: Gorgeous Visual School Flyer */}
          <div className="lg:col-span-5 hidden lg:block animate-in fade-in slide-in-from-right duration-1000 delay-300">
            <div className="relative group">
              {/* Blur Backing */}
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-primary rounded-[3.5rem] blur-2xl opacity-10 group-hover:opacity-25 transition-all duration-700" />
              
              {/* Main Collage Frame */}
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[3.5rem] shadow-2xl overflow-hidden grid grid-cols-2 gap-4">
                
                {/* Collage Image 1 */}
                <div className="rounded-3xl overflow-hidden aspect-[4/5] relative shadow-lg transform group-hover:-rotate-1 transition-all duration-700">
                  <img 
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="Clases" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-4 left-4 text-[9px] font-black uppercase tracking-widest text-white bg-red-600 px-3 py-1.5 rounded-lg">Estudio</span>
                </div>

                {/* Collage Image 2 */}
                <div className="rounded-3xl overflow-hidden aspect-[4/5] relative shadow-lg transform translate-y-6 group-hover:rotate-1 transition-all duration-700">
                  <img 
                    src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&q=80&w=600" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="Docentes" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-4 left-4 text-[9px] font-black uppercase tracking-widest text-white bg-blue-600 px-3 py-1.5 rounded-lg">Disciplina</span>
                </div>

                {/* Collage Image 3 */}
                <div className="rounded-3xl overflow-hidden aspect-[4/5] relative shadow-lg transform -translate-y-4 group-hover:rotate-2 transition-all duration-700">
                  <img 
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="Aula Tecnológica" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-4 left-4 text-[9px] font-black uppercase tracking-widest text-white bg-slate-900 px-3 py-1.5 rounded-lg">Superación</span>
                </div>

                {/* Collage Image 4 (Stat overlay card) */}
                <div className="rounded-3xl bg-gradient-to-br from-red-600 to-red-800 p-6 flex flex-col justify-between text-white transform translate-y-2 group-hover:-translate-y-1 transition-all duration-700 shadow-xl">
                  <Star size={24} className="text-amber-400 fill-amber-400" />
                  <div>
                    <h4 className="text-3xl font-black tracking-tight">{config.stats_anios} Años</h4>
                    <p className="text-red-200 text-[8px] font-black uppercase tracking-widest mt-1">Liderando la Educación en Pisco</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Waves bottom divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-10">
            <svg className="relative block w-full h-[80px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50 dark:fill-dark-bg"></path>
            </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DYNAMIC QUICK ACCESS GRID WITH HOVER PREVIEWS
      ══════════════════════════════════════════ */}
      <section className="relative z-40 px-6 -mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* BUTTON 1: NOTICIAS (WITH HOVER PREVIEW) */}
            <div className="relative group">
              <Link
                to="/noticias"
                className="flex flex-col items-center gap-5 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-[2.5rem] p-8 shadow-xl hover:-translate-y-2 transition-all duration-500 relative z-20 overflow-hidden"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-primary transition-all duration-500">
                  <Newspaper size={26} />
                </div>
                <span className="font-black text-xs uppercase tracking-[0.25em]">Últimas Noticias</span>
              </Link>
              
              {/* Premium Hover Card Preview */}
              {latestNoticia && (
                <div className="absolute left-0 right-0 top-full mt-3 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-5 rounded-3xl shadow-2xl opacity-0 scale-95 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-500 z-[100] max-w-sm mx-auto flex gap-4 items-center">
                  {latestNoticia.imagen && (
                    <img 
                      src={`${UPLOADS_URL}/${latestNoticia.imagen}`} 
                      className="w-16 h-16 object-cover rounded-xl shadow-inner flex-shrink-0"
                      alt={latestNoticia.titulo}
                    />
                  )}
                  <div>
                    <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest block">Lo Último</span>
                    <h4 className="font-black text-xs text-gray-800 dark:text-white line-clamp-2 mt-0.5 uppercase">{latestNoticia.titulo}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 truncate">{sanitizeText(latestNoticia.contenido)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTON 2: COMUNICADOS (WITH HOVER PREVIEW) */}
            <div className="relative group">
              <Link
                to="/comunicados"
                className="flex flex-col items-center gap-5 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-[2.5rem] p-8 shadow-xl hover:-translate-y-2 transition-all duration-500 relative z-20 overflow-hidden"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-red-600 transition-all duration-500">
                  <Bell size={26} />
                </div>
                <span className="font-black text-xs uppercase tracking-[0.25em]">Comunicados</span>
              </Link>

              {/* Premium Hover Card Preview */}
              {latestComunicado && (
                <div className="absolute left-0 right-0 top-full mt-3 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-5 rounded-3xl shadow-2xl opacity-0 scale-95 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-500 z-[100] max-w-sm mx-auto flex gap-4 items-center">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell size={20} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-red-500 tracking-widest block">Último Comunicado</span>
                    <h4 className="font-black text-xs text-gray-800 dark:text-white line-clamp-2 mt-0.5 uppercase">{latestComunicado.titulo}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 truncate">{latestComunicado.descripcion}</p>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTON 3: MESA DE PARTES */}
            <Link
              to="/mesa-partes"
              className="group flex flex-col items-center gap-5 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl hover:-translate-y-2 transition-all duration-500 relative z-20 overflow-hidden"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-slate-800 transition-all duration-500">
                <ClipboardList size={26} />
              </div>
              <span className="font-black text-xs uppercase tracking-[0.25em]">Mesa de Partes</span>
            </Link>

            {/* BUTTON 4: DOCUMENTOS INSTITUCIONALES */}
            <Link
              to="/documentos-institucionales"
              className="group flex flex-col items-center gap-5 bg-gradient-to-br from-primary to-blue-900 text-white rounded-[2.5rem] p-8 shadow-xl hover:-translate-y-2 transition-all duration-500 relative z-20 overflow-hidden"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-primary transition-all duration-500">
                <BookMarked size={26} />
              </div>
              <span className="font-black text-xs uppercase tracking-[0.25em]">Documentos Inst.</span>
            </Link>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ULTIMAS NOTICIAS Y COMUNICADOS (DYNAMIC SECTION)
      ══════════════════════════════════════════ */}
      <section className="py-40 px-6 bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20">
            <div>
              <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Actualidad & Novedades</span>
              <h2 className="text-5xl md:text-6xl font-black text-primary-dark dark:text-white tracking-tighter leading-none uppercase">
                Últimos <span className="text-red-600 italic">Acontecimientos</span>
              </h2>
            </div>
            <Link 
              to="/noticias" 
              className="group inline-flex items-center gap-2 text-primary dark:text-blue-400 font-black text-xs uppercase tracking-widest hover:text-red-600 transition-colors"
            >
              Ver todas las noticias
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentItems.length > 0 ? recentItems.map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => navigate(item.tipoItem === 'noticia' ? '/noticias' : '/comunicados')}
                className="group bg-white dark:bg-dark-card rounded-[2.5rem] border border-white dark:border-dark-border shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between cursor-pointer h-full"
              >
                <div>
                  {/* Photo area */}
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                    {item.imagen ? (
                      <img 
                        src={`${UPLOADS_URL}/${item.imagen}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={item.titulo} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-950/20 text-primary dark:text-blue-400 font-black text-[10px] uppercase tracking-widest">
                        Bandera del Perú
                      </div>
                    )}
                    <span className={`absolute top-4 left-4 text-[8px] font-black uppercase tracking-widest text-white px-3 py-1.5 rounded-lg ${item.tipoItem === 'noticia' ? 'bg-blue-600' : 'bg-red-600'}`}>
                      {item.tipoItem}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-8">
                    <span className="text-[9px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                      {new Date(item.fechaOrden).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mt-3 mb-4 uppercase line-clamp-2 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                      {item.titulo}
                    </h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                      {item.tipoItem === 'noticia'
                        ? sanitizeText(item.contenido)
                        : sanitizeText(item.descripcion)
                      }
                    </p>
                  </div>
                </div>

                <div className="p-8 pt-0 flex justify-end">
                  <span className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-dark-input text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center shadow-inner">
                    <ChevronRight size={18} />
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-20 bg-white dark:bg-dark-card rounded-[3rem] border border-dashed border-gray-200 dark:border-dark-border">
                <Newspaper size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4 animate-bounce" />
                <h3 className="font-black text-lg text-gray-800 dark:text-white uppercase tracking-tight">Sin publicaciones</h3>
                <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">No se encontraron noticias ni comunicados recientes en la base de datos.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          PILARES INSTITUCIONALES
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-white dark:bg-dark-bg border-t border-slate-100 dark:border-dark-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Valores que nos definen</span>
            <h2 className="text-5xl md:text-7xl font-black text-primary-dark dark:text-white tracking-tighter mb-8 leading-none uppercase">
              Excelencia en cada <span className="text-red-600 italic">pilar</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {pilares.map((p) => (
              <div
                key={p.title}
                className="group p-12 rounded-[3.5rem] bg-slate-50 dark:bg-dark-card hover:bg-white dark:hover:bg-dark-hover border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-all duration-750 shadow-sm hover:shadow-2xl relative overflow-hidden"
              >
                <div className={`w-20 h-20 ${p.iconBg} ${p.iconColor} rounded-[1.75rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-blue-900/5`}>
                  <p.icon size={36} />
                </div>
                <h3 className="text-2xl font-black text-primary-dark dark:text-white mb-6 tracking-tight uppercase">{p.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-semibold mb-8">{p.desc}</p>
                <div className={`w-12 h-1 ${p.line} transition-all duration-500 group-hover:w-full rounded-full`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ESTADÍSTICAS IMPACTANTES
      ══════════════════════════════════════════ */}
      <section className="py-32 bg-primary-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center group">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center text-red-500 mb-8 border border-white/10 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-md">
                  <s.icon size={28} />
                </div>
                <div className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">{s.value}</div>
                <div className="text-blue-300/60 font-black text-[10px] uppercase tracking-[0.3em]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          VIDEO MODAL BACKDROP (CONOCE MAS)
      ══════════════════════════════════════════ */}
      {videoOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-scale-up">
            
            {/* Close button */}
            <button 
              onClick={() => setVideoOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 bg-black/50 border border-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all z-50 active:scale-95"
            >
              <X size={20} />
            </button>

            {/* Embedded institution presentation video */}
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/A3d2D_R8k20?autoplay=1" 
              title="Video Institucional I.E. Emblemática Bandera del Perú" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Inicio;