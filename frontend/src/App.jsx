import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AuthProvider, useAuth } from './context/authContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

const Inicio = lazy(() => import('./pages/Inicio'));
const Noticias = lazy(() => import('./pages/Noticias'));
const Comunicados = lazy(() => import('./pages/Comunicados'));
const Docentes = lazy(() => import('./pages/Docentes'));
const Eventos = lazy(() => import('./pages/Eventos'));
const Galeria = lazy(() => import('./pages/Galeria'));
const Login = lazy(() => import('./pages/Login'));
const MesaPartes = lazy(() => import('./pages/MesaPartes'));
const SeccionInstitucion = lazy(() => import('./pages/SeccionInstitucion'));
const DocumentosInstitucionales = lazy(() => import('./pages/DocumentosInstitucionales'));
const Administrativos = lazy(() => import('./pages/Administrativos'));
const Directivos = lazy(() => import('./pages/Directivos'));

const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-slate-400 font-medium text-sm uppercase tracking-widest">Cargando...</p>
      </div>
    </div>
  );
}

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <LoadingSpinner />;
  }

  return usuario ? children : <Navigate to="/login" />;
}

RutaProtegida.propTypes = {
  children: PropTypes.node.isRequired,
};

function AppContent() {
  const { usuario } = useAuth();
  const location = useLocation();

  const isAdminPath = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);

  const sessionBar = useMemo(() => (
    usuario && !isAdminPath && (
      <div className="bg-primary text-white px-6 py-2 text-sm text-right flex justify-end items-center gap-4">
        <span>Sesión activa: <strong>{usuario.username}</strong></span>
        <a
          href="/admin"
          className="bg-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition-colors"
        >
          VOLVER AL PANEL
        </a>
      </div>
    )
  ), [usuario, isAdminPath]);

  return (
    <>
      {!isAdminPath && <Navbar />}
      {sessionBar}

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
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
          <Route path="/transparencia" element={<Navigate to="/documentos-institucionales" replace />} />
          <Route path="/admision" element={<Navigate to="/mesa-partes" replace />} />

          <Route path="/nosotros" element={<SeccionInstitucion />} />
          <Route path="/historia" element={<SeccionInstitucion />} />
          <Route path="/directivo" element={<Directivos />} />
          <Route path="/valores" element={<SeccionInstitucion />} />
          <Route path="/mision" element={<SeccionInstitucion />} />
          <Route path="/propuesta" element={<SeccionInstitucion />} />
          <Route path="/talleres" element={<SeccionInstitucion />} />
          <Route path="/organigrama" element={<SeccionInstitucion />} />

          <Route path="/tic/aula" element={<SeccionInstitucion />} />
          <Route path="/tic/recursos" element={<SeccionInstitucion />} />
          <Route path="/tic/proyectos" element={<SeccionInstitucion />} />

          <Route
            path="/admin/*"
            element={
              <RutaProtegida>
                <AdminRoutes />
              </RutaProtegida>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
