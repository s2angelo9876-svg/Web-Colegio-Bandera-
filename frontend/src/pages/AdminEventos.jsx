import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API, getEventos } from '../services/api';
import { useAuth } from '../context/authContext';
import { useToast } from '../context/ToastContext';
import Swal from 'sweetalert2';
import { successWithLink, errorMsg, confirmDelete } from '../utils/sweetalert';
import {
  AdminPageHeader, TextField, TextAreaField,
  SearchBar, Pagination, ActionButtons
} from '../components/AdminUI';
import Wizard from '../components/Wizard';
import StatusScheduler from '../components/StatusScheduler';
import LivePreviewModal from '../components/LivePreviewModal';
import {
  Calendar, MapPin, Clock, CalendarDays, Check, Eye,
  Globe, FileClock, CalendarCheck
} from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const initialForm = {
  titulo: '',
  descripcion: '',
  fecha_evento: '',
  hora_evento: '',
  lugar: '',
  estado: 'publicado',
  fecha_publicacion: '',
};

function SkeletonRows({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-10 w-16 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-3/4 mb-2" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  ));
}

SkeletonRows.propTypes = { count: PropTypes.number };

function EstadoBadge({ estado, fechaPublicacion }) {
  if (estado === 'borrador') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
        <FileClock size={11} />
        Borrador
      </span>
    );
  }
  if (estado === 'programado') {
    const fStr = fechaPublicacion
      ? new Date(fechaPublicacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : '';
    return (
      <span
        title={`Se publicará: ${fStr}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
      >
        <CalendarCheck size={11} />
        Prog. {fStr}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
      <Globe size={11} />
      Publicado
    </span>
  );
}

EstadoBadge.propTypes = {
  estado: PropTypes.string,
  fechaPublicacion: PropTypes.string,
};

function AdminEventos() {
  const { usuario } = useAuth();
  const toast = useToast();
  const [eventos, setEventos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [editMode, setEditMode] = useState(null);

  // Filtro de estado
  const [tabEstado, setTabEstado] = useState('todos');

  const [form, setForm] = useState(initialForm);
  const [enviando, setEnviando] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const cargarEventos = useCallback(async (page = 1) => {
    setCargando(true);
    try {
      const res = await API.get('/eventos', {
        params: {
          page,
          limit: 12,
          admin: 'true',
          estado: tabEstado,
        },
      });
      setEventos(res.data?.data || res.data || []);
      setPagination(prev => ({ ...prev, totalPages: res.data?.pagination?.totalPages || 1 }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cargar eventos');
    } finally {
      setCargando(false);
    }
  }, [tabEstado]);

  useEffect(() => {
    cargarEventos(pagination.page);
  }, [pagination.page, cargarEventos]);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setShowForm(false);
    setEditMode(null);
    setCurrentStep(0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.fecha_evento || !form.hora_evento || !form.lugar.trim()) {
      errorMsg('Faltan datos', 'El nombre, la fecha, hora y lugar del evento son obligatorios.');
      setCurrentStep(form.fecha_evento && form.hora_evento && form.lugar ? 0 : 1);
      return;
    }
    setEnviando(true);
    try {
      if (editMode) {
        await API.put(`/eventos/${editMode}`, form);
        Toast.fire({ icon: 'success', title: 'Cambios guardados correctamente' });
      } else {
        await API.post('/eventos', form);
        if (form.estado === 'publicado') {
          successWithLink(
            '¡Evento agendado!',
            'Tu evento ya aparece en el calendario público de la web.',
            '/eventos'
          );
        } else if (form.estado === 'borrador') {
          Toast.fire({ icon: 'info', title: 'Borrador guardado exitosamente' });
        } else {
          Toast.fire({ icon: 'success', title: 'Evento programado exitosamente' });
        }
      }
      resetForm();
      cargarEventos(1);
    } catch (err) {
      errorMsg('No se pudo guardar', err.response?.data?.error || 'Revisa los datos e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = useCallback((id) => {
    confirmDelete('este evento', async () => {
      try {
        await API.delete(`/eventos/${id}`);
        Toast.fire({ icon: 'success', title: 'Evento eliminado' });
        cargarEventos(pagination.page);
      } catch (err) {
        errorMsg('No se pudo eliminar', err.response?.data?.error || 'Intenta de nuevo en unos segundos.');
      }
    });
  }, [cargarEventos, pagination.page]);

  const prepararEdicion = useCallback((ev) => {
    setEditMode(ev.id);
    setForm({
      titulo: ev.titulo || '',
      descripcion: ev.descripcion || '',
      fecha_evento: ev.fecha_evento ? ev.fecha_evento.slice(0, 10) : '',
      hora_evento: ev.hora_evento || '',
      lugar: ev.lugar || '',
      estado: ev.estado || 'publicado',
      fecha_publicacion: ev.fecha_publicacion || '',
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

  const handlePageChange = useCallback((newPage) => {
    setPagination(p => ({ ...p, page: newPage }));
  }, []);

  return (
    <div className="p-6 lg:p-8 bg-slate-50 dark:bg-dark-bg min-h-screen">
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
          submitLabel={
            editMode
              ? 'Guardar cambios'
              : form.estado === 'borrador'
              ? 'Guardar borrador'
              : form.estado === 'programado'
              ? 'Programar evento'
              : 'Publicar evento'
          }
          steps={[
            {
              id: 'que',
              title: '¿Qué pasará?',
              description: 'Nombre y detalles',
              content: (
                <div className="space-y-4">
                  <div>
                    <TextField
                      id="titulo" name="titulo" label="Nombre del evento"
                      value={form.titulo}
                      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                      placeholder="Ej: Ceremonia de Graduación 2026"
                      maxLength={100}
                    />
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1.5">
                      💡 El nombre principal con el que los padres y alumnos reconocerán el evento.
                    </p>
                  </div>

                  <div>
                    <TextAreaField
                      id="descripcion" name="descripcion" label="Detalles del evento (opcional)"
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      placeholder="Programa, participantes, vestimenta requerida o notas importantes..."
                      rows={5}
                    />
                  </div>
                </div>
              ),
            },
            {
              id: 'cuando-donde',
              title: '¿Cuándo y Dónde?',
              description: 'Fecha, hora y lugar',
              content: (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <TextField
                        id="fecha_evento" name="fecha_evento" type="date" label="Fecha del evento"
                        value={form.fecha_evento}
                        onChange={(e) => setForm({ ...form, fecha_evento: e.target.value })}
                        icon={Calendar}
                      />
                    </div>
                    <div>
                      <TextField
                        id="hora_evento" name="hora_evento" type="time" label="Hora de inicio"
                        value={form.hora_evento}
                        onChange={(e) => setForm({ ...form, hora_evento: e.target.value })}
                        icon={Clock}
                      />
                    </div>
                  </div>

                  <div>
                    <TextField
                      id="lugar" name="lugar" label="¿Dónde se realizará?"
                      value={form.lugar}
                      onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                      placeholder="Ej: Patio de Honor, Auditorio Principal..."
                      icon={MapPin}
                    />
                  </div>
                </div>
              ),
            },
            {
              id: 'publicacion',
              title: 'Publicación y Revisión',
              description: 'Disponibilidad y vista previa',
              content: (
                <div className="space-y-6">
                  <StatusScheduler
                    estado={form.estado}
                    fechaPublicacion={form.fecha_publicacion}
                    onChangeEstado={(nuevoEstado) => setForm({ ...form, estado: nuevoEstado })}
                    onChangeFechaPublicacion={(nuevaFecha) => setForm({ ...form, fecha_publicacion: nuevaFecha })}
                  />

                  {/* Resumen y botón de vista previa */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-dark-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-dark-text flex items-center gap-2">
                        <Check size={16} className="text-emerald-500" />
                        Revisa la agenda
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-0.5">
                        {form.titulo || 'Sin nombre'} — {form.fecha_evento} ({form.hora_evento}) en {form.lugar || 'Lugar por definir'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      <Eye size={15} />
                      Vista previa en vivo
                    </button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Modal Live Preview */}
      <LivePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        tipo="evento"
        titulo={form.titulo}
        contenido={form.descripcion}
        fecha={form.fecha_evento}
        lugar={`${form.lugar || ''} ${form.hora_evento ? `(${form.hora_evento})` : ''}`}
        estado={form.estado}
      />

      {/* Pestañas de estado */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'publicado', label: 'Publicados' },
          { key: 'borrador', label: 'Borradores' },
          { key: 'programado', label: 'Programados' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setTabEstado(tab.key);
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              tabEstado === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-border hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm mb-4">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-dark-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-primary">
              <CalendarDays size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-dark-text uppercase tracking-wider">Eventos</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{eventosFiltrados.length} agendados</p>
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
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-dark-border text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3">Lugar / Hora</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {cargando ? (
                <SkeletonRows count={3} />
              ) : eventosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    No se encontraron eventos en esta sección
                  </td>
                </tr>
              ) : (
                eventosFiltrados.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="inline-flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-primary border border-blue-100 dark:border-blue-900">
                        <span className="text-xs font-extrabold">
                          {ev.fecha_evento ? new Date(ev.fecha_evento).getDate() : '--'}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          {ev.fecha_evento ? new Date(ev.fecha_evento).toLocaleDateString('es-PE', { month: 'short' }) : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-dark-text line-clamp-1">{ev.titulo}</p>
                      <p className="text-xs text-slate-500 dark:text-dark-text-muted line-clamp-1 mt-0.5">{ev.descripcion}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <MapPin size={11} className="text-primary" /> {ev.lugar || 'Por definir'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-dark-text-muted flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {ev.hora_evento || '--:--'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={ev.estado} fechaPublicacion={ev.fecha_publicacion} />
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onEdit={() => prepararEdicion(ev)}
                        onDelete={usuario?.rol === 'admin' ? () => handleEliminar(ev.id) : undefined}
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
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default AdminEventos;
