import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API, getEventos } from '../services/api';
import { useToast } from '../context/ToastContext';
import Swal from 'sweetalert2';
import { successWithLink, errorMsg, confirmDelete } from '../utils/sweetalert';
import {
  AdminPageHeader, TextField, TextAreaField,
  SearchBar, Pagination, ActionButtons
} from '../components/AdminUI';
import Wizard from '../components/Wizard';
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
  const toast = useToast();
  const [eventos, setEventos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cargar eventos');
    } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarEventos(); }, [cargarEventos]);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setShowForm(false);
    setEditMode(null);
    setCurrentStep(0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.fecha_evento || !form.hora_evento || !form.lugar.trim()) {
      errorMsg('Faltan datos', 'El nombre, la fecha, hora y lugar son obligatorios.');
      setCurrentStep(form.fecha_evento && form.hora_evento && form.lugar ? 0 : 1);
      return;
    }
    setEnviando(true);
    try {
      if (editMode) {
        await API.put(`/eventos/${editMode}`, form);
        Toast.fire({ icon: 'success', title: 'Cambios guardados' });
      } else {
        await API.post('/eventos', form);
        successWithLink(
          '¡Evento agendado!',
          'Tu evento ya aparece en el calendario público de la web.',
          'https://colegio-bandera.vercel.app/eventos'
        );
      }
      resetForm();
      cargarEventos();
    } catch (err) {
      errorMsg('No se pudo guardar', err.response?.data?.error || 'Revisa los datos e intenta de nuevo.');
    } finally { setEnviando(false); }
  };

  const handleEliminar = useCallback((id) => {
    confirmDelete('este evento', async () => {
      try {
        await API.delete(`/eventos/${id}`);
        Toast.fire({ icon: 'success', title: 'Evento eliminado' });
        cargarEventos();
      } catch (err) {
        errorMsg('No se pudo eliminar', err.response?.data?.error || 'Intenta de nuevo en unos segundos.');
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
    setCurrentStep(0);
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
        <Wizard
          title={editMode ? 'Editar Evento' : 'Nuevo Evento'}
          editMode={!!editMode}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          submitting={enviando}
          submitLabel={editMode ? 'Guardar cambios' : 'Agendar evento'}
          steps={[
            {
              id: 'info',
              title: 'Información',
              description: 'Nombre y descripción',
              content: (
                <div className="space-y-4">
                  <div>
                    <TextField
                      id="titulo" name="titulo" label="Nombre del evento"
                      value={form.titulo}
                      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                      placeholder="Ej: Ceremonia de Graduación 2026"
                    />
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1.5 flex items-start gap-1">
                      <span className="text-primary">💡</span>
                      <span>El nombre del evento tal como aparecerá en el calendario público.</span>
                    </p>
                  </div>
                  <div>
                    <TextAreaField
                      id="descripcion" name="descripcion" label="Descripción"
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      placeholder="Cuenta de qué trata el evento, qué se necesita llevar, etc."
                      rows={8}
                    />
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1.5 flex items-start gap-1">
                      <span className="text-primary">💡</span>
                      <span>Opcional. Detalles útiles: qué llevar, dress code, requisitos, etc.</span>
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: 'cuando',
              title: 'Cuándo y dónde',
              description: 'Fecha, hora y lugar',
              content: (
                <div className="space-y-4">
                  <div>
                    <TextField
                      id="lugar" name="lugar" label="Lugar"
                      value={form.lugar}
                      onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                      placeholder="Ej: Auditorio Principal"
                      icon={MapPin}
                    />
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1.5 flex items-start gap-1">
                      <span className="text-primary">💡</span>
                      <span>Donde se realizará el evento. Sé específico para que los padres sepan llegar.</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <TextField
                        id="fecha_evento" name="fecha_evento" label="Fecha"
                        value={form.fecha_evento}
                        onChange={(e) => setForm({ ...form, fecha_evento: e.target.value })}
                        type="date"
                        icon={Calendar}
                      />
                    </div>
                    <div>
                      <TextField
                        id="hora_evento" name="hora_evento" label="Hora"
                        value={form.hora_evento}
                        onChange={(e) => setForm({ ...form, hora_evento: e.target.value })}
                        type="time"
                        icon={Clock}
                      />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              id: 'revisar',
              title: 'Revisar',
              description: 'Confirma los datos',
              content: (
                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Evento</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-dark-text mt-1">
                        {form.titulo || <em className="text-slate-400">Sin nombre</em>}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Fecha y hora</p>
                        <p className="text-sm text-slate-700 dark:text-dark-text-muted mt-1">
                          {form.fecha_evento || '—'} {form.hora_evento && `· ${form.hora_evento}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Lugar</p>
                        <p className="text-sm text-slate-700 dark:text-dark-text-muted mt-1">
                          {form.lugar || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-dark-text-muted text-center">
                    Si todo está bien, pulsa <strong>Agendar evento</strong>.
                  </p>
                </div>
              ),
            },
          ]}
        />
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


