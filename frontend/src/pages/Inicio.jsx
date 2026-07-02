import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  ArrowRight, Calendar, BookOpen, Trophy, Users, GraduationCap,
  Newspaper, Bell, Shield, Zap, Globe, Award, ChevronRight,
  ClipboardList, BookMarked, Send, Play, X, School, CheckCircle2
} from 'lucide-react';
import Footer from '../components/Footer';
import { API, UPLOADS_URL } from '../services/api';
import { sanitizeText } from '../utils/sanitize';

function Inicio() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    hero_titulo_1: 'Formando',
    hero_titulo_2: 'líderes del mañana',
    hero_subtitulo: 'Comprometidos con el desarrollo integral de nuestros estudiantes a través de una propuesta pedagógica innovadora, valores éticos sólidos y un ambiente de aprendizaje moderno y seguro.',
    stats_anios: '65',
    stats_alumnos: '1200+',
    stats_docentes: '60+',
    stats_logros: '98%',
  });

  const [noticias, setNoticias] = useState([]);
  const [comunicados, setComunicados] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
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
    { value: config.stats_anios, label: 'Años de Tradición' },
    { value: config.stats_alumnos, label: 'Alumnos Activos' },
    { value: config.stats_docentes, label: 'Plana Docente' },
    { value: config.stats_logros, label: 'Compromiso Académico' },
  ];

  const pilares = [
    {
      icon: BookOpen,
      title: 'Liderazgo Académico',
      desc: 'Metodologías pedagógicas de vanguardia que estimulan el pensamiento crítico y el alto rendimiento.',
      color: 'bg-blue-50 text-primary'
    },
    {
      icon: Shield,
      title: 'Valores Históricos',
      desc: 'Disciplina, honor y respeto mutuo son los pilares éticos e identitarios de nuestros estudiantes.',
      color: 'bg-red-50 text-red-600'
    },
    {
      icon: Globe,
      title: 'Habilidades Digitales',
      desc: 'Impulsamos el dominio tecnológico en aulas de innovación para resolver problemas del mundo real.',
      color: 'bg-blue-50 text-blue-500'
    },
  ];

  const quickLinks = [
    { icon: Calendar, title: 'Calendario Escolar', desc: 'Mantente al día con todas nuestras actividades programadas.', path: '/eventos', color: 'bg-blue-50 text-primary' },
    { icon: BookOpen, title: 'Plan Curricular', desc: 'Explora nuestra oferta académica diseñada para el éxito.', path: '/propuesta', color: 'bg-red-50 text-red-600' },
    { icon: Bell, title: 'Comunicados', desc: 'Información oficial para padres de familia y alumnos.', path: '/comunicados', color: 'bg-slate-100 text-slate-600' },
    { icon: Newspaper, title: 'Últimas Noticias', desc: 'Entérate de los acontecimientos más importantes.', path: '/noticias', color: 'bg-blue-50 text-primary' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Hero */}
      <section className="relative min-h-[90vh] bg-primary pt-20 flex items-center overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-20" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Educación de Excelencia
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              {config.hero_titulo_1}<br />
              <span className="text-red-400">{config.hero_titulo_2}</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-xl">
              {config.hero_subtitulo}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/mesa-partes"
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all hover:-translate-y-0.5 shadow-lg"
              >
                Mesa de Partes
                <Send size={18} />
              </Link>
              <button
                onClick={() => setVideoOpen(true)}
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary transition-all"
              >
                <Play size={18} fill="currentColor" />
                Conoce más
              </button>
            </div>

            <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-8">
              <div>
                <div className="text-3xl font-bold text-white">{config.stats_anios}+</div>
                <div className="text-white/60 text-sm">Años de Tradición</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-3xl font-bold text-white">{config.stats_alumnos}</div>
                <div className="text-white/60 text-sm">Alumnos Activos</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1523050335392-9af560c12e74?auto=format&fit=crop&q=80&w=1200"
                alt="Instalaciones I.E. Bandera del Perú"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold text-sm">Colegio Emblemático</div>
                    <div className="text-slate-500 text-xs">Reconocimiento Nacional</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="bg-white py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.title}
                  to={link.path}
                  className="flex items-start gap-4 p-6 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100"
                >
                  <div className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center ${link.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{link.title}</h3>
                    <p className="text-sm text-slate-500">{link.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <span className="text-red-600 font-bold text-xs uppercase tracking-widest mb-2 block">Actualidad</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Últimas Novedades
              </h2>
            </div>
            <Link
              to="/noticias"
              className="group inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-red-600 transition-colors"
            >
              Ver todas
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentItems.length > 0 ? recentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(item.tipoItem === 'noticia' ? '/noticias' : '/comunicados')}
                className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer h-full"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  {item.imagen ? (
                    <img
                      src={`${UPLOADS_URL}/${item.imagen}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={item.titulo}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-primary font-bold text-xs uppercase tracking-widest">
                      Bandera del Perú
                    </div>
                  )}
                  <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded ${item.tipoItem === 'noticia' ? 'bg-primary' : 'bg-red-600'}`}>
                    {item.tipoItem}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-xs text-slate-400 font-medium mb-2">
                    {new Date(item.fechaOrden).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 flex-1">
                    {item.tipoItem === 'noticia'
                      ? sanitizeText(item.contenido)
                      : sanitizeText(item.descripcion)
                    }
                  </p>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                <Newspaper size={40} className="mx-auto text-slate-300 mb-4" />
                <h3 className="font-bold text-lg text-slate-800">Sin publicaciones</h3>
                <p className="text-slate-400 text-sm mt-1">No se encontraron noticias ni comunicados recientes.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="text-red-600 font-bold text-xs uppercase tracking-widest mb-2 block">Valores que nos definen</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Excelencia en cada pilar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pilares.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="group p-8 rounded-xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  <div className={`w-14 h-14 ${p.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{p.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 lg:px-8 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">{s.value}</div>
                <div className="text-white/70 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {videoOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all z-50"
            >
              <X size={18} />
            </button>
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/A3d2D_R8k20?autoplay=1"
              title="Video Institucional I.E. Bandera del Perú"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

Inicio.propTypes = {};

export default Inicio;
