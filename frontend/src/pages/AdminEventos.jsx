import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API, getEventos } from '../services/api';
import Swal from 'sweetalert2';
import {
  AdminPageHeader, FormCard, TextField, TextAreaField,
  SearchBar, Pagination, ActionButtons
} from '../components/AdminUI';
import { Calendar, MapPin, Clock, CalendarDays } from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const initialForm = { titulo: '', descripcion: '', fecha_evento: '', hora_evento: '', lugar: '' };

function SkeletonRows({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-10 w-16 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-3/4 mb-2" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  ));
}

SkeletonRows.propTypes = { count: PropTypes.number };

function AdminEventos() {
  const [eventos, setEventos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [enviando, setEnviando] = useState(false);

  const cargarEventos = useCallback(async (page = 1) => {
    setCargando(true);
    try {
      const res = await getEventos({ page, limit: 12 });
      setEventos(res.data?.data || res.data || []);
      setPagination(prev => ({ ...prev, totalPages: res.data?.pagination?.totalPages || 1 }));
    } catch { /* ignore error */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarEventos(); }, [cargarEventos]);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setShowForm(false);
    setEditMode(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      if (editMode) {
        await API.put(`/eventos/${editMode}`, form);
        Toast.fire({ icon: 'success', title: 'Evento actualizado' });
      } else {
        await API.post('/eventos', form);
        Toast.fire({ icon: 'success', title: 'Evento agendado' });
      }
      resetForm();
      cargarEventos();
    } catch {
      Swal.fire('Error', 'No se pudo guardar el evento', 'error');
    } finally { setEnviando(false); }
  };

  const handleEliminar = useCallback((id) => {
    Swal.fire({
      title: '¿Eliminar evento?',
      text: 'Desaparecerá del calendario público',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/eventos/${id}`);
          Toast.fire({ icon: 'success', title: 'Eliminado' });
          cargarEventos();
        } catch { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
      }
    });
  }, [cargarEventos]);

  const prepararEdicion = useCallback((ev) => {
    setEditMode(ev.id);
    setForm({
      titulo: ev.titulo,
      descripcion: ev.descripcion,
      fecha_evento: ev.fecha_evento,
      hora_evento: ev.hora_evento,
      lugar: ev.lugar
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const eventosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return eventos;
    const q = busqueda.toLowerCase();
    return eventos.filter(e => (e.titulo || '').toLowerCase().includes(q));
  }, [eventos, busqueda]);

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <AdminPageHeader
        title="Agenda Escolar"
        subtitle="Planificación Anual"
        badge={<CalendarDays size={11} />}
        onButtonClick={() => showForm ? resetForm() : setShowForm(true)}
        formOpen={showForm}
        addButtonLabel="Agendar Evento"
      />

      {showForm && (
        <FormCard
          title={editMode ? 'Editar Evento' : 'Nuevo Evento'}
          icon={<Calendar size={14} />}
          onSubmit={handleSubmit}
          submitting={enviando}
          submitLabel={editMode ? 'Actualizar' : 'Guardar'}
          onCancel={resetForm}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              id="titulo" name="titulo" label="Nombre del Evento"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Ceremonia de Graduación" required
            />
            <TextField
              id="lugar" name="lugar" label="Ubicación"
              value={form.lugar}
              onChange={(e) => setForm({ ...form, lugar: e.target.value })}
              placeholder="Ej: Auditorio Principal" required
              icon={MapPin}
            />
            <TextField
              id="fecha_evento" name="fecha_evento" label="Fecha"
              value={form.fecha_evento}
              onChange={(e) => setForm({ ...form, fecha_evento: e.target.value })}
              type="date" required
              icon={Calendar}
            />
            <TextField
              id="hora_evento" name="hora_evento" label="Hora"
              value={form.hora_evento}
              onChange={(e) => setForm({ ...form, hora_evento: e.target.value })}
              type="time" required
              icon={Clock}
            />
            <div className="md:col-span-2">
              <TextAreaField
                id="descripcion" name="descripcion" label="Descripción"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Detalle del evento..." rows={4}
              />
            </div>
          </div>
        </FormCard>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-4">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
              <Calendar size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Eventos</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{eventosFiltrados.length} programados</p>
            </div>
          </div>
          <div className="w-full sm:w-72">
            <SearchBar
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar evento..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Lugar</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <SkeletonRows count={3} />
              ) : eventosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    No hay eventos programados
                  </td>
                </tr>
              ) : (
                eventosFiltrados.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-slate-900">
                        {ev.fecha_evento ? new Date(ev.fecha_evento).toLocaleDateString('es-PE') : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{ev.titulo}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{ev.descripcion}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600">{ev.hora_evento?.slice(0, 5) || '-'} hrs</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600 line-clamp-1">{ev.lugar || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onEdit={() => prepararEdicion(ev)}
                        onDelete={() => handleEliminar(ev.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => cargarEventos(p)}
      />
    </div>
  );
}

export default AdminEventos;
