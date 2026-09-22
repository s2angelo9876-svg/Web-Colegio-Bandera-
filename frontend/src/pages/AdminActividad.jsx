import { useState, useEffect, useCallback } from 'react';
import { getActivityLog } from '../services/api';
import {
  Activity, Search, RefreshCw, ChevronLeft, ChevronRight,
  PlusCircle, Edit2, Trash2, ArrowUpDown, Filter, Clock, User
} from 'lucide-react';

const ACCIONES = [
  { value: '', label: 'Todas las acciones' },
  { value: 'crear', label: 'Creaciones' },
  { value: 'editar', label: 'Ediciones' },
  { value: 'eliminar', label: 'Eliminaciones' },
  { value: 'reordenar', label: 'Reordenamientos' },
];

const ENTIDADES = [
  { value: '', label: 'Todas las secciones' },
  { value: 'noticia', label: 'Noticias' },
  { value: 'evento', label: 'Eventos' },
  { value: 'comunicado', label: 'Comunicados' },
  { value: 'docente', label: 'Docentes' },
  { value: 'galeria', label: 'Galería' },
  { value: 'carrusel', label: 'Carrusel' },
  { value: 'mesa_partes', label: 'Mesa de partes' },
];

function getActionBadge(action) {
  switch (action) {
    case 'crear':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <PlusCircle className="w-3 h-3" /> Crear
        </span>
      );
    case 'editar':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Edit2 className="w-3 h-3" /> Editar
        </span>
      );
    case 'eliminar':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <Trash2 className="w-3 h-3" /> Eliminar
        </span>
      );
    case 'reordenar':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <ArrowUpDown className="w-3 h-3" /> Reordenar
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {action}
        </span>
      );
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return { relative: '', full: '' };
  const date = new Date(dateStr);
  const now = new Date();
  const diffSecs = Math.floor((now - date) / 1000);

  let relative = '';
  if (diffSecs < 60) relative = 'Hace un momento';
  else if (diffSecs < 3600) relative = `Hace ${Math.floor(diffSecs / 60)} min`;
  else if (diffSecs < 86400) relative = `Hace ${Math.floor(diffSecs / 3600)} h`;
  else {
    const days = Math.floor(diffSecs / 86400);
    relative = days === 1 ? 'Ayer' : `Hace ${days} días`;
  }

  const full = date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return { relative, full };
}

export default function AdminActividad() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Filtros
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const cargarLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getActivityLog({
        page,
        limit: 20,
        user: userFilter || undefined,
        action: actionFilter || undefined,
        entity: entityFilter || undefined,
      });
      setLogs(res.data?.data || []);
      setPagination(res.data?.pagination || { total: 0, totalPages: 1 });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, userFilter, actionFilter, entityFilter]);

  useEffect(() => {
    cargarLogs();
  }, [cargarLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    cargarLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded mb-2">
            <Activity className="w-3 h-3" />
            Auditoría
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Registro de Actividad
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historial cronológico de cambios realizados en el portal por el equipo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => cargarLogs()}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Búsqueda usuario */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por usuario..."
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Filtro de acción */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {ACCIONES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          {/* Filtro de entidad */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {ENTIDADES.map((ent) => (
                <option key={ent.value} value={ent.value}>{ent.label}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Tabla / Lista */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
            Cargando historial de actividad...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No hay registros de actividad</p>
            <p className="text-xs text-slate-400 mt-1">
              Las acciones de creación, edición o eliminación aparecerán registradas aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Acción</th>
                  <th className="px-4 py-3">Sección</th>
                  <th className="px-4 py-3">Elemento Afectado</th>
                  <th className="px-4 py-3">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const { relative, full } = formatDateTime(log.created_at);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {relative}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {full}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-xs">
                          <User className="w-3 h-3 text-slate-500" />
                          {log.username}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="capitalize font-medium text-slate-700">
                          {log.entity_type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs truncate font-medium text-slate-900">
                        {log.entity_title || (log.entity_id ? `#${log.entity_id}` : '—')}
                      </td>
                      <td className="px-4 py-3.5 max-w-sm truncate text-slate-500">
                        {log.details || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs">
            <span className="text-slate-500">
              Total: <strong>{pagination.total}</strong> actividades (Página {page} de {pagination.totalPages})
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
