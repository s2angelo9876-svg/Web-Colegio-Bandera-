import { useEffect, useState } from 'react'
import { API, getAdmisiones, eliminarAdmision } from '../services/api'
import Swal from 'sweetalert2'
import { FileText, Trash2, Calendar, Phone, User, GraduationCap, ArrowUpRight } from 'lucide-react'

function AdminAdmisiones() {
    const [admisiones, setAdmisiones] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => { cargarAdmisiones() }, [])

    const cargarAdmisiones = async () => {
        try {
            setCargando(true)
            const res = await getAdmisiones()
            setAdmisiones(res.data)
        } catch (error) {
            console.error("Error al cargar admisiones:", error)
        } finally {
            setCargando(false)
        }
    }

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar solicitud?',
            text: "Se borrarán los datos del postulante",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await eliminarAdmision(id)
                cargarAdmisiones()
                Swal.fire('Eliminado', 'La solicitud ha sido borrada', 'success')
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar la solicitud', 'error')
            }
        }
    }

    return (
        <div className="p-8 lg:p-12 bg-[#F8FAFC] dark:bg-dark-bg transition-colors duration-300 min-h-screen relative overflow-hidden">
            {/* Decorative background mesh */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header Principal */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-[#003087] font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 w-fit px-4 py-2 rounded-full border border-blue-100/50">
                        <FileText size={14} className="animate-pulse" />
                        Registro de Postulantes
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
                        Centro de <span className="text-[#003087] dark:text-blue-400">Admisiones</span>
                    </h2>
                    <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">Directorio de solicitudes enviadas por padres de familia.</p>
                </div>
            </div>

            {/* Loading State */}
            {cargando && (
                <div className="flex justify-center py-20">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-[#003087] rounded-full animate-spin"></div>
                </div>
            )}

            {/* Listado de Solicitudes */}
            {!cargando && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
                    {admisiones.map(a => (
                        <div key={a.id} className="bg-white/70 dark:bg-dark-card/90 backdrop-blur-sm border border-white dark:border-dark-border p-8 rounded-[3rem] shadow-xl shadow-blue-900/5 dark:shadow-none hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative group overflow-hidden flex flex-col h-full">
                            <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-50 dark:bg-dark-accent/30 rounded-full blur-2xl group-hover:bg-blue-100 dark:group-hover:bg-dark-accent/40 transition-colors opacity-50" />
                            
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
                                <button onClick={() => handleEliminar(a.id)} className="bg-white dark:bg-dark-input text-red-500 p-4 rounded-2xl hover:bg-red-500 dark:hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-900/10 dark:shadow-none border border-red-50 dark:border-dark-border">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-6 z-10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-dark-card/50 px-4 py-2 rounded-xl">
                                    <Calendar size={14} className="opacity-40" /> 
                                    {a.fecha_registro ? new Date(a.fecha_registro).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Reciente'}
                                </span>
                            </div>

                            <div className="mb-6 z-10">
                                <h3 className="text-xl font-black text-[#003087] dark:text-white mb-1 flex items-center gap-2">
                                    <User size={18} className="text-blue-500 dark:text-blue-400"/> {a.nombre_estudiante}
                                </h3>
                                <p className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-2">
                                    <GraduationCap size={14} /> Postula a: <span className="text-gray-800 dark:text-gray-200">{a.grado_interes}</span>
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-dark-card/30 p-6 rounded-2xl mb-2 flex-1 z-10 border border-slate-100 dark:border-dark-border">
                                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Datos del Apoderado</p>
                                <p className="font-bold text-gray-700 dark:text-slate-300 text-sm mb-2">{a.nombre_padre}</p>
                                <a href={`tel:${a.celular}`} className="inline-flex items-center gap-2 text-[#003087] dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400 font-black text-xs uppercase tracking-widest transition-colors mt-2">
                                    <Phone size={14} /> {a.celular} <ArrowUpRight size={14} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!cargando && admisiones.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-dark-card rounded-[3rem] border border-dashed border-gray-200 dark:border-dark-border shadow-sm mt-6">
                    <FileText size={64} className="mx-auto text-gray-200 dark:text-gray-600 mb-4" />
                    <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">No hay solicitudes de admisión recientes.</p>
                </div>
            )}
        </div>
    )
}

export default AdminAdmisiones;
