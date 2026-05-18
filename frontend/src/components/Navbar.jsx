import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

  /* Efecto blur/shadow al hacer scroll */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Cerrar menú mobile y buscador al cambiar de ruta */
  useEffect(() => {
    setIsMenuOpen(false);
    setOpenMobile(null);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [location.pathname]);

  /* Búsqueda en tiempo real (debounce) */
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await API.get('/buscar', { params: { q: searchQuery } });
        setSearchResults(res.data.resultados || []);
      } catch (err) {
        console.error('Error al buscar:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const isActive = (path) => location.pathname === path;

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
        className={`sticky top-0 z-[100] transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:!bg-dark-card/95 backdrop-blur-md shadow-lg shadow-blue-900/8 dark:shadow-none border-b border-gray-100 dark:border-dark-border'
            : 'bg-white dark:!bg-dark-card border-b border-gray-100 dark:border-dark-border'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[72px] items-center gap-4">

            {/* ── Logo ── */}
            <div
              className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                <img
                  src={EscudoImg}
                  alt="Escudo I.E. Bandera del Perú"
                  className="w-11 h-11 object-contain relative z-10 drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-primary dark:text-blue-400 font-black text-[17px] tracking-tight uppercase">
                  Bandera del Perú
                </span>
                <span className="text-gray-400 dark:text-slate-500 text-[9px] font-bold tracking-[0.22em] uppercase mt-0.5">
                  I.E. Emblemática · Pisco
                </span>
              </div>
            </div>

            {/* ── Menú Desktop ── */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  {link.submenu ? (
                    <>
                      <button className="flex items-center gap-1 text-gray-600 dark:text-slate-300 font-semibold text-[12px] xl:text-[13px] uppercase tracking-wider hover:text-primary dark:hover:text-blue-400 transition-colors py-[26px] px-2 xl:px-3 rounded-lg hover:bg-blue-50/60 dark:hover:bg-slate-800">
                        {link.name}
                        <ChevronDown
                          size={13}
                          className="transition-transform duration-300 group-hover:rotate-180 text-gray-400"
                        />
                      </button>

                      {/* Dropdown */}
                      <div className="absolute top-full left-0 w-56 bg-white dark:bg-dark-card shadow-2xl dark:shadow-none rounded-2xl p-2 border border-gray-100 dark:border-dark-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 animate-slide-down">
                        {link.submenu.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.name}
                              to={sub.path}
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-dark-hover rounded-xl text-[12px] font-semibold transition-all group/item"
                            >
                              <span className="w-7 h-7 bg-gray-100 dark:bg-dark-input group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/50 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                                <SubIcon size={13} className="text-gray-500 dark:text-slate-400 group-hover/item:text-primary dark:group-hover/item:text-blue-400 transition-colors" />
                              </span>
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={link.path}
                      className={`flex items-center gap-1.5 font-semibold text-[12px] xl:text-[13px] uppercase tracking-wider transition-all py-[26px] px-2 xl:px-3 rounded-lg relative ${
                        isActive(link.path)
                          ? 'text-primary dark:text-blue-400 bg-blue-50/60 dark:bg-dark-card'
                          : 'text-gray-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-slate-800'
                      }`}
                    >
                      {link.name}
                      {isActive(link.path) && (
                        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-600 rounded-full" />
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* ── Acciones derecha ── */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
                aria-label="Cambiar tema"
              >
                {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {/* Buscador toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
                aria-label="Buscar"
              >
                {searchOpen ? <X size={17} /> : <Search size={17} />}
              </button>

              {/* Intranet */}
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.12em] hover:bg-red-600 transition-all shadow-lg shadow-blue-900/20 active:scale-95 group"
              >
                <Shield size={13} className="group-hover:rotate-12 transition-transform" />
                Intranet
              </button>
            </div>

            {/* ── Hamburger mobile ── */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {isMenuOpen
                ? <X size={22} className="animate-fade-in" />
                : <Menu size={22} className="animate-fade-in" />
              }
            </button>
          </div>

          {/* ── Search bar (Desktop) ── */}
          {searchOpen && (
            <div className="hidden lg:block pb-4 animate-fade-in-down relative">
              <div className="relative max-w-xl mx-auto font-sans">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar noticias, comunicados o docentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-dark-input border border-gray-200 dark:border-dark-border rounded-xl text-sm focus:outline-none focus:border-primary dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950 transition-all dark:text-white"
                />
              </div>

              {/* Search Results Dropdown */}
              {(searchResults.length > 0 || searching || searchQuery.trim().length >= 2) && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-full max-w-xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-2xl z-[150] p-4 mt-2 max-h-[300px] overflow-y-auto font-sans">
                  {searching && (
                    <div className="text-gray-400 text-xs font-bold text-center py-4 uppercase tracking-widest">Buscando en tiempo real...</div>
                  )}
                  {!searching && searchResults.length === 0 && (
                    <div className="text-gray-400 text-xs font-bold text-center py-4 uppercase tracking-widest">No se encontraron resultados</div>
                  )}
                  {!searching && searchResults.length > 0 && (
                    <div className="space-y-1">
                      {searchResults.map((item) => (
                        <div
                          key={`${item.tipo}-${item.id}`}
                          onClick={() => handleResultClick(item)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-hover rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                        >
                          <span className="text-sm font-bold text-gray-700 dark:text-slate-200">{item.titulo}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-primary dark:text-blue-400 rounded-lg">
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

        {/* ── Menú Mobile ── */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-bg animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1 max-h-[75vh] overflow-y-auto">
              
              {/* Search Bar Mobile */}
              <div className="relative mb-4 font-sans">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en el sitio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-dark-input border border-gray-200 dark:border-dark-border rounded-xl text-sm focus:outline-none dark:text-white"
                />
                
                {/* Search Results Mobile */}
                {(searchResults.length > 0 || searching || searchQuery.trim().length >= 2) && (
                  <div className="mt-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl shadow-xl p-3 max-h-[200px] overflow-y-auto">
                    {searching && <div className="text-center text-xs text-gray-400 py-2">Buscando...</div>}
                    {!searching && searchResults.length === 0 && <div className="text-center text-xs text-gray-400 py-2">Sin resultados</div>}
                    {!searching && searchResults.length > 0 && (
                      <div className="space-y-1">
                        {searchResults.map((item) => (
                          <div
                            key={`${item.tipo}-${item.id}`}
                            onClick={() => handleResultClick(item)}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-dark-hover rounded-lg cursor-pointer"
                          >
                            <span className="text-xs font-bold text-gray-700 dark:text-slate-200 truncate pr-2">{item.titulo}</span>
                            <span className="text-[8px] font-black uppercase bg-blue-50 dark:bg-blue-950/40 text-primary dark:text-blue-400 px-2 py-0.5 rounded">
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
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-slate-300 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-dark-hover hover:text-primary dark:hover:text-blue-400 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {(() => { const Icon = link.icon; return <Icon size={16} className="text-gray-400" />; })()}
                          {link.name}
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-gray-400 transition-transform duration-300 ${openMobile === link.name ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {openMobile === link.name && (
                        <div className="mt-1 ml-4 pl-4 border-l-2 border-blue-100 dark:border-slate-800 space-y-1 animate-slide-down">
                          {link.submenu.map((sub) => {
                            const SubIcon = sub.icon;
                            return (
                              <Link
                                key={sub.name}
                                to={sub.path}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-dark-hover text-sm font-medium transition-all"
                              >
                                <SubIcon size={14} className="text-gray-400 flex-shrink-0" />
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive(link.path)
                          ? 'bg-blue-50 dark:bg-dark-hover text-primary dark:text-blue-400'
                          : 'text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-dark-hover hover:text-primary'
                      }`}
                    >
                      {(() => { const Icon = link.icon; return <Icon size={16} className="text-gray-400 flex-shrink-0" />; })()}
                      {link.name}
                      {isActive(link.path) && (
                        <span className="ml-auto w-2 h-2 bg-red-600 rounded-full" />
                      )}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-4 pb-2 flex flex-col gap-3">
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-dark-input text-gray-700 dark:text-slate-300 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  Modo {isDarkMode ? 'Claro' : 'Oscuro'}
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-red-600 transition-all shadow-lg"
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

export default Navbar;