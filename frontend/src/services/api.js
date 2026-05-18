import axios from 'axios'

// URL base centralizada
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000/uploads';

export const API = axios.create({
  baseURL: API_URL
})

// Interceptor: agrega el token automáticamente si existe
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor de respuesta: maneja errores globales
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Consultas públicas ──────────────────────────────────────────────────────
export const getNoticias    = () => API.get('/noticias')
export const getDocentes    = () => API.get('/docentes')
export const getEventos     = () => API.get('/eventos')
export const getGaleria     = () => API.get('/galeria')
export const getComunicados = () => API.get('/comunicados')
export const getAdmisiones  = () => API.get('/admision')

export const getTransparencia = (categoria) =>
  API.get('/transparencia', { params: categoria ? { categoria } : {} })

// Búsqueda global (Navbar)
export const buscarGlobal = (q) => API.get('/buscar', { params: { q } })

// Mesa de Partes
export const enviarTramite    = (formData) => API.post('/mesa-partes', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const getMesaPartes    = () => API.get('/mesa-partes')
export const actualizarEstadoTramite = (id, estado) => API.patch(`/mesa-partes/${id}/estado`, { estado })
export const eliminarTramite  = (id) => API.delete(`/mesa-partes/${id}`)

// ── Auth ────────────────────────────────────────────────────────────────────
export const loginUsuario = (data) => API.post('/auth/login', data)

// ── Admin - Comunicados ─────────────────────────────────────────────────────
export const crearComunicado   = (data) => API.post('/comunicados', data)
export const eliminarComunicado = (id)  => API.delete(`/comunicados/${id}`)

// ── Admin - Documentos Institucionales (ex Transparencia) ──────────────────
export const crearDocumento   = (data) => API.post('/transparencia', data)
export const eliminarDocumento = (id)  => API.delete(`/transparencia/${id}`)

// ── Admin - Galería ─────────────────────────────────────────────────────────
export const eliminarAdmision = (id) => API.delete(`/admision/${id}`)