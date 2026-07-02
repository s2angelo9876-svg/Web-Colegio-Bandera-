import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getAdmisiones, eliminarAdmision } from '../services/api';
import Swal from 'sweetalert2';
import { ActionButtons, AdminPageHeader, SearchBar } from '../components/AdminUI';
import { Calendar, FileText, GraduationCap, Phone, User } from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

function SkeletonRows({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-3/4 mb-2" /><div className="h-2 bg-slate-50 rounded w-1/2" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
    </tr>
  ));
}

SkeletonRows.propTypes = { count: PropTypes.number };

function AdminAdmisiones() {
  const [admisiones, setAdmisiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargarAdmisiones = useCallback(async () => {
    setCargando(true);
    try {
      const res = await getAdmisiones();
      setAdmisiones(res.data || []);
    } catch { /* ignore error */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarAdmisiones(); }, [cargarAdmisiones]);

  const handleEliminar = useCallback((id) => {
    Swal.fire({
      title: 'Â¿Eliminar solicitud?',
      text: 'Se borrarÃ¡n los datos del postulante',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'SÃ­, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarAdmision(id);
          Toast.fire({ icon: 'success', title: 'Eliminado' });
          cargarAdmisiones();
        } catch { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
      }
    });
  }, [cargarAdmisiones]);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return admisiones;
    const q = busqueda.toLowerCase();
    return admisiones.filter(a =>
      (a.nombre_padre || '').toLowerCase().includes(q) ||
      (a.nombre_estudiante || '').toLowerCase().includes(q) ||
      (a.grado_interes || '').toLowerCase().includes(q) ||
      (a.celular || '').includes(q)
    );
  }, [admisiones, busqueda]);

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <AdminPageHeader
        title="Centro de Admisiones"
        subtitle="Registro de Postulantes"
        badge={<FileText size={11} />}
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Solicitudes</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{filtrados.length} registradas</p>
            </div>
          </div>
          <div className="w-full sm:w-72">
            <SearchBar
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar postulante..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Estudiante / Apoderado</th>
                <th className="px-4 py-3">Grado</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <SkeletonRows count={3} />
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                    No hay solicitudes de admisiÃ³n
                  </td>
                </tr>
              ) : (
                filtrados.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />
                        {a.nombre_estudiante}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.nombre_padre}</p>
                      {a.fecha_registro && (
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(a.fecha_registro).toLocaleDateString('es-PE')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-primary">
                        <GraduationCap size={10} />
                        {a.grado_interes}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`tel:${a.celular}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Phone size={11} />
                        {a.celular}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons onDelete={() => handleEliminar(a.id)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminAdmisiones;

