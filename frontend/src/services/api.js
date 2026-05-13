import axios from 'axios'

// Se añade 'export' para permitir el uso de la instancia API en otros archivos
export const API = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// Interceptor: agrega el token automáticamente si existe
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}` // Formato Bearer para el middleware
  return config
})

// Interceptor de respuesta: maneja errores globales como 401 (No autorizado)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // El token es inválido o ha expirado
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
export const getNoticias = () => API.get('/noticias')
export const getDocentes = () => API.get('/docentes')
export const getEventos = () => API.get('/eventos')
export const getGaleria = () => API.get('/galeria')
export const getComunicados = () => API.get('/comunicados')

export const getTransparencia = (categoria) =>
  API.get('/transparencia', { params: categoria ? { categoria } : {} })

// Auth
export const loginUsuario = (data) => API.post('/auth/login', data)

// Admin - Comunicados
export const crearComunicado = (data) => API.post('/comunicados', data)
export const eliminarComunicado = (id) => API.delete(`/comunicados/${id}`)

// Admin - Transparencia
export const crearDocumento = (data) => API.post('/transparencia', data)
export const eliminarDocumento = (id) => API.delete(`/transparencia/${id}`)