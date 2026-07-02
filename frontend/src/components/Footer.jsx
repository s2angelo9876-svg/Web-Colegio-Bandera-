import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  MapPin, Phone, Mail, Heart, School, Globe
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
    { label: 'Documentos', path: '/documentos-institucionales' },
  ],
  academico: [
    { label: 'Nuestros Docentes', path: '/docentes' },
    { label: 'Noticias', path: '/noticias' },
    { label: 'Comunicados', path: '/comunicados' },
    { label: 'Galería', path: '/galeria' },
    { label: 'Mesa de Partes', path: '/mesa-partes' },
  ],
};

const contactInfo = [
  { icon: MapPin, text: 'Av. San Martín S/N\nPisco, Ica — Perú' },
  { icon: Phone, text: '(056) 123-456' },
  { icon: Mail, text: 'informes@banderadelperu.edu.pe' },
];

const Footer = () => (
  <footer className="bg-slate-900 text-white border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <School size={22} className="text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">I.E. Bandera del Perú</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Más de seis décadas forjando líderes íntegros en la provincia de Pisco bajo nuestros firmes valores institucionales.
          </p>
          <p className="text-red-500 font-semibold text-sm tracking-wide">
            "Honor · Lealtad · Trabajo"
          </p>
        </div>

        {/* Institucional */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">
            Institucional
          </h4>
          <ul className="space-y-3">
            {footerLinks.institucional.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.path}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Académico */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">
            Académico
          </h4>
          <ul className="space-y-3">
            {footerLinks.academico.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.path}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">
            Contacto
          </h4>
          <ul className="space-y-4">
            {contactInfo.map((item) => {
              const ContactIcon = item.icon;
              return (
                <li key={item.text} className="flex items-start gap-3">
                  <ContactIcon size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-400 text-sm whitespace-pre-line">{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} I.E. Emblemática Bandera del Perú. Todos los derechos reservados.
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"
          >
            <FacebookIcon size={16} />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all"
          >
            <YoutubeIcon size={16} />
          </a>
          <a
            href="https://ie-banderadelperu.edu.pe"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Web institucional"
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"
          >
            <Globe size={16} />
          </a>
        </div>

        <p className="text-slate-500 text-xs flex items-center gap-1">
          Hecho con <Heart size={12} className="text-red-500 fill-red-500" /> por TI-Bandera
        </p>
      </div>
    </div>
  </footer>
);

Footer.propTypes = {};

export default Footer;
