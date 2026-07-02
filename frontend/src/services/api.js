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
export const getNoticias    = (params) => API.get('/noticias', { params })
export const getDocentes    = () => API.get('/docentes')
export const getEventos     = (params) => API.get('/eventos', { params })
export const getGaleria     = () => API.get('/galeria')
export const getComunicados = () => API.get('/comunicados')
