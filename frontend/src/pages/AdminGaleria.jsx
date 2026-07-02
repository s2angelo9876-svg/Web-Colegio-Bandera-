import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API, UPLOADS_URL } from '../services/api';
import Swal from 'sweetalert2';
import { ActionButtons, AdminPageHeader, FormCard, ImageUploadField, SearchBar, TextAreaField, TextField } from '../components/AdminUI';
import { Film, Image as ImageIcon } from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const initialForm = {
  titulo: '', descripcion: '',
  dia: new Date().getDate().toString(),
  mes: (new Date().getMonth() + 1).toString(),
  anio: new Date().getFullYear().toString(),
  tipo: 'foto',
  video_url: ''
};

function SkeletonRows({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-12 w-16 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-3/4 mb-2" /><div className="h-2 bg-slate-50 rounded w-1/2" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-12" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  ));
}

SkeletonRows.propTypes = { count: PropTypes.number };

function AdminGaleria() {
  const [mediaItems, setMediaItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargarGaleria = useCallback(async () => {
    setCargando(true);
    try {
      const res = await API.get('/galeria');
      setMediaItems(res.data || []);
    } catch { /* ignore error */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarGaleria(); }, [cargarGaleria]);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setFile(null);
    setPreview(null);
    setShowForm(false);
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.tipo === 'foto' && !file) {
      Swal.fire('Error', 'Selecciona una imagen para subir', 'error');
      return;
    }
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('titulo', form.titulo);
      formData.append('descripcion', form.descripcion);
      formData.append('dia', form.dia);
      formData.append('mes', form.mes);
      formData.append('anio', form.anio);
      formData.append('tipo', form.tipo);
      formData.append('video_url', form.video_url);
      if (file) formData.append('imagen', file);

      await API.post('/galeria', formData);
      Toast.fire({ icon: 'success', title: 'Elemento agregado' });
      resetForm();
      cargarGaleria();
    } catch {
      Swal.fire('Error', 'No se pudo publicar el elemento', 'error');
    } finally { setEnviando(false); }
  };

  const handleEliminar = useCallback((id) => {
    Swal.fire({
      title: 'Â¿Eliminar elemento?',
      text: 'Esta acciÃ³n no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'SÃ­, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/galeria/${id}`);
          Toast.fire({ icon: 'success', title: 'Eliminado' });
          cargarGaleria();
        } catch { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
      }
    });
  }, [cargarGaleria]);

  const years = useMemo(() => {
    const set = new Set(mediaItems.map(f =>
      f.anio || new Date(f.fecha_publicacion || f.created_at).getFullYear().toString()
    ));
    return ['Todos', ...Array.from(set).sort((a, b) => b - a)];
  }, [mediaItems]);

  const filtrados = useMemo(() => {
    let items = mediaItems;
    if (selectedYear !== 'Todos') {
      items = items.filter(f => {
        const yr = f.anio || new Date(f.fecha_publicacion || f.created_at).getFullYear().toString();
        return yr === selectedYear;
      });
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      items = items.filter(f => (f.titulo || '').toLowerCase().includes(q));
    }
    return items;
  }, [mediaItems, selectedYear, busqueda]);

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <AdminPageHeader
        title="GalerÃ­a Multimedia"
        subtitle="Archivo Visual"
        badge={<ImageIcon size={11} />}
        onButtonClick={() => showForm ? resetForm() : setShowForm(true)}
        formOpen={showForm}
        addButtonLabel="Nuevo Elemento"
      />

      {showForm && (
        <FormCard
          title="Detalles del Recurso Multimedia"
          icon={<ImageIcon size={14} />}
          onSubmit={handleSubmit}
          submitting={enviando}
          submitLabel="Publicar"
          onCancel={resetForm}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              id="titulo" name="titulo" label="TÃ­tulo"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Ceremonia del DÃ­a del Logro" required
            />
            <div className="space-y-1.5">
              <label htmlFor="tipo" className="block text-xs font-semibold text-slate-700">Tipo de Recurso</label>
              <select
                id="tipo"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                <option value="foto">FotografÃ­a</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <TextAreaField
                id="descripcion" name="descripcion" label="DescripciÃ³n"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Breve descripciÃ³n..." rows={2}
              />
            </div>
            <TextField
              id="dia" name="dia" label="DÃ­a"
              value={form.dia}
              onChange={(e) => setForm({ ...form, dia: e.target.value })}
              type="number"
            />
            <div className="space-y-1.5">
              <label htmlFor="mes" className="block text-xs font-semibold text-slate-700">Mes</label>
              <select
                id="mes"
                value={form.mes}
                onChange={(e) => setForm({ ...form, mes: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, i) => (
                  <option key={i+1} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
            <TextField
              id="anio" name="anio" label="AÃ±o"
              value={form.anio}
              onChange={(e) => setForm({ ...form, anio: e.target.value })}
              type="number"
            />
            {form.tipo === 'video' && (
              <div className="md:col-span-2">
                <TextField
                  id="video_url" name="video_url" label="URL del Video"
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/..."
                />
              </div>
            )}
            {form.tipo === 'foto' && (
              <div className="md:col-span-2">
                <ImageUploadField
                  id="imagen" label="Imagen Principal"
                  preview={preview}
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
        </FormCard>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
              <ImageIcon size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">GalerÃ­a</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{filtrados.length} elementos</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex gap-1.5 flex-wrap">
              {years.slice(0, 4).map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    selectedYear === y
                      ? 'bg-primary text-white'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {y === 'Todos' ? 'Todos' : y}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-48">
              <SearchBar
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar..."
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Imagen</th>
                <th className="px-4 py-3">TÃ­tulo</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">AÃ±o</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <SkeletonRows count={4} />
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    La galerÃ­a estÃ¡ vacÃ­a
                  </td>
                </tr>
              ) : (
                filtrados.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-14 h-10 rounded overflow-hidden bg-slate-100">
                        {f.imagen_url && (
                          <img
                            src={f.imagen_url?.startsWith('http') ? f.imagen_url : `${UPLOADS_URL}/${f.imagen_url}`}
                            className="w-full h-full object-cover"
                            alt={f.titulo}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{f.titulo}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{f.descripcion}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        f.tipo === 'video' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-primary'
                      }`}>
                        {f.tipo === 'video' && <Film size={10} />}
                        {f.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-700">{f.anio || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onDelete={() => handleEliminar(f.id)}
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

export default AdminGaleria;

