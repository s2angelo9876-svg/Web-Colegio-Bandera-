import { useState, useEffect, useCallback } from 'react';
import {
  getActivityLog, getActivityLogStats, API,
} from '../services/api';
import {
  Activity, Search, RefreshCw, ChevronLeft, ChevronRight,
  PlusCircle, Edit2, Trash2, ArrowUpDown, Filter, Clock, User,
  Download, BarChart3, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import { successMsg, errorMsg } from '../utils/sweetalert';

const ACCIONES = [
  { value: '',       label: 'Todas las acciones' },
  { value: 'crear',    label: 'Creaciones' },
  { value: 'editar',   label: 'Ediciones' },
  { value: 'eliminar', label: 'Eliminaciones' },
  { value: 'reordenar',label: 'Reordenamientos' },
];

const ENTIDADES = [
  { value: '',           label: 'Todas las secciones' },
  { value: 'noticia',     label: 'Noticias' },
  { value: 'evento',      label: 'Eventos' },
  { value: 'comunicado',  label: 'Comunicados' },
  { value: 'docente',     label: 'Docentes' },
  { value: 'galeria',     label: 'Galería' },
  { value: 'carrusel',    label: 'Carrusel' },
  { value: 'mesa_partes', label: 'Mesa de partes' },
];

function getActionBadge(action) {
  switch (action) {
    case 'crear':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><PlusCircle className="w-3 h-3" /> Crear</span>;
    case 'editar':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Edit2 className="w-3 h-3" /> Editar</span>;
    case 'eliminar':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><Trash2 className="w-3 h-3" /> Eliminar</span>;
    case 'reordenar':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"><ArrowUpDown className="w-3 h-3" /> Reordenar</span>;
    default:
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{action}</span>;
  }
}

function getEntityBadge(entity) {
  const colors = {
    noticia: 'bg-blue-50 text-blue-700 border-blue-200',
    evento: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    comunicado: 'bg-amber-50 text-amber-700 border-amber-200',
    docente: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    galeria: 'bg-pink-50 text-pink-700 border-pink-200',
    carrusel: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    mesa_partes: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors[entity] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {entity}
    </span>
  );
}

export default function AdminActividad() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [qFilter, setQFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const cargarLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getActivityLog({
        page,
        limit: 20,
        user: userFilter || undefined,
        action: actionFilter || undefined,
        entity: entityFilter || undefined,
        q: qFilter || undefined,
        from: fromFilter || undefined,
        to: toFilter || undefined,
      });
      setLogs(res.data?.data || []);
      setPagination(res.data?.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      errorMsg('No se pudo cargar el log', err.response?.data?.error || 'Error de conexion');
    } finally {
      setLoading(false);
    }
  }, [page, userFilter, actionFilter, entityFilter, qFilter, fromFilter, toFilter]);

  const cargarStats = useCallback(async () => {
    try {
      const res = await getActivityLogStats(30);
      setStats(res.data);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => { cargarLogs(); }, [cargarLogs]);
  useEffect(() => { if (showStats) cargarStats(); }, [showStats, cargarStats]);

  const toggleDetalle = async (log) => {
    if (expandedId === log.id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(log.id);
    try {
      const res = await API.get(`/activity-log/${log.id}`);
      setDetail(res.data);
    } catch {
      setDetail({ ...log, details: log.details });
    }
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (userFilter) params.set('user', userFilter);
    if (actionFilter) params.set('action', actionFilter);
    if (entityFilter) params.set('entity', entityFilter);
    if (qFilter) params.set('q', qFilter);
    if (fromFilter) params.set('from', fromFilter);
    if (toFilter) params.set('to', toFilter);
    const token = localStorage.getItem('token');
    const url = `${API.defaults.baseURL}/activity-log/export/csv?${params.toString()}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url2 = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url2;
        a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url2);
        successMsg('Descarga iniciada', 'El archivo CSV se esta descargando.');
      })
      .catch(() => errorMsg('Error al exportar', 'No se pudo generar el CSV.'));
  };

  const limpiarFiltros = () => {
    setUserFilter('');
    setActionFilter('');
    setEntityFilter('');
    setQFilter('');
    setFromFilter('');
    setToFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded mb-2">
            <Activity className="w-3 h-3" />
            Auditoria
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Registro de Actividad
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historial cronologico de cambios con filtros y exporte CSV.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowStats(s => !s)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition active:scale-95"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {showStats ? 'Ocultar' : 'Ver'} estadisticas
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={cargarLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadisticas */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Por accion (ult. 30 dias)</p>
            <div className="space-y-2">
              {stats.porAccion.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 capitalize">{a.action}</span>
                  <span className="font-bold text-primary">{a.n}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Por usuario (top 10)</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {stats.porUsuario.map((u, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 truncate max-w-[120px]" title={u.username}>{u.username}</span>
                  <span className="font-bold text-primary">{u.n}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Por dia</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {stats.porDia.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-slate-700">{d.dia}</span>
                  <span className="font-bold text-primary">{d.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar (titulo, detalle, usuario)..."
              value={qFilter}
              onChange={(e) => { setQFilter(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <input
            type="text"
            placeholder="Usuario..."
            value={userFilter}
            onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
          >
            {ACCIONES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
          >
            {ENTIDADES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={fromFilter}
              onChange={(e) => { setFromFilter(e.target.value); setPage(1); }}
              title="Desde"
              className="flex-1 px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="date"
              value={toFilter}
              onChange={(e) => { setToFilter(e.target.value); setPage(1); }}
              title="Hasta"
              className="flex-1 px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="button"
              onClick={limpiarFiltros}
              title="Limpiar filtros"
              className="px-2 py-2 text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Listado */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Cargando...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No hay actividad registrada con esos filtros.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map(log => {
              const isExpanded = expandedId === log.id;
              return (
                <div key={log.id} className="hover:bg-slate-50 transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleDetalle(log)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getActionBadge(log.action)}
                        <span className="text-sm font-semibold text-slate-900 truncate max-w-md" title={log.entity_title}>
                          {log.entity_title}
                        </span>
                        {getEntityBadge(log.entity_type)}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(log.created_at).toLocaleString('es-PE')}</span>
                        <span>•</span>
                        <span className="font-semibold">{log.username}</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pl-16">
                      {detail && detail.id === log.id ? (
                        <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div><span className="font-bold text-slate-500">ID:</span> {detail.id}</div>
                            <div><span className="font-bold text-slate-500">Fecha:</span> {new Date(detail.created_at).toLocaleString('es-PE')}</div>
                            <div><span className="font-bold text-slate-500">Usuario:</span> {detail.username} (ID {detail.user_id})</div>
                            <div><span className="font-bold text-slate-500">Tipo:</span> {detail.entity_type} (ID {detail.entity_id})</div>
                          </div>
                          <div className="pt-2 border-t border-slate-200">
                            <p className="font-bold text-slate-500 mb-1">Detalle de cambios:</p>
                            <pre className="bg-white border border-slate-200 rounded p-2 overflow-x-auto text-[11px] text-slate-700">
                              {typeof detail.details === 'object' && detail.details !== null
                                ? JSON.stringify(detail.details, null, 2)
                                : detail.details || '(sin detalle)'}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">Cargando detalle...</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paginacion */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Total: <strong>{pagination.total}</strong> actividades</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2">Pag {page} / {pagination.totalPages}</span>
            <button
              type="button"
              disabled={page === pagination.totalPages}
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
