import axios from 'axios'

// URL base centralizada
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000/uploads';

export const API = axios.create({
  baseURL: API_URL,
  withCredentials: true, // habilita envío de cookies httpOnly si el backend las usa
})

// Interceptor: agrega el token del localStorage como Authorization header
// (modo compatibilidad: la cookie httpOnly viaja sola por withCredentials)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Notificaciones de errores de red/servidor ──────────────────────────
function notifyError(message) {
  // Se carga de forma lazy para evitar dependencia circular
  import('../context/ToastContext.jsx').then(({ useToast }) => {
    // No podemos usar el hook aquí directamente, pero si ToastProvider
    // expone un evento global podemos enganchar. Mientras, usamos dispatchEvent.
  }).catch(() => {});
  // Custom event para que ToastProvider lo escuche
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message } }));
}

// Interceptor de respuesta: maneja errores globales
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401: sesión expirada → forzar logout
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      if (window.location.pathname.startsWith('/admin')) {
        window.dispatchEvent(new CustomEvent('app:toast', {
          detail: { type: 'warning', message: 'Tu sesión ha expirado. Inicia sesión nuevamente.' }
        }));
        window.location.href = '/login';
      }
    }

    // 403: sin permisos
    if (status === 403) {
      notifyError(error.response?.data?.error || 'No tienes permisos para esta acción');
    }

    // 429: rate limit
    if (status === 429) {
      notifyError(error.response?.data?.error || 'Demasiadas solicitudes. Intenta en unos minutos.');
    }

    // Errores de red (sin respuesta del servidor)
    if (!error.response) {
      notifyError('No se pudo conectar con el servidor. Verifica tu conexión.');
    }

    return Promise.reject(error)
  }
)

// ── Consultas públicas ──────────────────────────────────────────────────────
export const getNoticias    = (params) => API.get('/noticias', { params })
export const getDocentes    = (params) => API.get('/docentes', { params })
export const getEventos     = (params) => API.get('/eventos', { params })
export const getGaleria     = (params) => API.get('/galeria', { params })
export const getComunicados = (params) => API.get('/comunicados', { params })
export const getConfig      = () => API.get('/configuracion')
export const updateConfig  = (data) => API.post('/configuracion', data)
export const getStats      = () => API.get('/stats')
