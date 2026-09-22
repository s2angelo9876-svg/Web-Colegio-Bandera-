import { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { API, getComunicados } from '../services/api';
import { useAuth } from '../context/authContext';
import { useToast } from '../context/ToastContext';
import Swal from 'sweetalert2';
import { successWithLink, errorMsg, confirmDelete } from '../utils/sweetalert';
import {
  AdminPageHeader, TextField,
  SearchBar, ActionButtons
} from '../components/AdminUI';
import Wizard from '../components/Wizard';
import RichTextEditor from '../components/RichTextEditor';
import StatusScheduler from '../components/StatusScheduler';
import LivePreviewModal from '../components/LivePreviewModal';
import {
  Megaphone, Tag, Check, Eye, Globe, FileClock,
  CalendarCheck, Sparkles
} from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

function SkeletonRows({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-12 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-3/4 mb-2" /><div className="h-2 bg-slate-50 rounded w-1/2" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
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

function AdminComunicados() {
  const { usuario } = useAuth();
  const toast = useToast();
  const [comunicados, setComunicados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [editMode, setEditMode] = useState(null);

  // Filtro de estado
  const [tabEstado, setTabEstado] = useState('todos');

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'aviso',
    estado: 'publicado',
    fecha_publicacion: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await API.get('/comunicados', {
        params: {
          admin: 'true',
          estado: tabEstado,
        },
      });
      setComunicados(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cargar comunicados');
    } finally {
      setCargando(false);
    }
  }, [tabEstado]);

  useEffect(() => { cargar(); }, [cargar]);

  const resetForm = useCallback(() => {
    setForm({
      titulo: '',
      descripcion: '',
      tipo: 'aviso',
      estado: 'publicado',
      fecha_publicacion: '',
    });
    setShowForm(false);
    setEditMode(null);
    setCurrentStep(0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      errorMsg('Faltan datos', 'El título y el cuerpo del comunicado son obligatorios.');
      setCurrentStep(1);
      return;
    }
    setEnviando(true);
    try {
      if (editMode) {
        await API.put(`/comunicados/${editMode}`, form);
        Toast.fire({ icon: 'success', title: 'Cambios guardados correctamente' });
      } else {
        await API.post('/comunicados', form);
        if (form.estado === 'publicado') {
          successWithLink(
            '¡Comunicado publicado!',
            'Tu comunicado ya aparece visible en la sección de Comunicados.',
            '/comunicados'
          );
        } else if (form.estado === 'borrador') {
          Toast.fire({ icon: 'info', title: 'Borrador guardado exitosamente' });
        } else {
          Toast.fire({ icon: 'success', title: 'Comunicado programado exitosamente' });
        }
      }
      resetForm();
      cargar();
    } catch (err) {
      errorMsg('No se pudo publicar', err.response?.data?.error || 'Revisa los datos e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = useCallback((id) => {
    confirmDelete('este comunicado', async () => {
      try {
        await API.delete(`/comunicados/${id}`);
        Toast.fire({ icon: 'success', title: 'Comunicado eliminado' });
        cargar();
      } catch (err) {
        errorMsg('No se pudo eliminar', err.response?.data?.error || 'Intenta de nuevo en unos segundos.');
      }
    });
  }, [cargar]);

  const prepararEdicion = useCallback((c) => {
    setEditMode(c.id);
    setForm({
      titulo: c.titulo || '',
      descripcion: c.descripcion || '',
      tipo: c.tipo || 'aviso',
      estado: c.estado || 'publicado',
      fecha_publicacion: c.fecha_publicacion || '',
    });
    setCurrentStep(0);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return comunicados;
    const q = busqueda.toLowerCase();
    return comunicados.filter(
      c => (c.titulo || '').toLowerCase().includes(q) || (c.descripcion || '').toLowerCase().includes(q)
    );
  }, [comunicados, busqueda]);

  return (
    <div className="p-6 lg:p-8 bg-slate-50 dark:bg-dark-bg min-h-screen">
      <AdminPageHeader
        title="Centro de Comunicados"
        subtitle="Comunicación Institucional"
        badge={<Megaphone size={11} />}
        onButtonClick={() => showForm ? resetForm() : setShowForm(true)}
        formOpen={showForm}
        addButtonLabel="Nuevo Comunicado"
      />

      {showForm && (
        <Wizard
          title={editMode ? 'Editar Comunicado' : 'Nuevo Comunicado'}
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
              ? 'Programar comunicado'
              : 'Publicar comunicado'
          }
          steps={[
            {
              id: 'tipo',
              title: 'Tipo y Asunto',
              description: 'Nivel de urgencia y titular',
              content: (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="tipo" className="block text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider mb-1.5">
                      Nivel de urgencia
                    </label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        id="tipo"
                        value={form.tipo}
                        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-700 dark:text-dark-text focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="aviso">Aviso General (Informativo cotidiano)</option>
                        <option value="circular">Circular Administrativa (Directivas y normativas)</option>
                        <option value="urgente">Alerta Urgente (Emergencias y avisos críticos)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <TextField
                      id="titulo" name="titulo" label="Título del comunicado"
                      value={form.titulo}
                      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                      placeholder="Ej: Suspensión de labores académicas por elecciones"
                      maxLength={120}
                    />
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1.5">
                      💡 Título claro y conciso para la comunidad educativa.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: 'contenido',
              title: 'Cuerpo del Comunicado',
              description: 'Editor visual enriquecido',
              content: (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider">
                      Cuerpo del comunicado (Texto enriquecido)
                    </label>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Sparkles size={12} className="text-primary" />
                      TipTap WYSIWYG
                    </span>
                  </div>
                  <RichTextEditor
                    value={form.descripcion}
                    onChange={(html) => setForm({ ...form, descripcion: html })}
                    placeholder="Escribe aquí el contenido completo del comunicado oficial..."
                  />
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

                  {/* Botón de vista previa */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-dark-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-dark-text flex items-center gap-2">
                        <Check size={16} className="text-emerald-500" />
                        Revisa la presentación
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-dark-text-muted">
                        Tipo: <strong className="capitalize">{form.tipo}</strong> — {form.titulo || 'Sin título'}
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

      {/* Modal de Live Preview */}
      <LivePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        tipo="comunicado"
        titulo={form.titulo}
        contenido={form.descripcion}
        fecha={form.fecha_publicacion || new Date().toISOString()}
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
            onClick={() => setTabEstado(tab.key)}
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

      <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-dark-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-primary">
              <Megaphone size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-dark-text uppercase tracking-wider">Comunicados</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{filtrados.length} registros</p>
            </div>
          </div>
          <div className="w-full sm:w-72">
            <SearchBar
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar comunicado..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-dark-border text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Comunicado</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {cargando ? (
                <SkeletonRows count={3} />
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    No hay comunicados en esta sección
                  </td>
                </tr>
              ) : (
                filtrados.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.tipo === 'urgente'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                          : c.tipo === 'circular'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        <Tag size={10} />
                        {c.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-dark-text line-clamp-1">{c.titulo}</p>
                      <p className="text-xs text-slate-500 dark:text-dark-text-muted line-clamp-1 mt-0.5">{c.descripcion?.replace(/<[^>]+>/g, '')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={c.estado} fechaPublicacion={c.fecha_publicacion} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600 dark:text-dark-text-muted">
                        {c.fecha_publicacion ? new Date(c.fecha_publicacion).toLocaleDateString('es-PE') : c.fecha ? new Date(c.fecha).toLocaleDateString('es-PE') : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onEdit={() => prepararEdicion(c)}
                        onDelete={usuario?.rol === 'admin' ? () => handleEliminar(c.id) : undefined}
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

export default AdminComunicados;
