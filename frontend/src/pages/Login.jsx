import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/authContext';
import { API } from '../services/api';
import {
  School, User, Lock, Eye, EyeOff,
  Loader2, AlertTriangle, ArrowLeft
} from 'lucide-react';

function Login() {
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [cargando, setCargando]     = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await API.post('/auth/login', { username, password });
      login(res.data.token, res.data.usuario);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Left Column: Brand & Identity */}
      <section
        className="relative w-full md:w-5/12 flex items-center justify-center p-8 md:p-16 overflow-hidden"
        style={{
          backgroundColor: '#003087',
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      >
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />

        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors group z-20"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </button>

        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-full flex items-center justify-center shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
            <School size={64} className="text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-white font-black text-3xl md:text-4xl tracking-tight leading-tight mb-4">
            I.E. Bandera del Perú
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-medium tracking-widest uppercase">
            Honor · Lealtad · Trabajo
          </p>
          <div className="mt-12 w-24 h-1 bg-red-600 rounded-full" />
        </div>
      </section>

      {/* Right Column: Login Form */}
      <section className="w-full md:w-7/12 flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-md">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-primary font-bold text-2xl md:text-3xl mb-2">
                Acceso al Panel Administrativo
              </h2>
              <p className="text-slate-500">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3.5 mb-6 animate-fade-in">
                <AlertTriangle size={17} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-semibold leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-slate-900">
                  Usuario
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="nombre.apellido"
                    autoComplete="username"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors"
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-primary hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {cargando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>

              <div className="text-center mt-4">
                <a
                  href="#"
                  className="text-primary text-sm font-semibold hover:text-red-600 hover:underline underline-offset-4 transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center flex flex-col items-center gap-4">
            <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
              © {new Date().getFullYear()} I.E. Bandera del Perú - Todos los derechos reservados. Sistema de gestión institucional.
            </p>
            <div className="flex gap-3">
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold uppercase tracking-wider">
                v2.4.0 Stable
              </span>
              <span className="text-[10px] bg-blue-100 text-primary px-2 py-1 rounded font-bold uppercase tracking-wider">
                Servidor Seguro
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Login.propTypes = {};

export default Login;
