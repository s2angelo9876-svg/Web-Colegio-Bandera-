import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API } from '../services/api';

const AuthContext = createContext();

function parseUserData(data) {
  if (!data) return null;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function validateToken(token) {
  if (!token || typeof token !== 'string') return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp) {
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }, []);

  useEffect(() => {
    // Verifica contra el backend (la cookie httpOnly viaja automáticamente).
    // Si falla, caemos al flujo legacy de localStorage.
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    const init = async () => {
      try {
        const res = await API.get('/auth/verificar');
        if (res.data?.valido && res.data?.usuario) {
          setUsuario(res.data.usuario);
          // sincroniza localStorage como cache
          localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
          setCargando(false);
          return;
        }
      } catch { /* sin cookie o token inválido */ }

      // Fallback: token legacy en localStorage
      if (token && validateToken(token) && usuarioGuardado) {
        const parsed = parseUserData(usuarioGuardado);
        if (parsed) setUsuario(parsed);
      } else if (token || usuarioGuardado) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
      setCargando(false);
    };

    init();
  }, []);

  const login = useCallback(async (token, datosUsuario) => {
    if (token) localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
