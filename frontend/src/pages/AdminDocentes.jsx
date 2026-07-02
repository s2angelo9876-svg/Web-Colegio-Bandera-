import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API, UPLOADS_URL } from '../services/api';
import Swal from 'sweetalert2';
import { ActionButtons, AdminPageHeader, FormCard, SearchBar, TextField } from '../components/AdminUI';
import { Edit3, GraduationCap, Image as ImageIcon } from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const initialForm = { nombre: '', cargo: '', especialidad: '', imagen_url: '', tutoria: '', orden: 0 };

function SkeletonRows({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-12 w-12 bg-slate-100 rounded-full" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-32 mb-2" /><div className="h-2 bg-slate-50 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  ));
}

SkeletonRows.propTypes = { count: PropTypes.number };

function AdminDocentes() {
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [enviando, setEnviando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargarDocentes = useCallback(async () => {
    setCargando(true);
    try {
      const res = await API.get('/docentes');
      setDocentes(res.data || []);
    } catch { /* ignore error */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarDocentes(); }, [cargarDocentes]);

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
        await API.put(`/docentes/${editMode}`, form);
        Toast.fire({ icon: 'success', title: 'Docente actualizado' });
      } else {
        await API.post('/docentes', form);
        Toast.fire({ icon: 'success', title: 'Docente registrado' });
      }
      resetForm();
      cargarDocentes();
    } catch {
      Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
    } finally { setEnviando(false); }
  };

  const prepararEdicion = useCallback((d) => {
    setEditMode(d.id);
    setForm({
      nombre: d.nombre,
      cargo: d.cargo,
      especialidad: d.especialidad,
      imagen_url: d.imagen_url,
      tutoria: d.tutoria || '',
      orden: d.orden
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleEliminar = useCallback((id) => {
    Swal.fire({
      title: 'Â¿Eliminar docente?',
      text: 'Esta acciÃ³n quitarÃ¡ al docente del plantel',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'SÃ­, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/docentes/${id}`);
          Toast.fire({ icon: 'success', title: 'Eliminado' });
          cargarDocentes();
        } catch { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
      }
    });
  }, [cargarDocentes]);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return docentes;
    const q = busqueda.toLowerCase();
    return docentes.filter(d => (d.nombre || '').toLowerCase().includes(q) || (d.cargo || '').toLowerCase().includes(q));
  }, [docentes, busqueda]);

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <AdminPageHeader
        title="Plantel Docente"
        subtitle="Staff AcadÃ©mico"
        badge={<GraduationCap size={11} />}
        onButtonClick={() => showForm ? resetForm() : setShowForm(true)}
        formOpen={showForm}
        addButtonLabel="Nuevo Docente"
      />

      {showForm && (
        <FormCard
          title={editMode ? `Editar: ${form.nombre}` : 'InformaciÃ³n Profesional del Docente'}
          icon={<GraduationCap size={14} />}
          onSubmit={handleSubmit}
          submitting={enviando}
          submitLabel={editMode ? 'Actualizar' : 'Registrar'}
          onCancel={resetForm}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              id="nombre" name="nombre" label="Nombre y Apellidos"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Lic. Juan PÃ©rez" required
            />
            <TextField
              id="cargo" name="cargo" label="Cargo AcadÃ©mico"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              placeholder="Ej: Profesor Titular" required
            />
            <TextField
              id="especialidad" name="especialidad" label="Especialidad"
              value={form.especialidad}
              onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
              placeholder="Ej: Ciencias Exactas"
            />
            <TextField
              id="tutoria" name="tutoria" label="TutorÃ­a (Opcional)"
              value={form.tutoria}
              onChange={(e) => setForm({ ...form, tutoria: e.target.value })}
              placeholder="Ej: 3er AÃ±o A"
            />
            <TextField
              id="imagen_url" name="imagen_url" label="URL FotografÃ­a"
              value={form.imagen_url}
              onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
              placeholder="https://..."
            />
            <TextField
              id="orden" name="orden" label="Orden de Prioridad"
              value={form.orden}
              onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 0 })}
              type="number"
            />
          </div>
        </FormCard>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
              <GraduationCap size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Docentes</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{filtrados.length} registrados</p>
            </div>
          </div>
          <div className="w-full sm:w-72">
            <SearchBar
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar docente..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">Docente</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3">Especialidad</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <SkeletonRows count={4} />
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    No hay docentes registrados
                  </td>
                </tr>
              ) : (
                filtrados.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                        {d.imagen_url ? (
                          <img
                            src={d.imagen_url?.startsWith('http') ? d.imagen_url : `${UPLOADS_URL}/${d.imagen_url}`}
                            className="w-full h-full object-cover"
                            alt={d.nombre}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <ImageIcon size={16} className="text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{d.nombre}</p>
                      {d.tutoria && <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Tutor: {d.tutoria}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-700">{d.cargo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600">{d.especialidad || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onEdit={() => prepararEdicion(d)}
                        onDelete={() => handleEliminar(d.id)}
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

export default AdminDocentes;

