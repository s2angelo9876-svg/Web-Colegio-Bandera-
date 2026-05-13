import { useEffect, useState } from 'react'
import { useAuth } from '../context/authContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
// Importamos todas las funciones necesarias de api.js
import {
  getNoticias,
  getEventos,
  getComunicados,
  API
} from '../services/api'

import {
  Newspaper, Calendar, Megaphone, FolderTree,
  Users, Image as ImageIcon, LayoutDashboard, LogOut,
  ChevronRight, Bell, Loader2, Briefcase, ArrowUpRight, Clock, Settings
} from 'lucide-react'
import AdminChart from '../components/AdminChart';

// Datos Mock para los gráficos
const trendData = [
  { name: 'Ene', valor: 4 },
  { name: 'Feb', valor: 7 },
  { name: 'Mar', valor: 5 },
  { name: 'Abr', valor: 12 },
  { name: 'May', valor: 9 },
  { name: 'Jun', valor: 15 },
];

const distributionData = [
  { name: 'Lun', valor: 2 },
  { name: 'Mar', valor: 5 },
  { name: 'Mie', valor: 3 },
  { name: 'Jue', valor: 8 },
  { name: 'Vie', valor: 6 },
];

// Componente para los ítems del Sidebar
function SidebarItem({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
        ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 font-black scale-[1.02]'
        : 'text-blue-200/50 hover:bg-white/5 hover:text-white font-bold'
        }`}
    >
      <Icon size={18} className={`${active ? 'text-white' : 'text-blue-300/40 group-hover:text-white transition-colors'}`} />
      <span className="text-[12px] tracking-wide z-10 uppercase">{label}</span>
      {active && (
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 rounded-l-md animate-pulse"></div>
      )}
    </Link>
  )
}
function Admin() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [currentTime, setCurrentTime] = useState(new Date())

  // --- ESTADO PARA ESTADÍSTICAS REALES ---
  const [stats, setStats] = useState({
    noticias: 0,
    eventos: 0,
    comunicados: 0,
    cargando: true
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        const resultados = await Promise.allSettled([
          getNoticias(),
          getEventos(),
          getComunicados()
        ]);

        const [resNoticias, resEventos, resComunicados] = resultados;

        setStats({
          noticias: resNoticias.status === 'fulfilled' ? (resNoticias.value.data?.length || 0) : 0,
          eventos: resEventos.status === 'fulfilled' ? (resEventos.value.data?.length || 0) : 0,
          comunicados: resComunicados.status === 'fulfilled' ? (resComunicados.value.data?.length || 0) : 0,
          cargando: false
        });

      } catch (error) {
        console.error("Error crítico en estadísticas:", error);
        setStats(prev => ({ ...prev, cargando: false }));
      }
    };

    fetchRealStats();
  }, []);

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === `/admin/${path}` || (path === '' && location.pathname === '/admin')

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      {/* SIDEBAR FIJO ULTRA-PREMIUM */}
      <aside className="w-72 bg-[#001D52] flex flex-col p-6 sticky top-0 h-screen shadow-[10px_0_40px_rgba(0,0,0,0.1)] z-30">
        <div className="mb-12 px-2 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/40 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tighter uppercase leading-none">
              Bandera <br /> <span className="text-red-500 text-[10px] tracking-[0.3em] font-bold">CONTROL</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar pr-2">
          <p className="text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em] px-4 mb-4 mt-2">Navegación Principal</p>
          <SidebarItem to="/admin" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/admin'} />
          <SidebarItem to="noticias" icon={Newspaper} label="Noticias" active={isActive('noticias')} />
          <SidebarItem to="eventos" icon={Calendar} label="Eventos" active={isActive('eventos')} />
          <SidebarItem to="comunicados" icon={Megaphone} label="Comunicados" active={isActive('comunicados')} />

          <p className="text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em] px-4 mt-10 mb-4">Institucional</p>
          <SidebarItem to="transparencia" icon={FolderTree} label="Transparencia" active={isActive('transparencia')} />

          {usuario?.rol === 'admin' && (
            <>
              <SidebarItem to="docentes" icon={Users} label="Docentes" active={isActive('docentes')} />
              <SidebarItem to="administrativos" icon={Briefcase} label="Administrativos" active={isActive('administrativos')} />
              <SidebarItem to="galeria" icon={ImageIcon} label="Galería" active={isActive('galeria')} />
              <SidebarItem to="config-inicio" icon={Settings} label="Personalizar Inicio" active={isActive('config-inicio')} />
            </>
          )}
        </nav>

        {/* Perfil y Logout con Glassmorphism */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 mb-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all cursor-default">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center text-white font-black shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform">
              {usuario?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white leading-none tracking-tight">{usuario?.username}</span>
              <span className="text-[10px] text-blue-300/60 uppercase font-bold tracking-widest mt-1">{usuario?.rol}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-[0.2em] border border-transparent hover:border-red-500/20"
          >
            <LogOut size={16} />
            Desconectar
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative">
        {/* Decorative background mesh */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 relative z-10 gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3 text-[#003087] font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 w-fit px-4 py-2 rounded-full border border-blue-100/50">
              <Clock size={14} className="animate-pulse" />
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-4">
              Dashboard
            </h2>
            <p className="text-gray-400 font-bold text-lg flex items-center gap-2">
              Bienvenido de vuelta, <span className="text-gray-800">{usuario?.username}</span>
            </p>
          </div>

          <div className="flex gap-4 animate-in fade-in slide-in-from-right duration-700">
            <button className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#003087] hover:border-blue-200 transition-all shadow-sm hover:shadow-xl group">
              <Bell size={24} className="group-hover:rotate-12 transition-transform" />
            </button>
            <Link to="/" className="flex items-center gap-3 px-8 py-4 bg-[#003087] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-900/30 hover:bg-blue-900 transition-all active:scale-95 group">
              Previsualizar Portal
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </header>

        {/* Grid de Stats MEJORADAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
          <StatCard
            label="Noticias Publicadas"
            count={stats.noticias}
            loading={stats.cargando}
            icon={<Newspaper size={26} />}
            color="text-blue-600"
            bg="bg-blue-600"
            footer="Tendencia Mensual"
          />
          <StatCard
            label="Próximos Eventos"
            count={stats.eventos}
            loading={stats.cargando}
            icon={<Calendar size={26} />}
            color="text-red-600"
            bg="bg-red-600"
            footer="Calendario Escolar"
          />
          <StatCard
            label="Comunicados"
            count={stats.comunicados}
            loading={stats.cargando}
            icon={<Megaphone size={26} />}
            color="text-yellow-500"
            bg="bg-yellow-500"
            footer="Avisos a la comunidad"
          />
        </div>

        {/* SECCIÓN DE GRÁFICOS ULTRA-PREMIUM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="h-[400px]">
            <AdminChart
              data={trendData}
              title="Actividad de Publicaciones"
              type="area"
              color="#003087"
            />
          </div>
          <div className="h-[400px]">
            <AdminChart
              data={distributionData}
              title="Alcance de Comunicados"
              type="line"
              color="#DC2626"
            />
          </div>
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div className="relative z-10 bg-white/50 backdrop-blur-sm p-10 rounded-[3rem] border border-white">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-10 text-center">Acceso Directo a Módulos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <QuickAction to="noticias" color="blue" title="Redactar Noticia" icon={Newspaper} />
            <QuickAction to="eventos" color="red" title="Nuevo Evento" icon={Calendar} />
            <QuickAction to="comunicados" color="yellow" title="Subir Comunicado" icon={Megaphone} />
            <QuickAction to="galeria" color="purple" title="Gestionar Galería" icon={ImageIcon} />
            <QuickAction to="config-inicio" color="blue" title="Personalizar Web" icon={Settings} />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, count, loading, icon, color, bg, footer }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden relative">
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 ${bg}`}></div>
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className={`p-5 rounded-2xl ${bg} text-white group-hover:scale-110 transition-transform shadow-xl shadow-blue-900/10`}>
          {icon}
        </div>
        <ArrowUpRight className="text-gray-200 group-hover:text-gray-400 transition-colors" size={24} />
      </div>
      <div className="relative z-10">
        <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
        {loading ? (
          <div className="h-14 flex items-center">
            <div className="h-10 w-24 bg-slate-50 rounded-xl animate-pulse"></div>
          </div>
        ) : (
          <h3 className="text-6xl font-black text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-700 tracking-tighter">{count}</h3>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{footer}</span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-100" />
          <div className="w-2 h-2 rounded-full bg-blue-200" />
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function QuickAction({ to, color, title, icon: Icon }) {
  const colors = {
    blue: 'from-blue-600 to-blue-800 shadow-blue-900/20',
    red: 'from-red-600 to-red-800 shadow-red-900/20',
    yellow: 'from-yellow-500 to-orange-600 shadow-yellow-900/20',
    purple: 'from-purple-600 to-indigo-800 shadow-purple-900/20'
  }
  return (
    <Link to={to} className={`bg-gradient-to-br ${colors[color]} p-8 rounded-[2.2rem] text-white text-center font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:-translate-y-2 active:scale-95 shadow-2xl flex flex-col items-center justify-center gap-4 overflow-hidden relative group h-44`}>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
        <Icon size={30} />
      </div>
      <span className="relative z-10">{title}</span>
    </Link>
  )
}

export default Admin;
