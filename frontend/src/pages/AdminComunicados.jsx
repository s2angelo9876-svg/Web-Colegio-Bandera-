import { useEffect, useState } from 'react'
import { API, getComunicados } from '../services/api'
import Swal from 'sweetalert2'
import { Megaphone, Plus, X, Trash2, Calendar, Tag, MessageSquare, Info } from 'lucide-react'

function AdminComunicados() {
    const [comunicados, setComunicados] = useState([])
    const [showForm, setShowForm] = useState(false)
    
    const [titulo, setTitulo] = useState('')
    const [descripcion, setDescripcion] = useState('') 
    const [tipo, setTipo] = useState('aviso') 

    useEffect(() => { cargarComunicados() }, [])

    const cargarComunicados = async () => {
        try {
            const res = await getComunicados()
            setComunicados(res.data)
        } catch (error) {
            console.error("Error al cargar comunicados:", error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // 1. Obtenemos el token para la autorización
        const token = localStorage.getItem('token')

        try {
            // 2. Enviamos la petición con el Header de Authorization
            await API.post('/comunicados', {
                titulo, 
                descripcion, 
                tipo,
                fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            Swal.fire({ 
                title: '¡Publicado!', 
                text: 'El comunicado ya es visible', 
                icon: 'success', 
                confirmButtonColor: '#003087' 
            })
            
            setShowForm(false)
            setTitulo('')
            setDescripcion('')
            cargarComunicados()
        } catch (error) {
            // Si el error es 403, probablemente el token expiró o no eres admin
            const mensajeError = error.response?.status === 403 
                ? 'No tienes permisos o tu sesión ha expirado' 
                : 'No se pudo publicar el comunicado'
            
            Swal.fire('Error', mensajeError, 'error')
        }
    }

    const handleEliminar = async (id) => {
        const token = localStorage.getItem('token')

        const result = await Swal.fire({
            title: '¿Eliminar comunicado?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                // También incluimos el token para la eliminación
                await API.delete(`/comunicados/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                cargarComunicados()
                Swal.fire('Eliminado', 'El comunicado ha sido borrado', 'success')
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el comunicado', 'error')
            }
        }
    }

    return (
        <div className="p-8 lg:p-12 bg-surface dark:bg-dark-bg min-h-screen transition-colors duration-300 relative overflow-hidden">
            {/* Decorative background mesh */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header Principal */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-primary dark:text-blue-300 font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 dark:bg-dark-accent/40 w-fit px-4 py-2 rounded-full border border-blue-100/50 dark:border-dark-accent/50">
                        <Megaphone size={14} className="animate-pulse" />
                        Comunicación Institucional
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
                        Centro de <span className="text-primary dark:text-blue-400">Comunicados</span>
                    </h2>
                    <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">Emite avisos, circulares y alertas urgentes a la comunidad.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 group ${
                        showForm 
                        ? 'bg-white dark:bg-dark-card text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover' 
                        : 'bg-primary text-white shadow-blue-900/30 hover:bg-blue-900'
                    }`}
                >
                    {showForm ? <><X size={18}/> Cancelar Aviso</> : <><Plus size={18}/> Nuevo Comunicado</>}
                </button>
            </div>

            {/* Formulario Animado */}
            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-6 duration-500 mb-12 relative z-10">
                    <form onSubmit={handleSubmit} className="p-10 bg-white/80 dark:bg-dark-card backdrop-blur-xl rounded-[3.5rem] shadow-2xl shadow-blue-900/10 dark:shadow-none border border-white dark:border-dark-border flex flex-col gap-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.2em]">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Megaphone size={18}/>
                                </div>
                                Redactar Nuevo Comunicado Oficial
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Título del Aviso</label>
                                <input type="text" placeholder="Ej: Suspensión de labores..." className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={titulo} onChange={e => setTitulo(e.target.value)} required />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Tipo de Comunicado</label>
                                <select 
                                    className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-black text-gray-700 outline-none transition-all cursor-pointer appearance-none" 
                                    value={tipo}
                                    onChange={e => setTipo(e.target.value)}
                                >
                                    <option value="aviso">📢 Aviso General</option>
                                    <option value="circular">📄 Circular Administrativa</option>
                                    <option value="urgente">🚨 Alerta Urgente</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Mensaje Oficial Detallado</label>
                            <textarea placeholder="Escribe el contenido detallado aquí..." className="w-full p-6 rounded-[2rem] bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-600 outline-none transition-all h-48 resize-none text-lg leading-relaxed" value={descripcion} onChange={e => setDescripcion(e.target.value)} required></textarea>
                        </div>
                        <button className="bg-gradient-to-r from-primary to-blue-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 transition-all active:scale-[0.98] text-xs">
                            Lanzar Comunicado
                        </button>
                    </form>
                </div>
            )}

            {/* Listado con Mejor UX */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
                {comunicados.map(c => (
                    <div key={c.id} className="bg-white/70 dark:bg-dark-card/90 backdrop-blur-sm border border-white dark:border-dark-border p-8 rounded-[3rem] shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative group overflow-hidden flex flex-col h-full min-h-[320px]">
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors opacity-50" />
                        
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
                            <button onClick={() => handleEliminar(c.id)} className="bg-white dark:bg-dark-input text-red-500 p-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-900/10 dark:shadow-none border border-red-50 dark:border-dark-border">
                                <Trash2 size={20} />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6 z-10">
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border flex items-center gap-2 ${
                                c.tipo === 'urgente' 
                                ? 'text-red-600 bg-red-50 border-red-100' 
                                : 'text-primary bg-blue-50 border-blue-100'
                            }`}>
                                <Tag size={12} /> {c.tipo}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 ml-auto">
                                <Calendar size={14} className="opacity-40" /> 
                                {c.fecha ? new Date(c.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Reciente'}
                            </span>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-primary transition-colors z-10 line-clamp-2 tracking-tight">{c.titulo}</h3>
                        
                        <div className="flex gap-4 text-gray-500 mb-8 flex-1 z-10">
                            <div className="mt-1 flex-shrink-0">
                                <MessageSquare size={20} className="text-gray-200" />
                            </div>
                            <p className="text-[15px] font-bold line-clamp-4 leading-relaxed italic text-gray-500">"{c.descripcion || 'Sin descripción'}"</p>
                        </div>
                        
                        <div className="pt-6 border-t border-dashed border-gray-100 flex justify-between items-center relative z-10">
                             <div className={`h-2 w-20 rounded-full ${c.tipo === 'urgente' ? 'bg-red-400 animate-pulse' : 'bg-blue-200'}`}></div>
                             <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-100" />
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                             </div>
                        </div>
                    </div>
                ))}
            </div>

            {comunicados.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-sm mt-6">
                    <Megaphone size={64} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">No hay comunicados publicados actualmente.</p>
                </div>
            )}
        </div>
    )
}

export default AdminComunicados;