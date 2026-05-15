import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Info, BookOpen, Users, Star, LayoutDashboard, 
  Flag, Monitor, CheckCircle, Cpu, Map, HelpCircle,
  ArrowRight, Award, Zap, Shield, Target
} from 'lucide-react';
import Footer from '../components/Footer';

const SeccionInstitucion = () => {
  const location = useLocation();

  const getIcon = (path) => {
    const props = { size: 48, className: "text-white mb-6 animate-float" };
    if (path.includes('nosotros')) return <Info {...props} />;
    if (path.includes('historia')) return <Map {...props} />;
    if (path.includes('directivo')) return <Users {...props} />;
    if (path.includes('mision')) return <Target {...props} />;
    if (path.includes('organigrama')) return <LayoutDashboard {...props} />;
    if (path.includes('valores')) return <Shield {...props} />;
    if (path.includes('propuesta')) return <Award {...props} />;
    if (path.includes('talleres')) return <Zap {...props} />;
    if (path.includes('tic/aula')) return <Monitor {...props} />;
    if (path.includes('tic/recursos')) return <BookOpen {...props} />;
    if (path.includes('tic/proyectos')) return <Cpu {...props} />;
    if (path.includes('tic/soporte')) return <HelpCircle {...props} />;
    return <HelpCircle {...props} />;
  };

  const contenidos = {
    '/nosotros': {
      titulo: 'Quiénes Somos',
      subtitulo: 'Nuestra Identidad Institucional',
      info: 'La Institución Educativa Emblemática "Bandera del Perú" es un referente de formación integral en la provincia de Pisco, dedicada a brindar una educación de calidad basada en principios éticos, disciplina y excelencia académica.',
      color: 'from-primary to-primary-dark'
    },
    '/historia': {
      titulo: 'Nuestra Historia',
      subtitulo: 'Años de Trayectoria y Tradición',
      info: 'Nuestra institución nace con el firme propósito de servir a la comunidad educativa de Pisco. A lo largo de más de seis décadas, hemos evolucionado para adaptarnos a los nuevos retos pedagógicos, manteniendo siempre nuestra esencia y compromiso con el país.',
      color: 'from-red-700 to-red-900'
    },
    '/directivo': {
      titulo: 'Equipo Directivo',
      subtitulo: 'Liderazgo y Gestión Educativa',
      info: 'Contamos con un cuerpo directivo altamente calificado que gestiona con transparencia, ética y visión de futuro, asegurando que cada estudiante de nuestra comunidad alcance su máximo potencial bajo un entorno seguro y estimulante.',
      color: 'from-primary to-primary-dark'
    },
    '/mision': {
      titulo: 'Misión y Visión',
      subtitulo: 'Nuestro Propósito y Horizonte',
      info: 'Misión: Formar estudiantes críticos, creativos y con valores solidarios. Visión: Ser reconocidos como la institución líder en innovación educativa, formación ciudadana y excelencia académica en la región para el año 2030.',
      color: 'from-blue-800 to-indigo-900'
    },
    '/organigrama': {
      titulo: 'Estructura Organizacional',
      subtitulo: 'Gestión Institucional Eficiente',
      info: 'Nuestra estructura organizacional garantiza una gestión administrativa y pedagógica transparente, permitiendo una comunicación fluida entre todos los niveles para el beneficio directo de nuestros alumnos.',
      esOrganigrama: true,
      imagenUrl: '/organigrama-institucional.png',
      color: 'from-primary to-primary-dark'
    },
    '/valores': {
      titulo: 'Nuestros Valores',
      subtitulo: 'Pilares de nuestra Convivencia',
      info: 'Disciplina, Estudio y Superación son los pilares fundamentales que rigen el comportamiento de toda nuestra comunidad bandera, fomentando el respeto, la honestidad y la puntualidad en cada una de nuestras acciones.',
      color: 'from-red-600 to-red-800'
    },
    '/propuesta': {
      titulo: 'Propuesta Educativa',
      subtitulo: 'Innovación para el Aprendizaje',
      info: 'Nuestro enfoque pedagógico combina el desarrollo de habilidades socioemocionales con el dominio de competencias tecnológicas y científicas, preparando a los estudiantes para los desafíos del siglo XXI.',
      color: 'from-primary to-primary-dark'
    },
    '/talleres': {
      titulo: 'Talleres Extracurriculares',
      subtitulo: 'Desarrollo de Talentos y Habilidades',
      info: 'Fomentamos el desarrollo integral a través de talleres de Robótica, Danza, Música, Banda de Músicos y Deportes, potenciando las habilidades artísticas, culturales y físicas de nuestros alumnos.',
      color: 'from-emerald-700 to-emerald-900'
    },
    '/tic/aula': { 
      titulo: 'Aula de Innovación', 
      subtitulo: 'Entorno Digital de Aprendizaje', 
      info: 'Espacios equipados con tecnología de última generación destinados al refuerzo académico, investigación y el desarrollo de competencias digitales en todos los niveles.',
      color: 'from-slate-800 to-slate-900'
    },
    '/tic/recursos': { 
      titulo: 'Recursos Digitales', 
      subtitulo: 'Biblioteca y Materiales Multimedia', 
      info: 'Acceso a un repositorio exclusivo de libros digitales, guías pedagógicas y software educativo especializado para estudiantes y docentes del plantel.',
      color: 'from-slate-800 to-slate-900'
    },
    '/tic/proyectos': { 
      titulo: 'Proyectos Tecnológicos', 
      subtitulo: 'Innovación y Ciencia Bandera', 
      info: 'Exhibición de los proyectos más destacados desarrollados por nuestros alumnos en las ferias de ciencia, informática y emprendimiento tecnológico.',
      color: 'from-slate-800 to-slate-900'
    },
    '/tic/soporte': { 
      titulo: 'Soporte Técnico', 
      subtitulo: 'Asistencia para la Comunidad', 
      info: 'Servicio dedicado a la atención de problemas de conectividad, gestión de cuentas institucionales y mantenimiento preventivo de equipos tecnológicos del colegio.',
      color: 'from-slate-800 to-slate-900'
    }
  };

  const actual = contenidos[location.pathname] || { 
    titulo: 'En Construcción', 
    subtitulo: 'Contenido en proceso', 
    info: 'Estamos trabajando para brindarte la mejor información sobre esta sección institucional.',
    color: 'from-gray-700 to-gray-900'
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      
      {/* ── Page Header ── */}
      <section className={`relative py-32 px-6 overflow-hidden bg-gradient-to-br ${actual.color}`}>
        {/* Decoraciones de fondo */}
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
           <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="animate-badge-pop mb-6">
            {getIcon(location.pathname)}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 animate-fade-in-up">
            {actual.titulo}
          </h1>
          <div className="w-24 h-1.5 bg-red-500 mx-auto mb-8 rounded-full shadow-lg shadow-red-900/40" />
          <p className="text-xl md:text-2xl text-blue-100 font-light italic max-w-2xl px-4 animate-fade-in-up delay-100 leading-relaxed">
            {actual.subtitulo}
          </p>
        </div>

        {/* Onda decorativa inferior */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
            </svg>
        </div>
      </section>

      {/* ── Content Body ── */}
      <div className="max-w-5xl mx-auto px-6 -mt-16 pb-32 relative z-20">
        <div className={`bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-white/60 backdrop-blur-sm animate-fade-in-up delay-200`}>
          <div className="p-8 md:p-16">
            
            {/* Bloque de Información Principal */}
            <div className="relative bg-slate-50/80 p-8 md:p-12 rounded-[2.5rem] mb-12 group transition-all duration-500 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-blue-100">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Info size={20} />
              </div>
              
              <h3 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
                <Zap size={12} className="text-red-500" /> Detalle Institucional
              </h3>
              
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed font-medium">
                {actual.info}
              </p>
            </div>

            {/* Renderizado especial para Organigrama */}
            {actual.esOrganigrama && (
              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-2 h-8 bg-red-600 rounded-full" />
                   <h4 className="text-xl font-black text-gray-800">Visualización del Organigrama</h4>
                </div>
                <div className="bg-slate-100/50 p-4 md:p-10 rounded-[3rem] border-2 border-dashed border-slate-200 group transition-all">
                  <div className="overflow-hidden rounded-[2rem] shadow-2xl bg-white border border-gray-100">
                    <img 
                      src={actual.imagenUrl} 
                      alt="Organigrama Institucional" 
                      className="w-full h-auto transform transition-transform duration-700 group-hover:scale-[1.03]"
                      onError={(e) => {
                          e.target.src = "https://placehold.co/1200x800/f8fafc/64748b?text=Representaci%C3%B3n+del+Organigrama+Institucional";
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer de la página de contenido */}
            <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Flag size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none mb-1">I.E. Bandera del Perú</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Pisco, Ica — Perú</p>
                </div>
              </div>

              <Link 
                to="/" 
                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-red-600 transition-colors"
              >
                Volver al Inicio
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SeccionInstitucion;