import { Routes, Route, Navigate } from 'react-router-dom';
import Admin from '../pages/Admin';
import AdminNoticias from '../pages/AdminNoticias';
import AdminEventos from '../pages/AdminEventos';
import AdminComunicados from '../pages/AdminComunicados';
import AdminDocentes from '../pages/AdminDocentes';
import AdminAdministrativos from '../pages/AdminAdministrativos';
import AdminDocumentosInstitucionales from '../pages/AdminDocumentosInstitucionales';
import AdminGaleria from '../pages/AdminGaleria';
import AdminConfigInicio from '../pages/AdminConfigInicio';
import AdminMesaPartes from '../pages/AdminMesaPartes';

function AdminRoutes() {
  return (
    <Routes>
      {/* Dashboard Principal */}
      <Route index element={<Admin />} />

      {/* Rutas de Contenido */}
      <Route path="noticias" element={<AdminNoticias />} />
      <Route path="eventos" element={<AdminEventos />} />
      <Route path="comunicados" element={<AdminComunicados />} />
      <Route path="mesa-partes" element={<AdminMesaPartes />} />

      {/* Rutas Institucionales */}
      <Route path="documentos-institucionales" element={<AdminDocumentosInstitucionales />} />
      <Route path="docentes" element={<AdminDocentes />} />
      <Route path="administrativos" element={<AdminAdministrativos />} />
      <Route path="galeria" element={<AdminGaleria />} />
      <Route path="config-inicio" element={<AdminConfigInicio />} />

      {/* Compatibilidad con rutas antiguas */}
      <Route path="transparencia" element={<Navigate to="/admin/documentos-institucionales" replace />} />
      <Route path="admisiones" element={<Navigate to="/admin/mesa-partes" replace />} />

      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  );
}

export default AdminRoutes;