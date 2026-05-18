import { useEffect, useState } from 'react';
import { API, UPLOADS_URL } from '../services/api';
import Swal from 'sweetalert2';
import { 
  FileText, Trash2, Calendar, Phone, User, ClipboardList, 
  MapPin, Mail, Download, CheckCircle, RefreshCw, AlertCircle 
} from 'lucide-react';

function AdminMesaPartes() {
    const [tramites, setTramites] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('Todos');

    useEffect(() => { cargarTramites() }, []);

    const cargarTramites = async () => {
        try {
            setCargando(true);
            const res = await API.get('/mesa-partes');
            setTramites(res.data || []);
        } catch (error) {
            console.error("Error al cargar trámites de Mesa de Partes:", error);
        } finally {
            setCargando(false);
        }
    };

    const handleActualizarEstado = async (id, nuevoEstado) => {
        try {
            await API.patch(`/mesa-partes/${id}/estado`, { estado: nuevoEstado });
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Estado actualizado a ${nuevoEstado}`,
                showConfirmButton: false,
                timer: 2000
            });
            cargarTramites();
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el estado del trámite', 'error');
        }
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar trámite?',
            text: "Esta acción borrará permanentemente este expediente",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await API.delete(`/mesa-partes/${id}`);
                cargarTramites();
                Swal.fire('Eliminado', 'El expediente ha sido eliminado correctamente.', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el expediente', 'error');
            }
        }
    };

    const tramitesFiltrados = filtroEstado === 'Todos'
        ? tramites
        : tramites.filter(t => t.estado === filtroEstado);

    return (
        <div className="p-8 lg:p-12 bg-surface dark:bg-dark-bg transition-colors duration-300 min-h-screen relative overflow-hidden font-sans">
            {/* Decorative background mesh */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-primary dark:text-blue-300 font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 dark:bg-dark-accent/40 w-fit px-4 py-2 rounded-full border border-blue-100/50 dark:border-dark-accent/50">
                        <ClipboardList size={14} className="animate-pulse" />
                        Bandeja de Entrada
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4 uppercase">
                        Mesa de <span className="text-primary dark:text-blue-400">Partes</span>
                    </h2>
                    <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">Revisión y gestión de trámites virtuales y solicitudes ciudadanas.</p>
                </div>
            </div>

            {/* Filtros de Estado */}
            <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar relative z-10">
                {['Todos', 'pendiente', 'en_proceso', 'resuelto'].map(est => (
                    <button
                        key={est}
                        onClick={() => setFiltroEstado(est)}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border ${
                            filtroEstado === est 
                            ? 'bg-primary border-primary text-white shadow-blue-900/20' 
                            : 'bg-white dark:bg-dark-card text-gray-400 hover:bg-gray-50 border-white dark:border-dark-border'
                        }`}
                    >
                        {est === 'Todos' ? 'Todos los Trámites' : est.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {cargando && (
                <div className="flex justify-center py-20">
                    <RefreshCw className="animate-spin text-primary" size={40} />
                </div>
            )}

            {/* Inbox */}
            {!cargando && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">
                    {tramitesFiltrados.map(t => (
                        <div 
                            key={t.id} 
                            className="bg-white/80 dark:bg-dark-card/90 backdrop-blur-xl border border-white dark:border-dark-border p-8 rounded-[3rem] shadow-2xl hover:shadow-3xl transition-all duration-500 relative group flex flex-col justify-between h-full"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-6 border-b border-gray-100 dark:border-dark-border pb-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 flex items-center gap-1.5">
                                            <Calendar size={14} className="opacity-40" /> 
                                            Expediente #{t.id} · {new Date(t.fecha_registro).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={t.estado}
                                            onChange={(e) => handleActualizarEstado(t.id, e.target.value)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none border cursor-pointer ${
                                                t.estado === 'pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                t.estado === 'en_proceso' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="en_proceso">En Proceso</option>
                                            <option value="resuelto">Resuelto</option>
                                        </select>
                                        <button 
                                            onClick={() => handleEliminar(t.id)} 
                                            className="bg-white dark:bg-dark-input text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white border border-red-50 dark:border-dark-border transition-all"
                                            title="Eliminar Expediente"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">Asunto del Trámite</h3>
                                        <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight mt-1 uppercase">
                                            {t.asunto}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">Fundamentación del Pedido</h3>
                                        <p className="text-sm font-medium text-gray-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-dark-input/50 p-4 rounded-2xl border border-slate-100 dark:border-dark-border whitespace-pre-wrap mt-1">
                                            {t.fundamentacion}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-gray-100 dark:border-dark-border pt-4">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="block font-black text-[9px] text-gray-400 uppercase tracking-widest">Remitente</span>
                                        <span className="font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                                            <User size={13} className="text-slate-400" /> {t.nombres_completos}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block font-black text-[9px] text-gray-400 uppercase tracking-widest">DNI / Documento</span>
                                        <span className="font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                                            {t.dni}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="block font-black text-[9px] text-gray-400 uppercase tracking-widest">Celular</span>
                                        <a href={`tel:${t.telefono}`} className="font-bold text-primary dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-1">
                                            <Phone size={13} className="text-slate-400" /> {t.telefono}
                                        </a>
                                    </div>
                                    <div>
                                        <span className="block font-black text-[9px] text-gray-400 uppercase tracking-widest">Dirección</span>
                                        <span className="font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 mt-1 truncate" title={t.direccion}>
                                            <MapPin size={13} className="text-slate-400 flex-shrink-0" /> {t.direccion}
                                        </span>
                                    </div>
                                </div>

                                {t.correo && (
                                    <div className="text-xs">
                                        <span className="block font-black text-[9px] text-gray-400 uppercase tracking-widest">Correo Electrónico</span>
                                        <span className="font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                                            <Mail size={13} className="text-slate-400" /> {t.correo}
                                        </span>
                                    </div>
                                )}

                                {t.archivo_adjunto && (
                                    <div className="mt-4 pt-2">
                                        <a 
                                            href={`${UPLOADS_URL}/mesa_partes/${t.archivo_adjunto}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="w-full bg-blue-50 dark:bg-blue-950/40 text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white dark:hover:bg-blue-500 transition-all font-black text-[10px] uppercase tracking-widest"
                                        >
                                            <Download size={14} />
                                            <span>Descargar Sustento Adjunto</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!cargando && tramitesFiltrados.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-dark-card rounded-[3rem] border border-dashed border-gray-200 dark:border-dark-border shadow-sm mt-6">
                    <AlertCircle size={64} className="mx-auto text-gray-200 dark:text-gray-600 mb-4" />
                    <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">No hay expedientes en esta categoría.</p>
                </div>
            )}
        </div>
    );
}

export default AdminMesaPartes;
