import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, BookOpen, Trophy, Heart,
  Calendar, Users, GraduationCap, TrendingUp,
  Newspaper, Bell, ChevronRight, Play, Star,
  MapPin, Phone, Shield, Zap, Globe, Award, Info,
  ChevronLeft, Monitor, Smartphone, Cpu
} from 'lucide-react';
import Footer from '../components/Footer';
import { API } from '../services/api';

function Inicio() {
  const [config, setConfig] = useState({
    hero_titulo_1: 'Bandera',
    hero_titulo_2: 'del Perú',
    hero_subtitulo: 'Forjando la excelencia con tradición y honor.',
    stats_anios: '65',
    stats_alumnos: '1200+',
    stats_docentes: '60+',
    stats_logros: '98%',
    pilar1_titulo: 'Liderazgo Académico',
    pilar1_desc: 'Metodologías de vanguardia que despiertan el potencial crítico y creativo de cada estudiante.',
    pilar2_titulo: 'Valores Sólidos',
    pilar2_desc: 'Disciplina, honor y respeto son los cimientos de nuestra formación ética e integral.',
    pilar3_titulo: 'Visión Global',
    pilar3_desc: 'Preparamos a nuestros alumnos para los retos de un mundo hiperconectado y tecnológico.',
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await API.get('/configuracion');
        const data = res.data;
        if (Object.keys(data).length > 0) {
          setConfig(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };
    fetchConfig();
  }, []);

  const stats = [
    { icon: Award,          value: config.stats_anios,    label: 'Años Formando' },
    { icon: Users,          value: config.stats_alumnos, label: 'Alumnos Activos' },
    { icon: GraduationCap,  value: config.stats_docentes,   label: 'Catedráticos' },
    { icon: Trophy,         value: config.stats_logros,   label: 'Tasa de Logro' },
  ];

  const pilares = [
    {
      icon: BookOpen,
      title: config.pilar1_titulo,
      desc: config.pilar1_desc,
      color: 'bg-blue-50',
      iconColor: 'text-primary',
      accent: 'border-primary',
      iconBg: 'bg-blue-100',
    },
    {
      icon: Shield,
      title: config.pilar2_titulo,
      desc: config.pilar2_desc,
      color: 'bg-red-50',
      iconColor: 'text-red-600',
      accent: 'border-red-600',
      iconBg: 'bg-red-100',
    },
    {
      icon: Globe,
      title: config.pilar3_titulo,
      desc: config.pilar3_desc,
      color: 'bg-blue-50',
      iconColor: 'text-primary',
      accent: 'border-primary',
      iconBg: 'bg-blue-100',
    },
  ];

  const quickLinks = [
    { icon: Newspaper,      label: 'Noticias',     path: '/noticias',    color: 'from-blue-600 to-blue-800' },
    { icon: Bell,           label: 'Comunicados',  path: '/comunicados', color: 'from-red-600 to-red-800' },
    { icon: GraduationCap,  label: 'Docentes',     path: '/docentes',    color: 'from-slate-700 to-slate-900' },
    { icon: Calendar,       label: 'Agenda',       path: '/eventos',     color: 'from-primary to-blue-900' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg font-sans selection:bg-red-500 selection:text-white overflow-hidden transition-colors duration-300">

      {/* ══════════════════════════════════════════
          ULTRA-PREMIUM STATIC HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-primary-dark">
        {/* Cinematic Background Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1523050335392-9af560c12e74?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover scale-105 animate-slow-zoom opacity-40"
            alt="Fondo Institucional"
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] animate-float pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Main Copy */}
          <div className="text-left animate-in fade-in slide-in-from-left duration-1000">
            <div className="flex items-center gap-3 mb-10">
              <span className="flex items-center gap-2 bg-red-600 text-white text-[10px] font-black px-6 py-3 rounded-full uppercase tracking-[0.3em] shadow-2xl shadow-red-900/40 animate-badge-pop">
                <Zap size={12} className="animate-pulse" />
                Admisión 2026 Abierta
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black px-5 py-3 rounded-full uppercase tracking-widest animate-badge-pop delay-200">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                I.E. Emblemática
              </span>
            </div>

            <h1 className="text-7xl md:text-8xl xl:text-9xl font-black text-white mb-10 leading-[0.8] tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {config.hero_titulo_1}<br />
              <span className="text-red-500 italic relative">
                {config.hero_titulo_2}
                <span className="absolute -bottom-4 left-0 w-full h-2 bg-white/10 rounded-full blur-sm" />
              </span>
            </h1>

            <div className="flex items-center gap-6 mb-12 border-l-4 border-red-600 pl-8">
               <p className="text-xl md:text-3xl text-blue-100/90 font-light italic leading-relaxed">
                 {config.hero_subtitulo}
               </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <Link
                to="/admision"
                className="group flex items-center gap-4 bg-red-600 hover:bg-white hover:text-primary text-white font-black px-12 py-6 rounded-2xl transition-all duration-500 shadow-2xl shadow-red-900/40 active:scale-95 uppercase tracking-widest text-xs"
              >
                Postula Ahora
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                to="/institucion"
                className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-black px-12 py-6 rounded-2xl transition-all backdrop-blur-xl active:scale-95 uppercase tracking-widest text-xs"
              >
                <Play size={20} fill="currentColor" />
                Ver Recorrido
              </Link>
            </div>
          </div>

          {/* Interactive Feature Card */}
          <div className="hidden lg:block animate-in fade-in slide-in-from-right duration-1000 delay-500">
            <div className="relative group">
               <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-primary rounded-[4rem] blur-2xl opacity-10 group-hover:opacity-30 transition duration-1000" />
               <div className="relative bg-primary-dark/60 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
                  
                  <div className="flex items-center gap-6 mb-12">
                     <div className="w-16 h-1 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center shadow-xl shadow-red-900/40">
                        <Award size={32} className="text-white" />
                     </div>
                     <div>
                        <h3 className="text-white font-black text-2xl tracking-tight">{config.stats_anios} Años</h3>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Liderazgo y Prestigio</p>
                     </div>
                  </div>

                  <p className="text-blue-100/90 text-xl leading-relaxed font-light italic mb-12 text-pretty">
                    "{config.hero_subtitulo}"
                  </p>

                  <div className="space-y-4 mb-12">
                     <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                        <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Alumnos Destacados</span>
                        <span className="text-white font-bold">{config.stats_alumnos}</span>
                     </div>
                     <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                        <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Tasa de Logro</span>
                        <span className="text-white font-bold">{config.stats_logros}</span>
                     </div>
                  </div>

                  <Link
                    to="/docentes"
                    className="flex items-center justify-center gap-4 w-full bg-white text-primary-dark font-black py-6 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-500 text-xs uppercase tracking-widest shadow-xl active:scale-95"
                  >
                    Conoce a la Plana Docente
                    <ChevronRight size={20} />
                  </Link>
               </div>
            </div>
          </div>
        </div>

        {/* Scroll Micro-interaction */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
           <div className="w-[2px] h-16 bg-gradient-to-t from-white/40 to-transparent rounded-full overflow-hidden">
              <div className="w-full h-1/2 bg-red-600 animate-scroll-indicator" />
           </div>
        </div>

        {/* Bottom Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-10">
            <svg className="relative block w-full h-[80px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
            </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          QUICK ACCESS GRID
      ══════════════════════════════════════════ */}
      <section className="relative z-40 px-6 pt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map(({ icon: Icon, label, path, color }, i) => (
              <Link
                key={label}
                to={path}
                className={`group relative overflow-hidden bg-gradient-to-br ${color} text-white rounded-[2.5rem] p-10 flex flex-col items-center gap-6 shadow-2xl hover:shadow-blue-900/30 hover:-translate-y-4 transition-all duration-700 animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-1000">
                   <Icon size={100} />
                </div>
                <div className="relative z-10 w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center group-hover:bg-white group-hover:text-primary transition-all duration-500 shadow-inner border border-white/10">
                  <Icon size={32} strokeWidth={2.5} />
                </div>
                <span className="relative z-10 font-black text-sm uppercase tracking-[0.3em] text-center">{label}</span>
                <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-8 h-1 bg-white rounded-full animate-pulse" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PILARES INSTITUCIONALES
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-white dark:bg-dark-bg relative overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block animate-in fade-in slide-in-from-bottom duration-700">Valores que nos definen</span>
            <h2 className="text-5xl md:text-7xl font-black text-primary-dark tracking-tighter mb-8 leading-none uppercase">
              Excelencia en cada <span className="text-red-600 italic">detalle</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {pilares.map((p, i) => (
              <div
                key={p.title}
                className="group p-12 rounded-[3.5rem] bg-slate-50 dark:bg-dark-card hover:bg-white dark:hover:bg-dark-hover border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-all duration-700 shadow-sm hover:shadow-2xl relative overflow-hidden"
              >
                <div className={`w-24 h-24 ${p.iconBg} ${p.iconColor} rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
                  <p.icon size={40} />
                </div>
                <h3 className="text-3xl font-black text-primary-dark mb-6 tracking-tight">{p.title}</h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium mb-8">{p.desc}</p>
                <div className={`w-12 h-1 bg-red-600 transition-all duration-500 group-hover:w-full`} />
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
            {stats.map((s, i) => (
              <div key={s.label} className="text-center group">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center text-red-500 mb-8 border border-white/10 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
                  <s.icon size={32} />
                </div>
                <div className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">{s.value}</div>
                <div className="text-blue-300/60 font-black text-[10px] uppercase tracking-[0.3em]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CALL TO ACTION FINAL
      ══════════════════════════════════════════ */}
      <section className="py-40 px-6 relative overflow-hidden bg-white dark:bg-dark-bg transition-colors duration-300">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-red-50 text-red-600 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-sm border border-red-100">
             <Zap size={14} className="animate-pulse" />
             Tu futuro comienza aquí
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-primary-dark mb-12 tracking-tighter leading-none uppercase">
            Únete a la <span className="text-red-600">élite</span> educativa
          </h2>
          <p className="text-xl md:text-2xl text-slate-500 font-medium mb-16 max-w-2xl mx-auto leading-relaxed">
            Forma parte de la institución líder en Pisco. Vacantes limitadas para el periodo académico 2026.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/admision" className="group bg-red-600 hover:bg-primary-dark text-white font-black px-12 py-7 rounded-[2rem] transition-all duration-500 shadow-2xl shadow-red-900/40 active:scale-95 uppercase tracking-widest text-xs flex items-center gap-4">
              Iniciar Proceso de Admisión
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Inicio;