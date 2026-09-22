import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/authContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getStats } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  Newspaper, Calendar, Megaphone, FolderTree,
  Users, Image as ImageIcon, LayoutDashboard, LogOut,
  ChevronRight, Bell, Briefcase, Moon, Sun,
  ClipboardList, GraduationCap, FileText, Sparkles, AlertCircle, ArrowRight
} from 'lucide-react';
import AdminChart from '../components/AdminChart';

function SidebarItem({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
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

/**
 * StatCardFriendly: tarjeta grande de estadistica con lenguaje humano.
 */
function StatCardFriendly({ icon: Icon, label, count, help, color = 'bg-primary' }) {
  return (
    <Link
      to={help}
      className="group bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border p-5 shadow-sm hover-lift transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center press-feedback`}>
          <Icon size={22} />
        </div>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-dark-text">{count}</p>
      <p className="text-sm font-semibold text-slate-700 dark:text-dark-text-muted mt-1">{label}</p>
    </Link>
  );
}

StatCardFriendly.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  help: PropTypes.string.isRequired,
  color: PropTypes.string,
};

/**
 * AlertCard: notificacion proactiva (tramites pendientes, etc.)
 */
function AlertCard({ icon: Icon, title, message, actionLabel, actionLink, color = 'amber' }) {
  const colors = {
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200',
  };
  const iconColors = {
    amber: 'text-amber-500',
    red: 'text-red-500',
    blue: 'text-blue-500',
  };
  return (
    <Link
      to={actionLink}
      className={`block border-2 rounded-xl p-4 ${colors[color]} hover-lift press-feedback transition`}
    >
      <div className="flex items-start gap-3">
        <Icon size={22} className={`flex-shrink-0 mt-0.5 ${iconColors[color]}`} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base">{title}</p>
          <p className="text-sm mt-0.5 opacity-80">{message}</p>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold flex-shrink-0">
          {actionLabel}
          <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}

AlertCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  actionLabel: PropTypes.string.isRequired,
  actionLink: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['amber', 'red', 'blue']),
};

/**
 * ActionCard: tarjeta grande de accion rapida.
 */
function ActionCard({ to, icon: Icon, title, description, color }) {
  const colors = {
    blue:   'from-blue-500 to-blue-700',
    red:    'from-red-500 to-red-700',
    amber:  'from-amber-500 to-amber-600',
    purple: 'from-indigo-500 to-indigo-700',
    emerald:'from-emerald-500 to-emerald-700',
  };
  return (
    <Link
      to={to}
      className={`group block bg-gradient-to-br ${colors[color] || colors.blue} text-white rounded-xl p-5 hover-lift press-feedback transition cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon size={24} />
        </div>
        <ArrowRight size={18} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
      <p className="font-extrabold text-lg">{title}</p>
      <p className="text-sm opacity-90 mt-1">{description}</p>
    </Link>
  );
}

ActionCard.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'red', 'amber', 'purple', 'emerald']),
};

function SaludoHeader({ usuario }) {
  const hora = new Date().getHours();
  let saludo = 'Buenas noches';
  if (hora >= 6 && hora < 12) saludo = 'Buenos días';
  else if (hora >= 12 && hora < 19) saludo = 'Buenas tardes';

  const fecha = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-slate-500 dark:text-dark-text-muted text-sm">
        <Sparkles size={14} className="text-primary" />
        <span className="capitalize">{fecha}</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-dark-text mt-1">
        {saludo}, {usuario?.username || 'Admin'} 👋
      </h1>
      <p className="text-slate-600 dark:text-dark-text-muted mt-1">
        Esto es lo que está pasando en tu web hoy.
      </p>
    </div>
  );
}

SaludoHeader.propTypes = {
  usuario: PropTypes.object,
};

function Admin() {
  const { usuario, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStats();
        setStats(res.data || null);
      } catch (err) {
        toast.error('No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === `/admin/${path}` || (path === '' && location.pathname === '/admin');

  // Generar alertas proactivas basadas en los datos
  const alertas = useMemo(() => {
    if (!stats) return [];
    const out = [];
    if (stats.pendientes?.mesa_partes > 0) {
      out.push({
        icon: ClipboardList,
        title: `${stats.pendientes.mesa_partes} trámite${stats.pendientes.mesa_partes === 1 ? '' : 's'} esperando respuesta`,
        message: 'Los ciudadanos están esperando. Atender pronto mejora la imagen institucional.',
        actionLabel: 'Ver trámites',
        actionLink: 'mesa-partes',
        color: stats.pendientes.mesa_partes > 5 ? 'red' : 'amber',
      });
    }
    if (stats.pendientes?.admisiones_esta_semana > 0) {
      out.push({
        icon: GraduationCap,
        title: `${stats.pendientes.admisiones_esta_semana} solicitud${stats.pendientes.admisiones_esta_semana === 1 ? '' : 'es'} de admisión esta semana`,
        message: 'Revisa y contacta a las familias interesadas lo antes posible.',
        actionLabel: 'Ver admisiones',
        actionLink: '/admin/mesa-partes',
        color: 'blue',
      });
    }
    return out;
  }, [stats]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-dark-bg">
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
          <SidebarItem to="/admin" icon={LayoutDashboard} label="Inicio" active={location.pathname === '/admin'} />
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
              <SidebarItem to="config-inicio" icon={Sparkles} label="Personalizar" active={isActive('config-inicio')} />
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

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-slate-50 dark:bg-dark-bg">
        <SaludoHeader usuario={usuario} />

        {/* Alertas proactivas */}
        {alertas.length > 0 && (
          <div className="mb-6 space-y-3">
            {alertas.map((a, i) => (
              <AlertCard key={i} {...a} />
            ))}
          </div>
        )}

        {/* Acciones rápidas grandes */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-wider mb-3">
            ¿Qué quieres hacer hoy?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              to="noticias"
              icon={Newspaper}
              title="Publicar noticia"
              description="Cuenta algo nuevo a las familias"
              color="blue"
            />
            <ActionCard
              to="eventos"
              icon={Calendar}
              title="Agendar evento"
              description="Ceremonias, reuniones, actividades"
              color="red"
            />
            <ActionCard
              to="comunicados"
              icon={Megaphone}
              title="Crear comunicado"
              description="Avisos, circulares, alertas"
              color="amber"
            />
            <ActionCard
              to="mesa-partes"
              icon={FileText}
              title="Ver trámites"
              description={`${stats?.pendientes?.mesa_partes || 0} pendientes`}
              color="purple"
            />
          </div>
        </div>

        {/* Estadísticas con labels amigables */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-wider mb-3">
            Tu web en números
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCardFriendly
              icon={Newspaper}
              label="Noticias"
              count={loading ? '…' : (stats?.contadores?.noticias || 0)}
              help="noticias"
              color="bg-primary"
            />
            <StatCardFriendly
              icon={Calendar}
              label="Eventos"
              count={loading ? '…' : (stats?.contadores?.eventos || 0)}
              help="eventos"
              color="bg-red-600"
            />
            <StatCardFriendly
              icon={Megaphone}
              label="Comunicados"
              count={loading ? '…' : (stats?.contadores?.comunicados || 0)}
              help="comunicados"
              color="bg-amber-500"
            />
            <StatCardFriendly
              icon={Users}
              label="Docentes"
              count={loading ? '…' : (stats?.contadores?.docentes || 0)}
              help="docentes"
              color="bg-emerald-600"
            />
            <StatCardFriendly
              icon={Briefcase}
              label="Personal"
              count={loading ? '…' : (stats?.contadores?.administrativos || 0)}
              help="administrativos"
              color="bg-indigo-600"
            />
            <StatCardFriendly
              icon={ImageIcon}
              label="Fotos"
              count={loading ? '…' : (stats?.contadores?.galeria || 0)}
              help="galeria"
              color="bg-pink-600"
            />
          </div>
        </div>

        {/* Gráficos */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <div className="h-[340px]">
              <AdminChart data={stats.tendencia_mensual} title="Publicaciones por Mes" type="area" color="#003087" />
            </div>
            <div className="h-[340px]">
              <AdminChart data={stats.comunicados_por_dia} title="Comunicados por Día" type="line" color="#DC2626" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
