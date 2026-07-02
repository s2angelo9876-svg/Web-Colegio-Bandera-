import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API, getComunicados } from '../services/api';
import Swal from 'sweetalert2';
import {
  AdminPageHeader, FormCard, TextField, TextAreaField,
  SearchBar, ActionButtons
} from '../components/AdminUI';
import { Megaphone, Tag, MessageSquare } from 'lucide-react';

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
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  ));
}

SkeletonRows.propTypes = { count: PropTypes.number };

function AdminComunicados() {
  const [comunicados, setComunicados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [form, setForm] = useState({ titulo: '', descripcion: '', tipo: 'aviso' });
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await getComunicados();
      setComunicados(res.data || []);
    } catch { /* ignore error */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const resetForm = useCallback(() => {
    setForm({ titulo: '', descripcion: '', tipo: 'aviso' });
    setShowForm(false);
    setEditMode(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      if (editMode) {
        await API.put(`/comunicados/${editMode}`, {
          ...form,
          fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
        Toast.fire({ icon: 'success', title: 'Comunicado actualizado' });
      } else {
        await API.post('/comunicados', {
          ...form,
          fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
        Toast.fire({ icon: 'success', title: 'Comunicado publicado' });
      }
      resetForm();
      cargar();
    } catch {
      Swal.fire('Error', 'No se pudo publicar el comunicado', 'error');
    } finally { setEnviando(false); }
  };

  const handleEliminar = useCallback((id) => {
    Swal.fire({
      title: '¿Eliminar comunicado?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/comunicados/${id}`);
          Toast.fire({ icon: 'success', title: 'Eliminado' });
          cargar();
        } catch { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
      }
    });
  }, [cargar]);

  const prepararEdicion = useCallback((c) => {
    setEditMode(c.id);
    setForm({ titulo: c.titulo, descripcion: c.descripcion, tipo: c.tipo || 'aviso' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filtrados = comunicados.filter(c => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (c.titulo || '').toLowerCase().includes(q) || (c.descripcion || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <AdminPageHeader
        title="Centro de Comunicados"
        subtitle="Comunicación Institucional"
        badge={<Megaphone size={11} />}
        onButtonClick={() => showForm ? resetForm() : setShowForm(true)}
        formOpen={showForm}
        addButtonLabel="Nuevo Comunicado"
      />

      {showForm && (
        <FormCard
          title={editMode ? 'Editar Comunicado' : 'Nuevo Comunicado'}
          icon={<MessageSquare size={14} />}
          onSubmit={handleSubmit}
          submitting={enviando}
          submitLabel={editMode ? 'Actualizar' : 'Publicar'}
          onCancel={resetForm}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              id="titulo" name="titulo" label="Título del Comunicado"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Suspensión de labores..." required
            />
            <div className="space-y-1.5">
              <label htmlFor="tipo" className="block text-xs font-semibold text-slate-700">Tipo de Comunicado</label>
              <div className="relative">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  id="tipo"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  <option value="aviso">Aviso General</option>
                  <option value="circular">Circular Administrativa</option>
                  <option value="urgente">Alerta Urgente</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <TextAreaField
                id="descripcion" name="descripcion" label="Mensaje Detallado"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Escribe el contenido detallado aquí..." required rows={6}
              />
            </div>
          </div>
        </FormCard>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
              <Megaphone size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Comunicados</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{filtrados.length} publicados</p>
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
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Comunicado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <SkeletonRows count={3} />
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    No hay comunicados publicados
                  </td>
                </tr>
              ) : (
                filtrados.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.tipo === 'urgente' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-primary'
                      }`}>
                        <Tag size={10} />
                        {c.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{c.titulo}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{c.descripcion}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600">
                        {c.fecha ? new Date(c.fecha).toLocaleDateString('es-PE') : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onEdit={() => prepararEdicion(c)}
                        onDelete={() => handleEliminar(c.id)}
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
