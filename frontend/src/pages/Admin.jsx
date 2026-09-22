import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/authContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getStats, getPageViewStats, getActivityLog } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { NotificationBell } from '../components/NotificationBell';
import HelpCenterModal from '../components/HelpCenterModal';
import WelcomeModal from '../components/WelcomeModal';
import TourGuide from '../components/TourGuide';
import {
  Newspaper, Calendar, Megaphone, FolderTree,
  Users, Image as ImageIcon, LayoutDashboard, LogOut,
  ChevronRight, Bell, Briefcase, Moon, Sun,
  ClipboardList, GraduationCap, FileText, Sparkles, AlertCircle, ArrowRight,
  UserCircle, UserCog, HelpCircle, Activity
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
    <div>
      <div className="flex items-center gap-2 text-slate-500 dark:text-dark-text-muted text-sm">
        <Sparkles size={14} className="text-primary" />
        <span className="capitalize">{fecha}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-dark-text mt-1">
        {saludo}, {usuario?.username || 'Admin'} 👋
      </h1>
      <p className="text-slate-600 dark:text-dark-text-muted mt-1 text-sm">
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
  const [pageViewStats, setPageViewStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, viewsRes, activityRes] = await Promise.allSettled([
          getStats(),
          getPageViewStats(),
          getActivityLog({ limit: 5 }),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || null);
        if (viewsRes.status === 'fulfilled') setPageViewStats(viewsRes.value.data || null);
        if (activityRes.status === 'fulfilled') setRecentActivity(activityRes.value.data?.data || []);
      } catch (err) {
        toast.error('No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
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
      <aside data-tour="dashboard-sidebar" className="w-64 bg-slate-900 flex flex-col p-5 sticky top-0 h-screen">
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
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mt-6 mb-2">Cuenta</p>
              <SidebarItem to="usuarios" icon={UserCog} label="Usuarios" active={isActive('usuarios')} />
              <SidebarItem to="actividad" icon={Activity} label="Actividad" active={isActive('actividad')} />
              <SidebarItem to="mi-cuenta" icon={UserCircle} label="Mi Cuenta" active={isActive('mi-cuenta')} />
            </>
          )}

          {/* Mi cuenta la ven todos los roles */}
          {usuario?.rol !== 'admin' && (
            <SidebarItem to="mi-cuenta" icon={UserCircle} label="Mi Cuenta" active={isActive('mi-cuenta')} />
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
        {/* Header con saludo y controles superiores */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div data-tour="dashboard-bienvenida" className="flex-1">
            <SaludoHeader usuario={usuario} />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-1 rounded-xl shadow-sm">
            <NotificationBell />
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              title="Ayuda y tours (tecla ?)"
              aria-label="Abrir centro de ayuda"
              className="p-2 text-slate-500 hover:text-primary dark:text-dark-text-muted dark:hover:text-dark-accent-text hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <HelpCircle size={20} />
            </button>
            <button
              type="button"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-dark-text-muted dark:hover:text-dark-text hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Alertas proactivas */}
        {alertas.length > 0 && (
          <div className="mb-6 space-y-3" data-tour="dashboard-alertas">
            {alertas.map((a, i) => (
              <AlertCard key={i} {...a} />
            ))}
          </div>
        )}

        {/* Acciones rápidas grandes */}
        <div className="mb-8" data-tour="dashboard-acciones">
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
        <div className="mb-8" data-tour="dashboard-stats">
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

        {/* Visitas al portal */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={14} className="text-primary" />
              Visitas al Portal
            </h2>
            <span className="text-[11px] text-slate-400">Páginas públicas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-wider">Hoy</span>
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <TrendingUp size={16} />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-dark-text">
                {pageViewStats ? pageViewStats.total_hoy.toLocaleString() : '…'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Visitas registradas hoy</p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-wider">Últimos 7 Días</span>
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <TrendingUp size={16} />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-dark-text">
                {pageViewStats ? pageViewStats.total_7d.toLocaleString() : '…'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Tráfico acumulado semanal</p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-wider">Últimos 30 Días</span>
                <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                  <TrendingUp size={16} />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-dark-text">
                {pageViewStats ? pageViewStats.total_30d.toLocaleString() : '…'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Tráfico acumulado del mes</p>
            </div>
          </div>

          {pageViewStats?.tendencia_7d && pageViewStats.tendencia_7d.length > 0 && (
            <div className="h-[340px]">
              <AdminChart
                data={pageViewStats.tendencia_7d}
                title="Visitas al Portal (Últimos 7 días)"
                type="area"
                color="#059669"
              />
            </div>
          )}
        </div>

        {/* Actividad reciente del equipo */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-primary" />
              Actividad Reciente del Equipo
            </h2>
            {usuario?.rol === 'admin' && (
              <Link
                to="actividad"
                className="text-xs text-primary hover:text-red-700 font-semibold flex items-center gap-1 transition"
              >
                Ver historial completo
                <ChevronRight size={14} />
              </Link>
            )}
          </div>

          <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-xl shadow-sm divide-y divide-slate-100 dark:divide-dark-border overflow-hidden">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No hay actividades recientes registradas aún.
              </div>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-dark-border/20 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-dark-text flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {item.username?.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-dark-text truncate">
                        <strong className="text-slate-900 dark:text-white">{item.username}</strong>{' '}
                        <span className="font-normal text-slate-600 dark:text-dark-text-muted">
                          {item.action === 'crear' && 'creó'}
                          {item.action === 'editar' && 'editó'}
                          {item.action === 'eliminar' && 'eliminó'}
                          {item.action === 'reordenar' && 'reordenó'}
                        </span>{' '}
                        <span className="capitalize">{item.entity_type?.replace('_', ' ')}</span>
                        {item.entity_title && (
                          <span className="text-slate-700 dark:text-dark-text font-medium"> &ldquo;{item.entity_title}&rdquo;</span>
                        )}
                      </p>
                      {item.details && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.details}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(item.created_at).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Gráficos institucionales */}
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

      {/* Centro de ayuda (boton ? del header) */}
      <HelpCenterModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Modal de bienvenida solo la primera vez */}
      <WelcomeModal />

      {/* Tour activo (spotlight + tarjeta) */}
      <TourGuide />
    </div>
  );
}

export default Admin;
