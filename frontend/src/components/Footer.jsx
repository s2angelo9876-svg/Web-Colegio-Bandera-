import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  MapPin, Phone, Mail, Clock, ExternalLink, Heart, ArrowRight, School
} from 'lucide-react';

const FacebookIcon = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

FacebookIcon.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
};

const YoutubeIcon = ({ size = 18, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

YoutubeIcon.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
};

const footerLinks = {
  institucional: [
    { label: 'Inicio', path: '/' },
    { label: '¿Quiénes Somos?', path: '/nosotros' },
    { label: 'Historia', path: '/historia' },
    { label: 'Equipo Directivo', path: '/directivo' },
    { label: 'Documentos Institucionales', path: '/documentos-institucionales' },
  ],
  academico: [
    { label: 'Nuestros Docentes', path: '/docentes' },
    { label: 'Noticias', path: '/noticias' },
    { label: 'Comunicados', path: '/comunicados' },
    { label: 'Galería', path: '/galeria' },
    { label: 'Mesa de Partes', path: '/mesa-partes' },
  ],
};

const Footer = () => (
  <footer className="bg-primary-dark text-white relative overflow-hidden font-sans">
    {/* ── Franja superior coloreada (Sistema de Diseño) ── */}
    <div className="h-1.5 bg-gradient-to-r from-accent via-[#3b82f6] to-accent" />

    {/* Elemento decorativo de fondo */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -mr-48 -mt-48" />

    <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

        {/* Columna 1 — Identidad */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/40 transform transition-transform group-hover:rotate-6">
              <School size={24} className="text-white" />
            </div>
            <div>
              <div className="font-black text-xl tracking-tighter leading-none">BANDERA <span className="text-red-500">PERÚ</span></div>
              <div className="text-blue-400 text-[9px] font-black tracking-[0.25em] uppercase mt-1">I.E. Emblemática</div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-blue-300 font-extrabold text-sm uppercase tracking-wider">
              "Honor · Lealtad · Trabajo"
            </p>
            <p className="text-blue-200/70 text-xs leading-relaxed max-w-[260px] font-medium">
              Más de seis décadas forjando líderes íntegros en la provincia de Pisco bajo nuestros firmes valores institucionales.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {[
              { icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com' },
              { icon: YoutubeIcon, label: 'YouTube', href: 'https://youtube.com' },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-10 h-10 bg-white/5 hover:bg-accent border border-white/10 hover:border-accent rounded-xl flex items-center justify-center transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/40 group"
              >
                <Icon size={18} className="text-blue-200 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Columna 2 — Institucional */}
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-red-500 mb-8">
            Institucional
          </h4>
          <ul className="space-y-4">
            {footerLinks.institucional.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.path}
                  className="inline-flex items-center gap-2 text-sm text-blue-200/80 hover:text-white font-bold transition-all group"
                >
                  <span className="w-0 group-hover:w-3 h-0.5 bg-red-500 transition-all duration-300 rounded-full" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3 — Académico */}
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-red-500 mb-8">
            Académico
          </h4>
          <ul className="space-y-4">
            {footerLinks.academico.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.path}
                  className="inline-flex items-center gap-2 text-sm text-blue-200/80 hover:text-white font-bold transition-all group"
                >
                  <span className="w-0 group-hover:w-3 h-0.5 bg-red-500 transition-all duration-300 rounded-full" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 4 — Contacto */}
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-6">
            Contacto Directo
          </h4>
          <ul className="space-y-5">
            {[
              { icon: MapPin, text: 'Av. San Martín S/N\nPisco, Ica — Perú' },
              { icon: Phone, text: '(056) 123-456' },
              { icon: Mail, text: 'informes@banderadelperu.edu.pe' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-4 group">
                <Icon size={18} className="text-red-500 mt-1 flex-shrink-0" />
                <span className="text-sm text-blue-100/90 leading-tight font-semibold whitespace-pre-line group-hover:text-white transition-colors">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Copyright Section ── */}
      <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/60 text-center md:text-left">
          © {new Date().getFullYear()} I.E. Emblemática Bandera del Perú <br className="md:hidden" />
          <span className="hidden md:inline mx-2">·</span>
          Todos los derechos reservados
        </div>

        <div className="px-6 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
            Hecho con <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" /> por
            <span className="text-white hover:text-red-500 transition-colors cursor-pointer">TI-Bandera</span>
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;