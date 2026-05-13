import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { API } from '../services/api';
import {
  School, User, Lock, Eye, EyeOff,
  Loader2, AlertTriangle, ShieldCheck, ArrowLeft
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
    <div className="min-h-screen bg-[#001D52] flex items-center justify-center px-4 relative overflow-hidden">

      {/* ── Decoraciones de fondo ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-600/20 rounded-full blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl animate-float delay-200" />
        {/* Anillo decorativo */}
        <div className="absolute top-10 right-10 w-32 h-32 border border-white/5 rounded-full animate-spin-slow" />
        <div className="absolute bottom-10 left-10 w-20 h-20 border border-white/5 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
      </div>

      {/* ── Card principal ── */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">

        {/* Botón volver */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors mb-6 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </button>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/30 overflow-hidden">

          {/* ── Header card ── */}
          <div className="relative bg-gradient-to-br from-[#003087] to-[#001D52] py-10 px-8 text-center overflow-hidden">
            {/* Anillo decorativo en header */}
            <div className="absolute top-0 right-0 w-32 h-32 border-2 border-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border border-white/5 rounded-full -translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/15 border-2 border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl animate-float backdrop-blur-sm">
                <School size={38} className="text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-white font-black text-2xl tracking-tight mb-1">
                I.E. Bandera del Perú
              </h1>
              <div className="flex items-center justify-center gap-2 text-blue-300">
                <ShieldCheck size={13} className="text-emerald-400" />
                <p className="text-xs font-bold uppercase tracking-widest">Panel de Administración</p>
              </div>
            </div>
          </div>

          {/* ── Cuerpo formulario ── */}
          <div className="p-8">
            <div className="mb-7">
              <h2 className="text-xl font-black text-gray-900 mb-0.5">Iniciar Sesión</h2>
              <p className="text-xs text-gray-400 font-medium">Solo personal autorizado del colegio</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3.5 mb-5 animate-fade-in-down">
                <AlertTriangle size={17} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-semibold leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Usuario */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                  Usuario
                </label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    className="input-field"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="input-field pr-12"
                    required
                    autoComplete="current-password"
                  />
                  {/* Toggle ojo */}
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#003087] transition-colors"
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPass
                      ? <EyeOff size={16} />
                      : <Eye size={16} />
                    }
                  </button>
                </div>
              </div>

              {/* Botón submit */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full flex items-center justify-center gap-3 bg-[#003087] hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-red-500/30 transition-all duration-300 transform active:scale-[0.98] text-sm tracking-wide mt-2"
              >
                {cargando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={17} />
                    Ingresar al Panel
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[11px] text-gray-400 mt-6 font-medium">
              Acceso restringido · I.E. Bandera del Perú © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;