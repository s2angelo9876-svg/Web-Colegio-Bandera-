import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  ChevronDown, Search, Menu, X, BookOpen, Users, Cpu,
  Newspaper, ClipboardList, Image, GraduationCap, Home,
  Info, Shield, Zap, Building2, Moon, Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { API } from '../services/api';
import EscudoImg from "../assets/escudo.jpeg";

const navLinks = [
  { name: 'Inicio', path: '/', icon: Home },
  {
    name: 'Nosotros',
    icon: Building2,
    submenu: [
      { name: '¿Quiénes Somos?', path: '/nosotros',  icon: Info },
      { name: 'Historia',          path: '/historia',  icon: BookOpen },
      { name: 'Equipo Directivo',  path: '/directivo', icon: Users },
      { name: 'Misión y Visión',   path: '/mision',    icon: Zap },
      { name: 'Valores',           path: '/valores',   icon: Shield },
    ]
  },
  {
    name: 'Académico',
    icon: GraduationCap,
    submenu: [
      { name: 'Mesa de Partes',       path: '/mesa-partes', icon: ClipboardList },
      { name: 'Propuesta Pedagógica', path: '/propuesta',   icon: BookOpen },
      { name: 'Nuestros Docentes',    path: '/docentes',    icon: Users },
      { name: 'Talleres',             path: '/talleres',    icon: Zap },
      { name: 'Calendario Escolar',   path: '/eventos',     icon: ClipboardList },
    ]
  },
  {
    name: 'Actualidad',
    icon: Newspaper,
    submenu: [
      { name: 'Noticias',    path: '/noticias',    icon: Newspaper },
      { name: 'Comunicados', path: '/comunicados', icon: ClipboardList },
      { name: 'Galería',     path: '/galeria',     icon: Image },
      { name: 'Documentos Inst.', path: '/documentos-institucionales', icon: BookOpen },
    ]
  },
  {
    name: 'Zona TIC',
    icon: Cpu,
    submenu: [
      { name: 'Aula de Innovación',    path: '/tic/aula',      icon: Zap },
      { name: 'Recursos Digitales',    path: '/tic/recursos',  icon: BookOpen },
      { name: 'Proyectos Tecnológicos',path: '/tic/proyectos', icon: Cpu },
    ]
  }
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen]       = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]         = useState(false);
  const [openMobile, setOpenMobile]       = useState(null);
  const { isDarkMode, toggleDarkMode }    = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenMobile(null);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [location.pathname]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    let isCancelled = false;
    const delay = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await API.get('/buscar', { params: { q: searchQuery } });
        if (!isCancelled) {
          setSearchResults(res.data.resultados || []);
        }
      } catch {
        if (!isCancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(delay);
    };
  }, [searchQuery]);

  const isActive = useMemo(() => (path) => location.pathname === path, [location.pathname]);

  const handleResultClick = (item) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    if (item.tipo === 'noticia') {
      navigate('/noticias');
    } else if (item.tipo === 'comunicado') {
      navigate('/comunicados');
    } else if (item.tipo === 'docente') {
      navigate('/docentes');
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 h-20 ${
          scrolled
            ? 'bg-primary shadow-lg'
            : 'bg-primary'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between h-full items-center gap-4">

            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
              onClick={() => navigate('/')}
            >
              <img
                src={EscudoImg}
                alt="Escudo I.E. Bandera del Perú"
                className="w-10 h-10 object-contain rounded-full bg-white p-0.5"
              />
              <span className="text-white font-bold text-lg tracking-tight">
                I.E. Bandera del Perú
              </span>
            </div>

            {/* Menú Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  {link.submenu ? (
                    <>
                      <button className="flex items-center gap-1 text-white/90 hover:text-white font-medium text-sm py-2 px-3 transition-colors">
                        {link.name}
                        <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                      </button>

                      <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-xl p-2 border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                        {link.submenu.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.name}
                              to={sub.path}
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg text-sm font-medium transition-all"
                            >
                              <SubIcon size={15} />
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={link.path}
                      className={`flex items-center gap-1 font-medium text-sm py-2 px-3 transition-colors ${
                        isActive(link.path)
                          ? 'text-white border-b-2 border-red-500'
                          : 'text-white/90 hover:text-white'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Acciones derecha */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Cambiar tema"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Buscar"
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              <button
                onClick={() => navigate('/login')}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Intranet
              </button>
            </div>

            {/* Hamburger mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-all"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Search bar Desktop */}
          {searchOpen && (
            <div className="hidden lg:block pb-4 animate-fade-in-down relative">
              <div className="relative max-w-xl mx-auto font-sans">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar noticias, comunicados o docentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-700"
                  aria-label="Buscar en el sitio"
                />
              </div>

              {(searchResults.length > 0 || searching || searchQuery.trim().length >= 2) && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-full max-w-xl bg-white border border-slate-100 rounded-2xl shadow-2xl z-[150] p-4 mt-2 max-h-[300px] overflow-y-auto">
                  {searching && (
                    <div className="text-slate-400 text-xs font-bold text-center py-4 uppercase tracking-widest">Buscando...</div>
                  )}
                  {!searching && searchResults.length === 0 && (
                    <div className="text-slate-400 text-xs font-bold text-center py-4 uppercase tracking-widest">No se encontraron resultados</div>
                  )}
                  {!searching && searchResults.length > 0 && (
                    <div className="space-y-1">
                      {searchResults.map((item) => (
                        <div
                          key={`${item.tipo}-${item.id}`}
                          onClick={() => handleResultClick(item)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-all"
                        >
                          <span className="text-sm font-semibold text-slate-700">{item.titulo}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-blue-50 text-primary rounded-lg">
                            {item.tipo}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menú Mobile */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl absolute top-20 left-0 right-0 max-h-[80vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              
              <div className="relative mb-4">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar en el sitio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700"
                />
                
                {(searchResults.length > 0 || searching || searchQuery.trim().length >= 2) && (
                  <div className="mt-2 bg-white border border-slate-100 rounded-xl shadow-lg p-3 max-h-[200px] overflow-y-auto">
                    {searching && <div className="text-center text-xs text-slate-400 py-2">Buscando...</div>}
                    {!searching && searchResults.length === 0 && <div className="text-center text-xs text-slate-400 py-2">Sin resultados</div>}
                    {!searching && searchResults.length > 0 && (
                      <div className="space-y-1">
                        {searchResults.map((item) => (
                          <div
                            key={`${item.tipo}-${item.id}`}
                            onClick={() => handleResultClick(item)}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                          >
                            <span className="text-xs font-semibold text-slate-700 truncate pr-2">{item.titulo}</span>
                            <span className="text-[8px] font-bold uppercase bg-blue-50 text-primary px-2 py-0.5 rounded">
                              {item.tipo}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.submenu ? (
                    <>
                      <button
                        onClick={() => setOpenMobile(openMobile === link.name ? null : link.name)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {(() => { const Icon = link.icon; return <Icon size={16} className="text-slate-400" />; })()}
                          {link.name}
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-slate-400 transition-transform duration-300 ${openMobile === link.name ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {openMobile === link.name && (
                        <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 space-y-1">
                          {link.submenu.map((sub) => {
                            const SubIcon = sub.icon;
                            return (
                              <Link
                                key={sub.name}
                                to={sub.path}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-primary hover:bg-slate-50 text-sm font-medium transition-all"
                              >
                                <SubIcon size={14} className="text-slate-400 flex-shrink-0" />
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive(link.path)
                          ? 'bg-blue-50 text-primary'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
                      }`}
                    >
                      {(() => { const Icon = link.icon; return <Icon size={16} className="text-slate-400 flex-shrink-0" />; })()}
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-4 pb-2 flex flex-col gap-3">
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold text-sm transition-all"
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  Modo {isDarkMode ? 'Claro' : 'Oscuro'}
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-all"
                >
                  <Shield size={15} />
                  Acceso Intranet
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

Navbar.propTypes = {};

export default Navbar;
