import { useLocation, Link } from 'react-router-dom';
import {
  Info, BookOpen, Users, LayoutDashboard,
  Flag, Monitor, Cpu, Map, HelpCircle,
  ArrowRight, Award, Zap, Shield, Target, ChevronRight
} from 'lucide-react';
import Footer from '../components/Footer';

const getIcon = (path) => {
  const props = { size: 24, className: "text-white" };
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
  return <HelpCircle {...props} />;
};

const contenidos = {
  '/nosotros': {
    titulo: 'Quiénes Somos',
    subtitulo: 'Nuestra Identidad Institucional',
    info: 'La Institución Educativa Emblemática "Bandera del Perú" es un referente de formación integral en la provincia de Pisco, dedicada a brindar una educación de calidad basada en principios éticos, disciplina y excelencia académica.'
  },
  '/historia': {
    titulo: 'Nuestra Historia',
    subtitulo: 'Años de Trayectoria y Tradición',
    info: 'Nuestra institución nace con el firme propósito de servir a la comunidad educativa de Pisco. A lo largo de más de seis décadas, hemos evolucionado para adaptarnos a los nuevos retos pedagógicos, manteniendo siempre nuestra esencia y compromiso con el país.'
  },
  '/directivo': {
    titulo: 'Equipo Directivo',
    subtitulo: 'Liderazgo y Gestión Educativa',
    info: 'Contamos con un cuerpo directivo altamente calificado que gestiona con transparencia, ética y visión de futuro, asegurando que cada estudiante de nuestra comunidad alcance su máximo potencial bajo un entorno seguro y estimulante.',
    redirect: '/directivo'
  },
  '/mision': {
    titulo: 'Misión y Visión',
    subtitulo: 'Nuestro Propósito y Horizonte',
    info: 'Misión: Formar estudiantes críticos, creativos y con valores solidarios. Visión: Ser reconocidos como la institución líder en innovación educativa, formación ciudadana y excelencia académica en la región para el año 2030.'
  },
  '/organigrama': {
    titulo: 'Estructura Organizacional',
    subtitulo: 'Gestión Institucional Eficiente',
    info: 'Nuestra estructura organizacional garantiza una gestión administrativa y pedagógica transparente, permitiendo una comunicación fluida entre todos los niveles para el beneficio directo de nuestros alumnos.',
    esOrganigrama: true,
    imagenUrl: '/organigrama-institucional.png'
  },
  '/valores': {
    titulo: 'Nuestros Valores',
    subtitulo: 'Pilares de nuestra Convivencia',
    info: 'Disciplina, Estudio y Superación son los pilares fundamentales que rigen el comportamiento de toda nuestra comunidad bandera, fomentando el respeto, la honestidad y la puntualidad en cada una de nuestras acciones.'
  },
  '/propuesta': {
    titulo: 'Propuesta Educativa',
    subtitulo: 'Innovación para el Aprendizaje',
    info: 'Nuestro enfoque pedagógico combina el desarrollo de habilidades socioemocionales con el dominio de competencias tecnológicas y científicas, preparando a los estudiantes para los desafíos del siglo XXI.'
  },
  '/talleres': {
    titulo: 'Talleres Extracurriculares',
    subtitulo: 'Desarrollo de Talentos y Habilidades',
    info: 'Fomentamos el desarrollo integral a través de talleres de Robótica, Danza, Música, Banda de Músicos y Deportes, potenciando las habilidades artísticas, culturales y físicas de nuestros alumnos.'
  },
  '/tic/aula': {
    titulo: 'Aula de Innovación',
    subtitulo: 'Entorno Digital de Aprendizaje',
    info: 'Espacios equipados con tecnología de última generación destinados al refuerzo académico, investigación y el desarrollo de competencias digitales en todos los niveles.'
  },
  '/tic/recursos': {
    titulo: 'Recursos Digitales',
    subtitulo: 'Biblioteca y Materiales Multimedia',
    info: 'Acceso a un repositorio exclusivo de libros digitales, guías pedagógicas y software educativo especializado para estudiantes y docentes del plantel.'
  },
  '/tic/proyectos': {
    titulo: 'Proyectos Tecnológicos',
    subtitulo: 'Innovación y Ciencia Bandera',
    info: 'Exhibición de los proyectos más destacados desarrollados por nuestros alumnos en las ferias de ciencia, informática y emprendimiento tecnológico.'
  },
  '/tic/soporte': {
    titulo: 'Soporte Técnico',
    subtitulo: 'Asistencia para la Comunidad',
    info: 'Servicio dedicado a la atención de problemas de conectividad, gestión de cuentas institucionales y mantenimiento preventivo de equipos tecnológicos del colegio.'
  }
};

const SeccionInstitucion = () => {
  const location = useLocation();
  const actual = contenidos[location.pathname] || {
    titulo: 'En Construcción',
    subtitulo: 'Contenido en proceso',
    info: 'Estamos trabajando para brindarte la mejor información sobre esta sección institucional.'
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-20">

      <section className="relative py-20 px-6 overflow-hidden bg-primary">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-semibold uppercase tracking-widest mb-6">
            <span className="w-7 h-7 bg-white/20 rounded-md flex items-center justify-center">
              {getIcon(location.pathname)}
            </span>
            Nuestro Colegio
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            {actual.titulo}
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            {actual.subtitulo}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-10 pb-20 relative z-20">
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 md:p-12">

          <div className="bg-slate-50 p-6 md:p-8 rounded-lg border border-slate-100 mb-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded mb-4">
              <Info size={10} />
              Detalle Institucional
            </div>
            <p className="text-slate-700 text-base md:text-lg leading-relaxed">
              {actual.info}
            </p>
          </div>

          {actual.esOrganigrama && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-red-600 rounded-full" />
                <h4 className="text-base font-bold text-slate-900">Organigrama Institucional</h4>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border-2 border-dashed border-slate-200">
                <img
                  src={actual.imagenUrl}
                  alt="Organigrama Institucional"
                  className="w-full h-auto rounded-lg"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x800/f1f5f9/64748b?text=Organigrama'; }}
                />
              </div>
            </div>
          )}

          {actual.redirect && (
            <div className="mt-8 text-center">
              <Link
                to={actual.redirect}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-red-600 transition-colors"
              >
                Ver equipo completo
                <ChevronRight size={16} />
              </Link>
            </div>
          )}

          <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white">
                <Flag size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider leading-none mb-1">I.E. Bandera del Perú</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pisco, Ica — Perú</p>
              </div>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-red-600 transition-colors"
            >
              Volver al Inicio
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SeccionInstitucion;
