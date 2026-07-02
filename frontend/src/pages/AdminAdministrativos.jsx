import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API, UPLOADS_URL } from '../services/api';
import Swal from 'sweetalert2';
import { ActionButtons, AdminPageHeader, FormCard, SearchBar, TextField } from '../components/AdminUI';
import { Briefcase, Image as ImageIcon } from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const initialForm = { nombre: '', cargo: '', area: '', imagen_url: '' };

function SkeletonRows({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-10 w-10 bg-slate-100 rounded-full" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-32 mb-2" /><div className="h-2 bg-slate-50 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  ));
}

SkeletonRows.propTypes = { count: PropTypes.number };

function AdminAdministrativos() {
  const [personal, setPersonal] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [enviando, setEnviando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargarPersonal = useCallback(async () => {
    setCargando(true);
    try {
      const res = await API.get('/administrativos');
      setPersonal(res.data || []);
    } catch { /* ignore error */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarPersonal(); }, [cargarPersonal]);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setEditMode(null);
    setShowForm(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      if (editMode) {
        await API.put(`/administrativos/${editMode}`, form);
        Toast.fire({ icon: 'success', title: 'Personal actualizado' });
      } else {
        await API.post('/administrativos', form);
        Toast.fire({ icon: 'success', title: 'Personal registrado' });
      }
      resetForm();
      cargarPersonal();
    } catch {
      Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
    } finally { setEnviando(false); }
  };

  const prepararEdicion = useCallback((p) => {
    setEditMode(p.id);
    setForm({ nombre: p.nombre, cargo: p.cargo, area: p.area || '', imagen_url: p.imagen_url || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleEliminar = useCallback((id) => {
    Swal.fire({
      title: 'Â¿Eliminar registro?',
      text: 'Se borrarÃ¡ del organigrama administrativo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'SÃ­, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/administrativos/${id}`);
          Toast.fire({ icon: 'success', title: 'Eliminado' });
          cargarPersonal();
        } catch { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
      }
    });
  }, [cargarPersonal]);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return personal;
    const q = busqueda.toLowerCase();
    return personal.filter(p => (p.nombre || '').toLowerCase().includes(q) || (p.cargo || '').toLowerCase().includes(q));
  }, [personal, busqueda]);

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <AdminPageHeader
        title="GestiÃ³n Administrativa"
        subtitle="Operaciones Institucionales"
        badge={<Briefcase size={11} />}
        onButtonClick={() => showForm ? resetForm() : setShowForm(true)}
        formOpen={showForm}
        addButtonLabel="Nuevo Administrativo"
      />

      {showForm && (
        <FormCard
          title={editMode ? 'Editar Personal' : 'Registro de Nuevo Personal'}
          icon={<Briefcase size={14} />}
          onSubmit={handleSubmit}
          submitting={enviando}
          submitLabel={editMode ? 'Actualizar' : 'Registrar'}
          onCancel={resetForm}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              id="nombre" name="nombre" label="Nombre Completo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: MarÃ­a Gonzales" required
            />
            <TextField
              id="cargo" name="cargo" label="Cargo"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              placeholder="Ej: Secretaria General" required
            />
            <TextField
              id="area" name="area" label="Ãrea / Oficina"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              placeholder="Ej: TesorerÃ­a"
            />
            <TextField
              id="imagen_url" name="imagen_url" label="URL de Foto"
              value={form.imagen_url}
              onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </FormCard>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
              <Briefcase size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Personal</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{filtrados.length} registrados</p>
            </div>
          </div>
          <div className="w-full sm:w-72">
            <SearchBar
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar personal..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">Personal</th>
                <th className="px-4 py-3">Cargo / Ãrea</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <SkeletonRows count={4} />
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    No hay personal administrativo
                  </td>
                </tr>
              ) : (
                filtrados.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                        {p.imagen_url ? (
                          <img
                            src={p.imagen_url?.startsWith('http') ? p.imagen_url : `${UPLOADS_URL}/${p.imagen_url}`}
                            className="w-full h-full object-cover"
                            alt={p.nombre}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <ImageIcon size={16} className="text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{p.nombre}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-700">{p.cargo}</p>
                      {p.area && <p className="text-[10px] text-slate-500">{p.area}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onEdit={() => prepararEdicion(p)}
                        onDelete={() => handleEliminar(p.id)}
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

export default AdminAdministrativos;

