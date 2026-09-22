import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getNoticias, API, UPLOADS_URL } from '../services/api';
import { useAuth } from '../context/authContext';
import { useToast } from '../context/ToastContext';
import Swal from 'sweetalert2';
import { successWithLink, errorMsg, confirmDelete } from '../utils/sweetalert';
import {
  AdminPageHeader, TextField, ImageUploadField,
  SearchBar, Pagination, ActionButtons
} from '../components/AdminUI';
import Wizard from '../components/Wizard';
import RichTextEditor from '../components/RichTextEditor';
import TagSelector from '../components/TagSelector';
import StatusScheduler from '../components/StatusScheduler';
import LivePreviewModal from '../components/LivePreviewModal';
import {
  Type, Newspaper, Check, Eye, Globe, FileClock,
  CalendarCheck, Tag as TagIcon, Sparkles
} from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

function SkeletonRows({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => <SkeletonRow key={i} />);
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-12 w-20 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-3/4 mb-2" /><div className="h-2 bg-slate-50 rounded w-1/2" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  );
}

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

function AdminNoticias() {
  const { usuario } = useAuth();
  const toast = useToast();
  const [noticias, setNoticias] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [cargando, setCargando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  // Filtro por pestañas de estado
  const [tabEstado, setTabEstado] = useState('todos');

  // Campos del formulario
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [estado, setEstado] = useState('publicado');
  const [fechaPublicacion, setFechaPublicacion] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Modal de vista previa en tiempo real
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const cargarNoticias = useCallback(async (page = 1) => {
    setCargando(true);
    try {
      const res = await API.get('/noticias', {
        params: {
          page,
          limit: 10,
          admin: 'true',
          estado: tabEstado,
        },
      });
      setNoticias(res.data?.data || []);
      setPagination(prev => ({ ...prev, totalPages: res.data?.pagination?.totalPages || 1 }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cargar noticias');
    } finally {
      setCargando(false);
    }
  }, [tabEstado]);

  useEffect(() => {
    cargarNoticias(pagination.page);
  }, [pagination.page, cargarNoticias]);

  useEffect(() => {
    if (!imagen) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(imagen);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imagen]);

  const prepararEdicion = useCallback((n) => {
    setEditMode(n.id);
    setTitulo(n.titulo || '');
    setContenido(n.contenido || '');
    setPreview(n.imagen ? `${UPLOADS_URL}/${n.imagen}` : null);
    setEstado(n.estado || 'publicado');
    setFechaPublicacion(n.fecha_publicacion || '');
    setSelectedTagIds(Array.isArray(n.tags) ? n.tags.map(t => t.id) : []);
    setCurrentStep(0);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditMode(null);
    setTitulo('');
    setContenido('');
    setImagen(null);
    setPreview(null);
    setSelectedTagIds([]);
    setEstado('publicado');
    setFechaPublicacion('');
    setCurrentStep(0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) {
      errorMsg('Faltan datos', 'El titular y el contenido redactado son obligatorios.');
      setCurrentStep(0);
      return;
    }
    setEnviando(true);

    const formData = new FormData();
    formData.append('titulo', titulo.trim());
    formData.append('contenido', contenido);
    formData.append('estado', estado);
    if (fechaPublicacion) {
      formData.append('fecha_publicacion', fechaPublicacion);
    }
    formData.append('tags', JSON.stringify(selectedTagIds));
    if (imagen) formData.append('imagen', imagen);

    try {
      if (editMode) {
        await API.put(`/noticias/${editMode}`, formData);
        Toast.fire({ icon: 'success', title: 'Cambios guardados correctamente' });
      } else {
        await API.post('/noticias', formData);
        if (estado === 'publicado') {
          successWithLink(
            '¡Noticia publicada!',
            'Tu noticia ya está visible para todos los visitantes de la web.',
            '/noticias'
          );
        } else if (estado === 'borrador') {
          Toast.fire({ icon: 'info', title: 'Borrador guardado exitosamente' });
        } else {
          Toast.fire({ icon: 'success', title: 'Noticia programada exitosamente' });
        }
      }
      resetForm();
      cargarNoticias(1);
    } catch (err) {
      errorMsg('No se pudo guardar', err.response?.data?.error || 'Revisa tu conexión e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = useCallback((id) => {
    confirmDelete('esta noticia', async () => {
      try {
        await API.delete(`/noticias/${id}`);
        Toast.fire({ icon: 'success', title: 'Noticia eliminada' });
        cargarNoticias(pagination.page);
      } catch (err) {
        errorMsg('No se pudo eliminar', err.response?.data?.error || 'Intenta de nuevo en unos segundos.');
      }
    });
  }, [cargarNoticias, pagination.page]);

  const noticiasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return noticias;
    const q = busqueda.toLowerCase();
    return noticias.filter(n => (n.titulo || '').toLowerCase().includes(q));
  }, [noticias, busqueda]);

  const handlePageChange = useCallback((newPage) => {
    setPagination(p => ({ ...p, page: newPage }));
  }, []);

  return (
    <div className="p-6 lg:p-8 bg-slate-50 dark:bg-dark-bg min-h-screen">
      <AdminPageHeader
        title="Gestión de Noticias"
        subtitle="Gestión Editorial"
        badge={<Newspaper size={11} />}
        onButtonClick={() => showForm ? resetForm() : setShowForm(true)}
        formOpen={showForm}
        addButtonLabel="Nueva Noticia"
      />

      {showForm && (
        <Wizard
          title={editMode ? 'Editar Noticia' : 'Nueva Noticia'}
          editMode={!!editMode}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          submitting={enviando}
          submitLabel={
            editMode
              ? 'Guardar cambios'
              : estado === 'borrador'
              ? 'Guardar borrador'
              : estado === 'programado'
              ? 'Programar noticia'
              : 'Publicar noticia'
          }
          steps={[
            {
              id: 'basico',
              title: 'Titular y Portada',
              description: 'Título, foto y etiquetas',
              content: (
                <div className="space-y-5">
                  <div>
                    <TextField
                      id="titulo" name="titulo" label="¿Cuál es el titular de la noticia?"
                      value={titulo} onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej: Estudiantes obtienen 1er lugar en Feria Nacional de Ciencias"
                      maxLength={120} icon={Type}
                    />
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1.5 flex items-start gap-1">
                      <span className="text-primary">💡</span>
                      <span>Un titular claro, conciso y atractivo. Máximo 120 caracteres.</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1 text-right">{titulo.length}/120</p>
                  </div>

                  <div>
                    <ImageUploadField
                      id="imagen" label={editMode ? 'Cambiar imagen de portada (opcional)' : 'Imagen de portada'}
                      preview={preview}
                      onChange={(e) => setImagen(e.target.files[0])}
                      required={!editMode && !preview}
                    />
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1.5">
                      💡 Imagen destacada recomendada en formato horizontal (1200×630px).
                    </p>
                  </div>

                  <TagSelector
                    selectedTagIds={selectedTagIds}
                    onChange={setSelectedTagIds}
                  />
                </div>
              ),
            },
            {
              id: 'redaccion',
              title: 'Redacción',
              description: 'Editor visual enriquecido',
              content: (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider">
                      Cuerpo de la noticia (Texto enriquecido)
                    </label>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Sparkles size={12} className="text-primary" />
                      TipTap WYSIWYG
                    </span>
                  </div>
                  <RichTextEditor
                    value={contenido}
                    onChange={setContenido}
                    placeholder="Escribe aquí la historia completa... Puedes usar negritas, listas, subtítulos, citas destacadas y más."
                  />
                  <p className="text-xs text-slate-500 dark:text-dark-text-muted">
                    💡 Puedes usar la barra superior o atajos de teclado (Ctrl+B, Ctrl+I) para dar formato al contenido.
                  </p>
                </div>
              ),
            },
            {
              id: 'publicacion',
              title: 'Publicación y Revisión',
              description: 'Estado, fecha y vista previa',
              content: (
                <div className="space-y-6">
                  <StatusScheduler
                    estado={estado}
                    fechaPublicacion={fechaPublicacion}
                    onChangeEstado={setEstado}
                    onChangeFechaPublicacion={setFechaPublicacion}
                  />

                  {/* Resumen y botón de vista previa */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-dark-border rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-dark-text flex items-center gap-2">
                          <Check size={16} className="text-emerald-500" />
                          Revisa antes de confirmar
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-dark-text-muted">
                          {titulo ? `"${titulo}"` : 'Sin título'}
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
        tipo="noticia"
        titulo={titulo}
        contenido={contenido}
        imagenUrl={preview}
        fecha={fechaPublicacion || new Date().toISOString()}
        tags={selectedTagIds.map(id => String(id))}
        estado={estado}
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

      {/* Tabla de registros */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm mb-4">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-dark-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-primary">
              <Newspaper size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-dark-text uppercase tracking-wider">Registros</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{noticiasFiltradas.length} publicaciones</p>
            </div>
          </div>
          <div className="w-full sm:w-72">
            <SearchBar
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar noticia..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-dark-border text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Imagen</th>
                <th className="px-4 py-3">Noticia & Etiquetas</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {cargando ? (
                <SkeletonRows count={3} />
              ) : noticiasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    No se encontraron noticias en esta sección
                  </td>
                </tr>
              ) : (
                noticiasFiltradas.map(n => (
                  <tr key={n.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {n.imagen && (
                          <img
                            src={`${UPLOADS_URL}/${n.imagen}`}
                            className="w-full h-full object-cover"
                            alt=""
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-dark-text line-clamp-1">{n.titulo}</p>
                      {Array.isArray(n.tags) && n.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {n.tags.map(t => (
                            <span key={t.id} className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              #{t.nombre}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={n.estado} fechaPublicacion={n.fecha_publicacion} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600 dark:text-dark-text-muted">
                        {n.fecha_publicacion ? new Date(n.fecha_publicacion).toLocaleDateString('es-PE') : n.fecha ? new Date(n.fecha).toLocaleDateString('es-PE') : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onEdit={() => prepararEdicion(n)}
                        onDelete={usuario?.rol === 'admin' ? () => handleEliminar(n.id) : undefined}
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

export default AdminNoticias;
