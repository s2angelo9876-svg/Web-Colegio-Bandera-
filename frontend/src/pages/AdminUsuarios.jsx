import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API } from '../services/api';
import { useToast } from '../context/ToastContext';
import Swal from 'sweetalert2';
import { successMsg, errorMsg, confirmDelete } from '../utils/sweetalert';
import {
  UserPlus, Edit3, Trash2, Search, Shield, Save, X,
  User, Mail, Lock, ChevronDown
} from 'lucide-react';

const ROLES = [
  { value: 'admin',   label: 'Administrador', color: 'bg-red-100 text-red-700' },
  { value: 'editor',  label: 'Editor',        color: 'bg-blue-100 text-blue-700' },
  { value: 'user',    label: 'Usuario',       color: 'bg-slate-100 text-slate-700' },
];

const ROL_BADGE = Object.fromEntries(ROLES.map(r => [r.value, r]));

export default function AdminUsuarios() {
  const toast = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const res = await API.get('/usuarios');
      setUsuarios(res.data || []);
      // Detectar el id del usuario actual desde localStorage
      try {
        const u = JSON.parse(localStorage.getItem('usuario') || '{}');
        setCurrentUserId(u.id);
      } catch { /* ignore */ }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  const handleEliminar = (id, username) => {
    if (id === currentUserId) {
      errorMsg('No puedes', 'No puedes eliminarte a ti mismo.');
      return;
    }
    confirmDelete(`al usuario "${username}"`, async () => {
      try {
        await API.delete(`/usuarios/${id}`);
        successMsg('Usuario eliminado', `Se elimino a "${username}".`);
        cargarUsuarios();
      } catch (err) {
        errorMsg('No se pudo eliminar', err.response?.data?.error || 'Intenta de nuevo.');
      }
    });
  };

  const filtrados = usuarios.filter((u) =>
    !busqueda || (u.username || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 bg-slate-50 dark:bg-dark-bg min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-dark-text">
            Usuarios del Sistema
          </h1>
          <p className="text-slate-600 dark:text-dark-text-muted mt-1">
            Gestiona quien tiene acceso al panel de administracion.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditMode(null); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-red-600 press-feedback transition"
        >
          <UserPlus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* Tarjetas de roles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {ROLES.map((r) => {
          const count = usuarios.filter((u) => u.rol === r.value).length;
          return (
            <div key={r.value} className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border p-4 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${r.color} flex items-center justify-center`}>
                <Shield size={22} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-dark-text">{count}</p>
                <p className="text-xs text-slate-500 dark:text-dark-text-muted uppercase tracking-wider font-semibold">
                  {r.label}{count === 1 ? '' : 'es'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <UsuarioForm
          editId={editMode}
          onClose={() => { setShowForm(false); setEditMode(null); }}
          onSaved={() => { setShowForm(false); setEditMode(null); cargarUsuarios(); }}
        />
      )}

      <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-dark-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <User size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-dark-text uppercase tracking-wider">
                Usuarios registrados
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                {filtrados.length} de {usuarios.length}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-72 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Ultimo acceso</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No hay usuarios para mostrar
                  </td>
                </tr>
              ) : (
                filtrados.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-dark-text">
                            {u.username}
                            {u.id === currentUserId && (
                              <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Tu</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-dark-text-muted">
                      {u.email || <span className="text-slate-400 italic">Sin email</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROL_BADGE[u.rol]?.color || 'bg-slate-100'}`}>
                        {ROL_BADGE[u.rol]?.label || u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-dark-text-muted">
                      {u.ultimo_acceso || <span className="text-slate-400 italic">Nunca</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditMode(u.id); setShowForm(true); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Edit3 size={14} /> Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(u.id, u.username)}
                          disabled={u.id === currentUserId}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
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

AdminUsuarios.propTypes = {};

function UsuarioForm({ editId, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    username: '', password: '', email: '', rol: 'editor',
  });
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  useEffect(() => {
    if (!editId) return;
    setCargandoDatos(true);
    API.get('/usuarios')
      .then((res) => {
        const u = res.data.find((x) => x.id === editId);
        if (u) {
          setForm({
            username: u.username || '',
            password: '',
            email: u.email || '',
            rol: u.rol || 'editor',
          });
        }
      })
      .catch(() => toast.error('No se pudo cargar el usuario'))
      .finally(() => setCargandoDatos(false));
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId && !form.password) {
      errorMsg('Falta la contrasena', 'La contrasena es obligatoria para nuevos usuarios.');
      return;
    }
    if (form.password && form.password.length < 6) {
      errorMsg('Contrasena muy corta', 'Debe tener al menos 6 caracteres.');
      return;
    }
    setCargando(true);
    try {
      if (editId) {
        const payload = { email: form.email, rol: form.rol };
        if (form.password) payload.password = form.password;
        await API.put(`/usuarios/${editId}`, payload);
        successMsg('Usuario actualizado', `Se guardaron los cambios de "${form.username}".`);
      } else {
        await API.post('/usuarios', form);
        successMsg('Usuario creado', `"${form.username}" ya puede iniciar sesion.`);
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo guardar.';
      errorMsg('Error', msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm mb-5">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <User size={16} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-dark-text uppercase tracking-wider">
            {editId ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Cerrar">
          <X size={18} />
        </button>
      </div>

      {cargandoDatos ? (
        <div className="p-8 text-center text-slate-400">Cargando...</div>
      ) : (
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nombre de usuario
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={!!editId}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                {editId ? 'No se puede cambiar el nombre de usuario.' : 'Como iniciara sesion.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Contrasena {editId && '(opcional)'}
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editId ? 'Dejar vacio para no cambiar' : 'Minimo 6 caracteres'}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Correo electronico (opcional)
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="usuario@banderadelperu.edu.pe"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Rol
              </label>
              <div className="relative">
                <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} {r.value === 'editor' && '(puede crear contenido)'} {r.value === 'admin' && '(control total)'}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">⚠️ <strong>Admin</strong> puede hacer todo. <strong>Editor</strong> solo crea contenido.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-red-600 press-feedback disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : <><Save size={16} /> {editId ? 'Guardar' : 'Crear usuario'}</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

UsuarioForm.propTypes = {
  editId: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
