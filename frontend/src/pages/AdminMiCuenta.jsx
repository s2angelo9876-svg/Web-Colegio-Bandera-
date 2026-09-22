import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/authContext';
import { useToast } from '../context/ToastContext';
import { API } from '../services/api';
import Swal from 'sweetalert2';
import { successMsg, errorMsg } from '../utils/sweetalert';
import {
  User, Mail, Lock, Save, Shield, Eye, EyeOff, Check
} from 'lucide-react';

export default function AdminMiCuenta() {
  const { usuario, logout } = useAuth();
  const toast = useToast();

  const [perfil, setPerfil] = useState({
    username: usuario?.username || '',
    email: usuario?.email || '',
  });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  const [passwords, setPasswords] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirm: '',
  });
  const [mostrarPassword, setMostrarPassword] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    setGuardandoPerfil(true);
    try {
      const res = await API.put('/auth/perfil', perfil);
      successMsg('Perfil actualizado', 'Tus datos se guardaron correctamente.');
      // Actualizar el usuario en el contexto
      if (res.data?.usuario) {
        localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo actualizar el perfil.';
      errorMsg('Error al guardar', msg);
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (passwords.passwordNueva !== passwords.passwordConfirm) {
      errorMsg('Las contrasenas no coinciden', 'La nueva contrasena y su confirmacion deben ser iguales.');
      return;
    }
    if (passwords.passwordNueva.length < 6) {
      errorMsg('Contrasena muy corta', 'La nueva contrasena debe tener al menos 6 caracteres.');
      return;
    }
    setCambiandoPassword(true);
    try {
      await API.post('/auth/cambiar-password', {
        passwordActual: passwords.passwordActual,
        passwordNueva: passwords.passwordNueva,
      });
      successMsg('Contrasena actualizada', 'Tu nueva contrasena fue guardada. Volveras a iniciar sesion.');
      setPasswords({ passwordActual: '', passwordNueva: '', passwordConfirm: '' });
      // Forzar logout por seguridad
      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo cambiar la contrasena.';
      errorMsg('Error', msg);
    } finally {
      setCambiandoPassword(false);
    }
  };

  const rolLabel = { admin: 'Administrador', editor: 'Editor', user: 'Usuario' }[usuario?.rol] || usuario?.rol;

  return (
    <div className="p-6 lg:p-8 bg-slate-50 dark:bg-dark-bg min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-dark-text">
          Mi Cuenta
        </h1>
        <p className="text-slate-600 dark:text-dark-text-muted mt-1">
          Gestiona tu informacion personal y la contrasena de acceso.
        </p>
      </div>

      {/* Tarjeta de perfil */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm mb-6">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-dark-border flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <User size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-dark-text uppercase tracking-wider">
              Informacion personal
            </h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              Tu nombre de usuario y correo electronico
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-dark-border">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-extrabold text-2xl">
              {usuario?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-dark-text">
                {usuario?.username}
              </p>
              <p className="text-sm text-slate-500 dark:text-dark-text-muted flex items-center gap-1 mt-0.5">
                <Shield size={12} />
                {rolLabel}
              </p>
            </div>
          </div>

          <form onSubmit={handleGuardarPerfil} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nombre de usuario
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="username" name="username" type="text"
                  value={perfil.username}
                  onChange={(e) => setPerfil({ ...perfil, username: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1">
                <span className="text-primary">💡</span>
                <span>Tu nombre de usuario es como te identificas al iniciar sesion.</span>
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Correo electronico
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email" name="email" type="email"
                  value={perfil.email}
                  onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                  placeholder="tucorreo@banderadelperu.edu.pe"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1">
                <span className="text-primary">💡</span>
                <span>Opcional. Util para recuperacion de contrasena y notificaciones.</span>
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={guardandoPerfil}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-red-600 press-feedback disabled:opacity-50"
              >
                {guardandoPerfil ? 'Guardando...' : <><Save size={16} /> Guardar cambios</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tarjeta de contrasena */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-dark-border flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600">
            <Lock size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-dark-text uppercase tracking-wider">
              Cambiar contrasena
            </h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              Recomendado cambiarla cada 3 meses
            </p>
          </div>
        </div>

        <form onSubmit={handleCambiarPassword} className="p-5 space-y-4">
          <PasswordField
            id="passwordActual"
            label="Contrasena actual"
            value={passwords.passwordActual}
            onChange={(v) => setPasswords({ ...passwords, passwordActual: v })}
            show={mostrarPassword.actual}
            toggleShow={() => setMostrarPassword({ ...mostrarPassword, actual: !mostrarPassword.actual })}
          />

          <PasswordField
            id="passwordNueva"
            label="Nueva contrasena"
            value={passwords.passwordNueva}
            onChange={(v) => setPasswords({ ...passwords, passwordNueva: v })}
            show={mostrarPassword.nueva}
            toggleShow={() => setMostrarPassword({ ...mostrarPassword, nueva: !mostrarPassword.nueva })}
            help="Minimo 6 caracteres. No uses tu nombre ni tu fecha de cumpleanos."
          />

          <PasswordField
            id="passwordConfirm"
            label="Confirmar nueva contrasena"
            value={passwords.passwordConfirm}
            onChange={(v) => setPasswords({ ...passwords, passwordConfirm: v })}
            show={mostrarPassword.confirmar}
            toggleShow={() => setMostrarPassword({ ...mostrarPassword, confirmar: !mostrarPassword.confirmar })}
            error={passwords.passwordConfirm && passwords.passwordNueva !== passwords.passwordConfirm ? 'Las contrasenas no coinciden' : null}
          />

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <Check size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Por seguridad, despues de cambiar la contrasena tendras que iniciar sesion de nuevo.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={cambiandoPassword || !passwords.passwordActual || !passwords.passwordNueva || !passwords.passwordConfirm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 press-feedback disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cambiandoPassword ? 'Cambiando...' : <><Lock size={16} /> Cambiar contrasena</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, show, toggleShow, help, error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id={id} name={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-primary'
          }`}
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          aria-label={show ? 'Ocultar contrasena' : 'Mostrar contrasena'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {help && !error && (
        <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1">
          <span className="text-primary">💡</span>
          <span>{help}</span>
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

PasswordField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  toggleShow: PropTypes.func.isRequired,
  help: PropTypes.string,
  error: PropTypes.string,
};
