import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/authContext'
import Navbar from './components/navbar'
import Inicio from './pages/Inicio'
import Noticias from './pages/Noticias'
import Comunicados from './pages/Comunicados'
import Docentes from './pages/Docentes'
import Eventos from './pages/Eventos'
import Galeria from './pages/Galeria'
import Login from './pages/Login'
import MesaPartes from './pages/MesaPartes'
import SeccionInstitucion from './pages/SeccionInstitucion'
import DocumentosInstitucionales from './pages/DocumentosInstitucionales'
import AdminRoutes from './routes/AdminRoutes'
import Administrativos from './pages/Administrativos'
import Directivos from './pages/Directivos'

// Ruta protegida: solo entra si hay sesión activa
function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div className="text-center py-20">Cargando...</div>
  return usuario ? children : <Navigate to="/login" />
}

function AppContent() {
  const { usuario } = useAuth()
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdminPath && <Navbar />}

      {usuario && !isAdminPath && (
        <div className="bg-primary text-white px-6 py-2 text-sm text-right flex justify-end items-center gap-4">
          <span>Sesión activa: <strong>{usuario.username}</strong></span>
          <a href="/admin" className="bg-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition-colors">
            VOLVER AL PANEL
          </a>
        </div>
      )}

      <Routes>
        {/* RUTAS PRINCIPALES */}
        <Route path="/" element={<Inicio />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/comunicados" element={<Comunicados />} />
        <Route path="/docentes" element={<Docentes />} />
        <Route path="/administrativos" element={<Administrativos />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mesa-partes" element={<MesaPartes />} />
        <Route path="/documentos-institucionales" element={<DocumentosInstitucionales />} />
        {/* Redirige ruta antigua de transparencia y admisión */}
        <Route path="/transparencia" element={<Navigate to="/documentos-institucionales" replace />} />
        <Route path="/admision" element={<Navigate to="/mesa-partes" replace />} />

        {/* RUTAS DE "NUESTRO COLEGIO" */}
        <Route path="/nosotros" element={<SeccionInstitucion />} />
        <Route path="/historia" element={<SeccionInstitucion />} />
        <Route path="/directivo" element={<Directivos />} />
        <Route path="/valores" element={<SeccionInstitucion />} />
        <Route path="/mision" element={<SeccionInstitucion />} />
        <Route path="/propuesta" element={<SeccionInstitucion />} />
        <Route path="/talleres" element={<SeccionInstitucion />} />
        <Route path="/organigrama" element={<SeccionInstitucion />} />

        {/* RUTAS DE "TIC" */}
        <Route path="/tic/aula" element={<SeccionInstitucion />} />
        <Route path="/tic/recursos" element={<SeccionInstitucion />} />
        <Route path="/tic/proyectos" element={<SeccionInstitucion />} />

        {/* RUTA PROTEGIDA DE ADMIN */}
        <Route
          path="/admin/*"
          element={
            <RutaProtegida>
              <AdminRoutes />
            </RutaProtegida>
          }
        />

        {/* RUTA POR DEFECTO (404) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App