import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getNoticias, API, UPLOADS_URL } from '../services/api';
import { useToast } from '../context/ToastContext';
import Swal from 'sweetalert2';
import { successWithLink, errorMsg, confirmDelete } from '../utils/sweetalert';
import {
  AdminPageHeader, TextField, TextAreaField, ImageUploadField,
  SearchBar, Pagination, ActionButtons
} from '../components/AdminUI';
import Wizard from '../components/Wizard';
import { Type, FileText, Newspaper, Plus, Edit3, Check } from 'lucide-react';

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
  const toast = useToast();
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-12 w-20 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-3/4 mb-2" /><div className="h-2 bg-slate-50 rounded w-1/2" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  );
}

SkeletonRow.propTypes = {};
SkeletonRows.propTypes = { count: PropTypes.number };

function AdminNoticias() {
  const toast = useToast();
  const [noticias, setNoticias] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [cargando, setCargando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cargarNoticias = useCallback(async (page = 1) => {
    setCargando(true);
    try {
      const res = await getNoticias({ page, limit: 10 });
      setNoticias(res.data.data || []);
      setPagination(prev => ({ ...prev, totalPages: res.data.pagination?.totalPages || 1 }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cargar noticias');
    } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarNoticias(pagination.page); }, [pagination.page, cargarNoticias]);

  useEffect(() => {
    if (!imagen) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(imagen);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imagen]);

  const prepararEdicion = useCallback((n) => {
    setEditMode(n.id);
    setTitulo(n.titulo);
    setContenido(n.contenido);
    setPreview(n.imagen ? `${UPLOADS_URL}/${n.imagen}` : null);
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
    setCurrentStep(0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) {
      errorMsg('Faltan datos', 'El titular y el cuerpo son obligatorios.');
      setCurrentStep(0);
      return;
    }
    setEnviando(true);

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('contenido', contenido);
    if (imagen) formData.append('imagen', imagen);

    try {
      if (editMode) {
        await API.put(`/noticias/${editMode}`, formData);
        Toast.fire({ icon: 'success', title: 'Cambios guardados correctamente' });
      } else {
        await API.post('/noticias', formData);
        successWithLink(
          '¡Noticia publicada!',
          'Tu noticia ya está visible para todos los visitantes de la web.',
          'https://colegio-bandera.vercel.app/noticias'
        );
      }
      resetForm();
      cargarNoticias();
    } catch (err) {
      errorMsg('No se pudo guardar', err.response?.data?.error || 'Revisa tu conexión e intenta de nuevo.');
    } finally { setEnviando(false); }
  };

  const handleEliminar = useCallback((id) => {
    confirmDelete('esta noticia', async () => {
      try {
        await API.delete(`/noticias/${id}`);
        Toast.fire({ icon: 'success', title: 'Noticia eliminada' });
        cargarNoticias();
      } catch (err) {
        errorMsg('No se pudo eliminar', err.response?.data?.error || 'Intenta de nuevo en unos segundos.');
      }
    });
  }, [cargarNoticias]);

  const noticiasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return noticias;
    const q = busqueda.toLowerCase();
    return noticias.filter(n => (n.titulo || '').toLowerCase().includes(q));
  }, [noticias, busqueda]);

  const handlePageChange = useCallback((newPage) => {
    setPagination(p => ({ ...p, page: newPage }));
  }, []);

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
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
          submitLabel={editMode ? 'Guardar cambios' : 'Publicar noticia'}
          steps={[
            {
              id: 'texto',
              title: 'El texto',
              description: 'Titular y cuerpo',
              content: (
                <div className="space-y-4">
                  <div>
                    <TextField
                      id="titulo" name="titulo" label="¿Qué quieres contar?"
                      value={titulo} onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej: Mi colegio ganó olimpiada de matemáticas"
                      maxLength={100} icon={Type}
                    />
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1.5 flex items-start gap-1">
                      <span className="text-primary">💡</span>
                      <span>Este es el titular que verán los padres en la portada. Claro y directo. Máx. 100 letras.</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1 text-right">{titulo.length}/100</p>
                  </div>
                  <div>
                    <TextAreaField
                      id="contenido" name="contenido" label="Cuenta los detalles"
                      value={contenido} onChange={(e) => setContenido(e.target.value)}
                      placeholder="Todos los detalles de la noticia. Qué pasó, cuándo, quiénes participaron..."
                      rows={10} icon={FileText}
                    />
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1.5 flex items-start gap-1">
                      <span className="text-primary">💡</span>
                      <span>Sé claro y ordenado. Los párrafos largos cansan al lector.</span>
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: 'imagen',
              title: 'La imagen',
              description: editMode ? 'Opcional' : 'Recomendada',
              content: (
                <div className="space-y-4">
                  <ImageUploadField
                    id="imagen" label={editMode ? 'Cambiar imagen (opcional)' : 'Imagen de portada'}
                    preview={preview}
                    onChange={(e) => setImagen(e.target.files[0])}
                    required={!editMode}
                  />
                  <p className="text-xs text-slate-500 dark:text-dark-text-muted flex items-start gap-1">
                    <span className="text-primary">💡</span>
                    <span>Esta imagen aparece arriba del titular en la portada. Tamaño recomendado: 1200×600 píxeles. Se ve mejor si es horizontal.</span>
                  </p>
                </div>
              ),
            },
            {
              id: 'revisar',
              title: 'Revisar',
              description: 'Verifica antes de publicar',
              content: (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Titular</p>
                        <p className="text-sm text-slate-900 dark:text-dark-text">{titulo || <em className="text-slate-400">Sin titular</em>}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className={contenido ? 'text-emerald-500' : 'text-slate-300'} />
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Cuerpo</p>
                        <p className="text-sm text-slate-600 dark:text-dark-text-muted line-clamp-3">
                          {contenido || <em className="text-slate-400">Sin contenido</em>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className={preview ? 'text-emerald-500' : 'text-amber-500'} />
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Imagen</p>
                        <p className="text-sm text-slate-600 dark:text-dark-text-muted">
                          {preview ? '✓ Imagen lista para subir' : editMode ? 'Se mantiene la imagen anterior' : '⚠ Sin imagen (opcional pero recomendado)'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-dark-text-muted text-center">
                    Si todo está bien, pulsa <strong>Publicar noticia</strong>.
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
              <Newspaper size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Registros</h3>
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
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Imagen</th>
                <th className="px-4 py-3">Noticia</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <SkeletonRows count={3} />
              ) : noticiasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    No se encontraron noticias
                  </td>
                </tr>
              ) : (
                noticiasFiltradas.map(n => (
                  <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100">
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
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{n.titulo}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{n.contenido}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600">
                        {n.fecha ? new Date(n.fecha).toLocaleDateString('es-PE') : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onEdit={() => prepararEdicion(n)}
                        onDelete={() => handleEliminar(n.id)}
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


