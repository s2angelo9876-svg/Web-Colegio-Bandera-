import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API, UPLOADS_URL } from '../services/api';
import Swal from 'sweetalert2';
import { ActionButtons, AdminPageHeader, FormCard, SearchBar, TextAreaField, TextField } from '../components/AdminUI';
import { ExternalLink, FileText, FolderTree } from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const CATEGORIAS = [
  { id: 'Gestion', label: 'GestiÃ³n' },
  { id: 'Normativa', label: 'Normativa' },
  { id: 'Comunicado', label: 'Comunicado' },
  { id: 'Otros', label: 'Otros' },
];

function SkeletonRows({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-3/4 mb-2" /><div className="h-2 bg-slate-50 rounded w-1/2" /></td>
      <td className="px-4 py-3"><div className="h-5 w-16 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  ));
}

SkeletonRows.propTypes = { count: PropTypes.number };

function AdminDocumentosInstitucionales() {
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', categoria: 'Gestion', descripcion: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargarDocumentos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await API.get('/transparencia');
      setDocumentos(res.data || []);
    } catch { /* ignore error */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarDocumentos(); }, [cargarDocumentos]);

  const resetForm = useCallback(() => {
    setForm({ titulo: '', categoria: 'Gestion', descripcion: '' });
    setSelectedFile(null);
    const fileInput = document.getElementById('input-file-pdf');
    if (fileInput) fileInput.value = '';
    setShowForm(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      Swal.fire('Error', 'Por favor selecciona un archivo PDF o documento', 'error');
      return;
    }
    setEnviando(true);
    const formData = new FormData();
    formData.append('titulo', form.titulo);
    formData.append('categoria', form.categoria);
    formData.append('descripcion', form.descripcion);
    formData.append('archivo_pdf', selectedFile);

    try {
      await API.post('/transparencia', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Toast.fire({ icon: 'success', title: 'Documento publicado' });
      resetForm();
      cargarDocumentos();
    } catch {
      Swal.fire('Error', 'No se pudo subir el archivo', 'error');
    } finally { setEnviando(false); }
  };

  const handleEliminar = useCallback((id) => {
    Swal.fire({
      title: 'Â¿Eliminar documento?',
      text: 'Esta acciÃ³n es irreversible',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'SÃ­, borrar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/transparencia/${id}`);
          Toast.fire({ icon: 'success', title: 'Eliminado' });
          cargarDocumentos();
        } catch { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
      }
    });
  }, [cargarDocumentos]);

  const docsFiltrados = documentos.filter(d => {
    const matchesCat = filtro === 'Todos' || d.categoria === filtro;
    if (!matchesCat) return false;
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (d.titulo || '').toLowerCase().includes(q) || (d.descripcion || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <AdminPageHeader
        title="Documentos Institucionales"
        subtitle="Gobierno Digital"
        badge={<FolderTree size={11} />}
        onButtonClick={() => showForm ? resetForm() : setShowForm(true)}
        formOpen={showForm}
        addButtonLabel="Cargar Documento"
      />

      {showForm && (
        <FormCard
          title="Registro de Nuevo Documento Oficial"
          icon={<FileText size={14} />}
          onSubmit={handleSubmit}
          submitting={enviando}
          submitLabel={enviando ? 'Subiendo...' : 'Publicar'}
          onCancel={resetForm}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              id="titulo" name="titulo" label="TÃ­tulo del Recurso"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Reglamento Interno" required
            />
            <div className="space-y-1.5">
              <label htmlFor="categoria" className="block text-xs font-semibold text-slate-700">CategorÃ­a</label>
              <select
                id="categoria"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <TextField
                id="descripcion" name="descripcion" label="DescripciÃ³n Corta"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Ej: EdiciÃ³n Oficial 2026"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="input-file-pdf" className="block text-xs font-semibold text-slate-700">Archivo PDF / Word</label>
              <input
                id="input-file-pdf"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-primary file:text-white file:font-semibold file:text-xs file:uppercase file:cursor-pointer"
              />
            </div>
          </div>
        </FormCard>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
              <FolderTree size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Documentos</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{docsFiltrados.length} archivos</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setFiltro('Todos')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  filtro === 'Todos' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Todos
              </button>
              {CATEGORIAS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setFiltro(c.id)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    filtro === c.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-48">
              <SearchBar
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar documento..."
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">CategorÃ­a</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <SkeletonRows count={3} />
              ) : docsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    No hay documentos en esta categorÃ­a
                  </td>
                </tr>
              ) : (
                docsFiltrados.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{doc.titulo}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{doc.descripcion}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-primary">
                        {doc.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600">
                        {doc.fecha ? new Date(doc.fecha).toLocaleDateString('es-PE') : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 justify-end">
                        <a
                          href={doc.archivo_pdf?.startsWith('http') ? doc.archivo_pdf : `${UPLOADS_URL}/${doc.archivo_pdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-blue-50 text-primary hover:bg-primary hover:text-white rounded-md transition-colors"
                          title="Ver documento"
                          aria-label="Ver documento"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <ActionButtons
                          onDelete={() => handleEliminar(doc.id)}
                        />
                      </div>
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

export default AdminDocumentosInstitucionales;

