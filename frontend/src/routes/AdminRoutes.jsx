import { Routes, Route, Navigate } from 'react-router-dom';
import Admin from '../pages/Admin';
import AdminNoticias from '../pages/AdminNoticias';
import AdminEventos from '../pages/AdminEventos';
import AdminComunicados from '../pages/AdminComunicados';
import AdminDocentes from '../pages/AdminDocentes'; // Importar
import AdminAdministrativos from '../pages/AdminAdministrativos'; // Importar nuevo
import AdminTransparencia from '../pages/AdminTransparencia'; // Importar nuevo
import AdminGaleria from '../pages/AdminGaleria'; // Importar nuevo
import AdminConfigInicio from '../pages/AdminConfigInicio';
import AdminAdmisiones from '../pages/AdminAdmisiones'; // Nuevo import

function AdminRoutes() {
  return (
    <Routes>
      {/* Dashboard Principal */}
      <Route index element={<Admin />} />

      {/* Rutas de Contenido */}
      <Route path="noticias" element={<AdminNoticias />} />
      <Route path="eventos" element={<AdminEventos />} />
      <Route path="comunicados" element={<AdminComunicados />} />
      <Route path="admisiones" element={<AdminAdmisiones />} />

      {/* Rutas Institucionales */}
      <Route path="transparencia" element={<AdminTransparencia />} />
      <Route path="docentes" element={<AdminDocentes />} />
      <Route path="administrativos" element={<AdminAdministrativos />} />
      <Route path="galeria" element={<AdminGaleria />} />
      <Route path="config-inicio" element={<AdminConfigInicio />} />

      {/* Redirección SIEMPRE al final de todas las rutas */}
      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  );
}

export default AdminRoutes;