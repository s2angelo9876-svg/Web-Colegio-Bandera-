import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/authContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  getNoticias, getEventos, getComunicados, getDocentes, getGaleria
} from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
  Newspaper, Calendar, Megaphone, FolderTree,
  Users, Image as ImageIcon, LayoutDashboard, LogOut,
  ChevronRight, Bell, Briefcase, ArrowUpRight, Clock, Settings, FileText, Moon, Sun
} from 'lucide-react';
import AdminChart from '../components/AdminChart';

const trendData = [
  { name: 'Ene', valor: 4 }, { name: 'Feb', valor: 7 },
  { name: 'Mar', valor: 5 }, { name: 'Abr', valor: 12 },
  { name: 'May', valor: 9 }, { name: 'Jun', valor: 15 },
];

const distributionData = [
  { name: 'Lun', valor: 2 }, { name: 'Mar', valor: 5 },
  { name: 'Mie', valor: 3 }, { name: 'Jue', valor: 8 },
  { name: 'Vie', valor: 6 },
];

function SidebarItem({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
        active
          ? 'bg-white/10 text-white font-semibold'
          : 'text-blue-200/60 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={17} className={active ? 'text-white' : 'text-blue-300/50'} />
      <span className="text-xs uppercase tracking-wider">{label}</span>
    </Link>
  );
}

SidebarItem.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

function StatCard({ label, count, loading, icon, color, footer }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${color} text-white group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <ArrowUpRight className="text-slate-200 group-hover:text-slate-400 transition-colors" size={18} />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-slate-50 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-slate-900">{count}</p>
      )}
      <p className="text-[10px] font-medium text-slate-400 mt-3 pt-3 border-t border-slate-100">{footer}</p>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  footer: PropTypes.string,
};

function QuickAction({ to, color, title, icon: Icon }) {
  const colors = {
    blue: 'bg-primary hover:bg-blue-800',
    red: 'bg-red-600 hover:bg-red-700',
    yellow: 'bg-amber-500 hover:bg-amber-600',
    purple: 'bg-indigo-600 hover:bg-indigo-700'
  };
  return (
    <Link
      to={to}
      className={`${colors[color] || colors.blue} p-4 rounded-lg text-white text-center font-semibold text-[11px] uppercase tracking-wider transition-all hover:-translate-y-0.5 shadow-sm flex flex-col items-center justify-center gap-2 group h-24`}
    >
      <Icon size={22} className="group-hover:scale-110 transition-transform" />
      <span>{title}</span>
    </Link>
  );
}

QuickAction.propTypes = {
  to: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
};

function Admin() {
  const { usuario, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [stats, setStats] = useState({
    noticias: 0, eventos: 0, comunicados: 0, docentes: 0, galeria: 0, cargando: true
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        const resultados = await Promise.allSettled([
          getNoticias(), getEventos(), getComunicados(), getDocentes(), getGaleria()
        ]);
        const [r1, r2, r3, r4, r5] = resultados;
        setStats({
          noticias: r1.status === 'fulfilled' ? (r1.value.data?.length || 0) : 0,
          eventos: r2.status === 'fulfilled' ? (r2.value.data?.length || 0) : 0,
          comunicados: r3.status === 'fulfilled' ? (r3.value.data?.length || 0) : 0,
          docentes: r4.status === 'fulfilled' ? (r4.value.data?.length || 0) : 0,
          galeria: r5.status === 'fulfilled' ? (r5.value.data?.length || 0) : 0,
          cargando: false
        });
      } catch {
        setStats(prev => ({ ...prev, cargando: false }));
      }
    };
    fetchRealStats();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === `/admin/${path}` || (path === '' && location.pathname === '/admin');

  const statsCards = useMemo(() => [
    { label: 'Noticias', count: stats.noticias, loading: stats.cargando, icon: <Newspaper size={18} />, color: 'bg-primary', footer: 'Tendencia Mensual' },
    { label: 'Eventos', count: stats.eventos, loading: stats.cargando, icon: <Calendar size={18} />, color: 'bg-red-600', footer: 'Calendario Escolar' },
    { label: 'Comunicados', count: stats.comunicados, loading: stats.cargando, icon: <Megaphone size={18} />, color: 'bg-amber-500', footer: 'Avisos comunidad' },
    { label: 'Docentes', count: stats.docentes, loading: stats.cargando, icon: <Users size={18} />, color: 'bg-emerald-600', footer: 'Staff Académico' },
    { label: 'Galería', count: stats.galeria, loading: stats.cargando, icon: <ImageIcon size={18} />, color: 'bg-indigo-600', footer: 'Archivo Visual' },
  ], [stats]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 flex flex-col p-5 sticky top-0 h-screen">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm uppercase tracking-tight">Panel</h1>
            <p className="text-red-500 text-[9px] tracking-widest font-semibold">BANDERA</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-2">Principal</p>
          <SidebarItem to="/admin" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/admin'} />
          <SidebarItem to="noticias" icon={Newspaper} label="Noticias" active={isActive('noticias')} />
          <SidebarItem to="eventos" icon={Calendar} label="Eventos" active={isActive('eventos')} />
          <SidebarItem to="comunicados" icon={Megaphone} label="Comunicados" active={isActive('comunicados')} />
          <SidebarItem to="mesa-partes" icon={FileText} label="Mesa de Partes" active={isActive('mesa-partes')} />

          {usuario?.rol === 'admin' && (
            <>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mt-6 mb-2">Institucional</p>
              <SidebarItem to="documentos-institucionales" icon={FolderTree} label="Documentos" active={isActive('documentos-institucionales')} />
              <SidebarItem to="docentes" icon={Users} label="Docentes" active={isActive('docentes')} />
              <SidebarItem to="administrativos" icon={Briefcase} label="Administrativos" active={isActive('administrativos')} />
              <SidebarItem to="galeria" icon={ImageIcon} label="Galería" active={isActive('galeria')} />
              <SidebarItem to="config-inicio" icon={Settings} label="Personalizar" active={isActive('config-inicio')} />
            </>
          )}
        </nav>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 mb-3 p-3 rounded-lg bg-slate-800">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              {usuario?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-white truncate">{usuario?.username}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">{usuario?.rol}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors font-semibold text-[10px] uppercase tracking-wider"
          >
            <LogOut size={14} />
            Desconectar
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded mb-2">
              <Clock size={11} className="animate-pulse" />
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-slate-500 text-sm mt-1">Bienvenido de vuelta, <span className="text-slate-700 font-semibold">{usuario?.username}</span></p>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-colors"
              aria-label="Cambiar tema"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold text-xs uppercase tracking-wider hover:bg-red-600 transition-colors"
            >
              Ver Portal
              <ChevronRight size={14} />
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {statsCards.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="h-[340px]">
            <AdminChart data={trendData} title="Actividad de Publicaciones" type="area" color="#003087" />
          </div>
          <div className="h-[340px]">
            <AdminChart data={distributionData} title="Alcance de Comunicados" type="line" color="#DC2626" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Acceso Directo a Módulos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <QuickAction to="noticias" color="blue" title="Noticia" icon={Newspaper} />
            <QuickAction to="eventos" color="red" title="Evento" icon={Calendar} />
            <QuickAction to="comunicados" color="yellow" title="Comunicado" icon={Megaphone} />
            <QuickAction to="galeria" color="purple" title="Galería" icon={ImageIcon} />
            <QuickAction to="config-inicio" color="blue" title="Personalizar" icon={Settings} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin;
