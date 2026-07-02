import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API, UPLOADS_URL } from '../services/api';
import Swal from 'sweetalert2';
import {
  AdminPageHeader, SearchBar, ActionButtons
} from '../components/AdminUI';
import { FileText, Calendar, Phone, User, ClipboardList, MapPin, Mail, Download, CheckCircle, AlertCircle } from 'lucide-react';

const ESTADOS = [
  { value: 'Todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'resuelto', label: 'Resuelto' },
];

const estadoStyles = {
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  en_proceso: 'bg-blue-50 text-blue-700 border-blue-200',
  resuelto: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function SkeletonRows({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-32 mb-2" /><div className="h-2 bg-slate-50 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  ));
}

SkeletonRows.propTypes = { count: PropTypes.number };

function AdminMesaPartes() {
  const [tramites, setTramites] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const cargarTramites = useCallback(async () => {
    setCargando(true);
    try {
      const res = await API.get('/mesa-partes');
      setTramites(res.data || []);
    } catch { /* ignore error */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarTramites(); }, [cargarTramites]);

  const handleActualizarEstado = useCallback(async (id, nuevoEstado) => {
    try {
      await API.patch(`/mesa-partes/${id}/estado`, { estado: nuevoEstado });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Estado actualizado a ${nuevoEstado}`,
        showConfirmButton: false,
        timer: 2000
      });
      cargarTramites();
    } catch {
      Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
  }, [cargarTramites]);

  const handleEliminar = useCallback((id) => {
    Swal.fire({
      title: '¿Eliminar trámite?',
      text: 'Esta acción borrará permanentemente este expediente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/mesa-partes/${id}`);
          Toast.fire({ icon: 'success', title: 'Eliminado' });
          cargarTramites();
        } catch { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
      }
    });
  }, [cargarTramites]);

  const tramitesFiltrados = useMemo(() => {
    let items = tramites;
    if (filtroEstado !== 'Todos') {
      items = items.filter(t => t.estado === filtroEstado);
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      items = items.filter(t =>
        (t.asunto || '').toLowerCase().includes(q) ||
        (t.nombres_completos || '').toLowerCase().includes(q) ||
        (t.dni || '').includes(q)
      );
    }
    return items;
  }, [tramites, filtroEstado, busqueda]);

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <AdminPageHeader
        title="Mesa de Partes"
        subtitle="Bandeja de Entrada"
        badge={<ClipboardList size={11} />}
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Trámites</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{tramitesFiltrados.length} expedientes</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex gap-1.5">
              {ESTADOS.map(e => (
                <button
                  key={e.value}
                  onClick={() => setFiltroEstado(e.value)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    filtroEstado === e.value
                      ? 'bg-primary text-white'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-48">
              <SearchBar
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar trámite..."
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Exp.</th>
                <th className="px-4 py-3">Asunto / Remitente</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <SkeletonRows count={3} />
              ) : tramitesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    No hay expedientes en esta categoría
                  </td>
                </tr>
              ) : (
                tramitesFiltrados.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-slate-700">#{t.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{t.asunto}</p>
                      <p className="text-xs text-slate-500">{t.nombres_completos} · DNI {t.dni}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600">
                        {t.fecha_registro ? new Date(t.fecha_registro).toLocaleDateString('es-PE') : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={t.estado}
                        onChange={(e) => handleActualizarEstado(t.id, e.target.value)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider outline-none border cursor-pointer ${estadoStyles[t.estado] || estadoStyles.pendiente}`}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="resuelto">Resuelto</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onDelete={() => handleEliminar(t.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

export default AdminMesaPartes;
