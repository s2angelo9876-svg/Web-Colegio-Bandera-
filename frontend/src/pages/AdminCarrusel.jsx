import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API, UPLOADS_URL } from '../services/api';
import Swal from 'sweetalert2';
import { ActionButtons, AdminPageHeader, FormCard, ImageUploadField, TextAreaField, TextField } from '../components/AdminUI';
import { Monitor } from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const initialForm = { titulo: '', subtitulo: '', orden: 0, imagen: null };

function SkeletonRows({ count = 2 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-12 w-20 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-32 mb-2" /><div className="h-2 bg-slate-50 rounded w-1/2" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-10" /></td>
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  ));
}

SkeletonRows.propTypes = { count: PropTypes.number };

function AdminCarrusel() {
  const [slides, setSlides] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const fetchSlides = useCallback(async () => {
    setCargando(true);
    try {
      const res = await API.get('/carrusel');
      setSlides(res.data || []);
    } catch { /* ignore error */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  useEffect(() => {
    if (!form.imagen) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(form.imagen);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.imagen]);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setPreview(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const formData = new FormData();
    formData.append('titulo', form.titulo);
    formData.append('subtitulo', form.subtitulo);
    formData.append('orden', form.orden);
    if (form.imagen) formData.append('imagen', form.imagen);

    try {
      await API.post('/carrusel', formData);
      Toast.fire({ icon: 'success', title: 'Slide aÃ±adido' });
      resetForm();
      fetchSlides();
    } catch {
      Swal.fire('Error', 'No se pudo aÃ±adir el slide', 'error');
    } finally { setEnviando(false); }
  };

  const handleDelete = useCallback((id) => {
    Swal.fire({
      title: 'Â¿Eliminar slide?',
      text: 'No podrÃ¡s revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'SÃ­, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/carrusel/${id}`);
          Toast.fire({ icon: 'success', title: 'Slide borrado' });
          fetchSlides();
        } catch { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
      }
    });
  }, [fetchSlides]);

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <AdminPageHeader
        title="GestiÃ³n de Carrusel"
        subtitle="Personaliza el banner principal"
        badge={<Monitor size={11} />}
      />

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <FormCard
            title="Nuevo Slide"
            icon={<Monitor size={14} />}
            onSubmit={handleSubmit}
            submitting={enviando}
            submitLabel="Publicar"
            onCancel={resetForm}
          >
            <TextField
              id="titulo" name="titulo" label="TÃ­tulo"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="TÃ­tulo del slide"
            />
            <TextAreaField
              id="subtitulo" name="subtitulo" label="SubtÃ­tulo"
              value={form.subtitulo}
              onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
              placeholder="DescripciÃ³n breve..." rows={3}
            />
            <TextField
              id="orden" name="orden" label="PosiciÃ³n"
              value={form.orden}
              onChange={(e) => setForm({ ...form, orden: e.target.value })}
              type="number"
            />
            <ImageUploadField
              id="imagen" label="Imagen del Slide"
              preview={preview}
              onChange={(e) => setForm({ ...form, imagen: e.target.files[0] })}
            />
          </FormCard>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
                <Monitor size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Slides Activos</h3>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{slides.length} publicados</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Imagen</th>
                    <th className="px-4 py-3">Slide</th>
                    <th className="px-4 py-3">Orden</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cargando ? (
                    <SkeletonRows count={2} />
                  ) : slides.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                        No hay slides publicados
                      </td>
                    </tr>
                  ) : (
                    slides.map(slide => (
                      <tr key={slide.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-16 h-10 rounded overflow-hidden bg-slate-100">
                            {slide.imagen_url && (
                              <img
                                src={`${UPLOADS_URL}/${slide.imagen_url}`}
                                className="w-full h-full object-cover"
                                alt={slide.titulo}
                                loading="lazy"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900 line-clamp-1">{slide.titulo}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{slide.subtitulo}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600">
                            #{slide.orden}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ActionButtons onDelete={() => handleDelete(slide.id)} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCarrusel;

