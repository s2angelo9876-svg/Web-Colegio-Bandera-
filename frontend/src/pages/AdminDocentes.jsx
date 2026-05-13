import { useEffect, useState } from 'react'
import { API, UPLOADS_URL } from '../services/api'
import Swal from 'sweetalert2'
import { 
  GraduationCap, 
  UserPlus, 
  Trash2, 
  Image as ImageIcon, 
  MoreVertical,
  X,
  Info,
  Edit3
} from 'lucide-react'

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

function AdminDocentes() {
    const [docentes, setDocentes] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editMode, setEditMode] = useState(null)
    const [form, setForm] = useState({ 
        nombre: '', 
        cargo: '', 
        especialidad: '', 
        imagen_url: '',
        orden: 0 
    })

    useEffect(() => { cargarDocentes() }, [])

    const cargarDocentes = async () => {
        try {
            const res = await API.get('/docentes')
            setDocentes(res.data)
        } catch (error) {
            console.error("Error al cargar docentes:", error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editMode) {
                await API.put(`/docentes/${editMode}`, form)
                Toast.fire({
                    title: 'Docente Actualizado',
                    icon: 'success'
                })
            } else {
                await API.post('/docentes', form)
                Toast.fire({
                    title: 'Docente Registrado',
                    icon: 'success'
                })
            }
            setForm({ nombre: '', cargo: '', especialidad: '', imagen_url: '', orden: 0 })
            setShowForm(false)
            setEditMode(null)
            cargarDocentes()
        } catch (error) {
            Swal.fire('Error', 'No se pudo procesar la solicitud', 'error')
        }
    }

    const prepararEdicion = (d) => {
        setEditMode(d.id)
        setForm({
            nombre: d.nombre,
            cargo: d.cargo,
            especialidad: d.especialidad,
            imagen_url: d.imagen_url,
            orden: d.orden
        })
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar docente?',
            text: "Esta acción quitará al docente del plantel oficial",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar'
        })
        if (result.isConfirmed) {
            await API.delete(`/docentes/${id}`)
            Toast.fire({
                title: 'Eliminado',
                icon: 'success'
            })
            cargarDocentes()
        }
    }

    return (
        <div className="p-8 lg:p-12 bg-[#F8FAFC] min-h-screen relative overflow-hidden">
            {/* Decorative background mesh */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Encabezado */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-[#003087] font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 w-fit px-4 py-2 rounded-full border border-blue-100/50">
                        <GraduationCap size={14} className="animate-pulse" />
                        Staff Académico
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-4">
                        Plantel <span className="text-[#003087]">Docente</span>
                    </h2>
                    <p className="text-gray-400 font-bold text-lg">Administra el equipo de educadores y directivos.</p>
                </div>
                <button 
                    onClick={() => {
                        if (showForm) {
                            setShowForm(false)
                            setEditMode(null)
                            setForm({ nombre: '', cargo: '', especialidad: '', imagen_url: '', orden: 0 })
                        } else {
                            setShowForm(true)
                        }
                    }}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 group ${
                        showForm 
                        ? 'bg-white text-gray-700 border border-gray-100 hover:bg-gray-50' 
                        : 'bg-[#003087] text-white shadow-blue-900/30 hover:bg-blue-900'
                    }`}
                >
                    {showForm ? <><X size={18}/> Cancelar</> : <><UserPlus size={18}/> Alta de Docente</>}
                </button>
            </div>

            {/* Formulario Animado */}
            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-6 duration-500 mb-12 relative z-10">
                    <form onSubmit={handleSubmit} className="p-10 bg-white/80 backdrop-blur-xl rounded-[3.5rem] shadow-2xl shadow-blue-900/10 border border-white flex flex-col gap-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-3 text-[#003087] font-black uppercase text-xs tracking-[0.2em]">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Info size={18}/>
                                </div>
                                {editMode ? `Editando: ${form.nombre}` : 'Información Profesional del Docente'}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Nombre y Apellidos</label>
                                <input type="text" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required placeholder="Ej: Lic. Juan Pérez" />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Cargo Académico</label>
                                <input type="text" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} required placeholder="Ej: Profesor Titular" />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Especialidad / Grado</label>
                                <input type="text" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.especialidad} onChange={e => setForm({...form, especialidad: e.target.value})} placeholder="Ej: Ciencias Exactas" />
                            </div>
                            <div className="md:col-span-2 space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Enlace de Fotografía de Perfil</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                    <input type="text" className="w-full p-5 pl-14 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-medium text-[#003087] outline-none transition-all" value={form.imagen_url} onChange={e => setForm({...form, imagen_url: e.target.value})} placeholder="https://ejemplo.com/docente.jpg" />
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Prioridad en Lista</label>
                                <input type="number" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-black text-gray-700 outline-none transition-all" value={form.orden} onChange={e => setForm({...form, orden: e.target.value})} />
                            </div>
                        </div>
                        <button className="bg-gradient-to-r from-[#003087] to-blue-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 transition-all active:scale-[0.98] text-xs">
                            {editMode ? 'Guardar Cambios' : 'Registrar Miembro del Staff'}
                        </button>
                    </form>
                </div>
            )}

            {/* Listado de Docentes Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
                {docentes.map(d => (
                    <div key={d.id} className="bg-white/70 backdrop-blur-sm rounded-[3rem] overflow-hidden shadow-xl shadow-blue-900/5 border border-white group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col">
                        <div className="aspect-[4/5] bg-slate-100 overflow-hidden relative">
                            {d.imagen_url ? (
                                <img 
                                    src={d.imagen_url?.startsWith('http') ? d.imagen_url : `${UPLOADS_URL}/${d.imagen_url}`} 
                                    alt={d.nombre} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                    <ImageIcon size={64} className="opacity-20" />
                                </div>
                            )}
                            
                            {/* Overlay dinámico */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#001D52] via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
                            
                            <div className="absolute top-6 right-6 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                <button 
                                    onClick={() => prepararEdicion(d)}
                                    className="bg-white/90 backdrop-blur-sm text-[#003087] p-4 rounded-2xl hover:bg-[#003087] hover:text-white shadow-2xl transition-all border border-blue-50"
                                >
                                    <Edit3 size={20} />
                                </button>
                                <button 
                                    onClick={() => handleEliminar(d.id)}
                                    className="bg-white/90 backdrop-blur-sm text-red-500 p-4 rounded-2xl hover:bg-red-500 hover:text-white shadow-2xl transition-all border border-red-50"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                <p className="text-[10px] text-blue-200 font-black uppercase tracking-[0.2em] mb-1">Especialidad</p>
                                <p className="text-white font-bold text-sm line-clamp-1">{d.especialidad || 'Área General'}</p>
                            </div>
                        </div>
                        <div className="p-8 flex flex-col justify-between flex-1 relative">
                            <div className="absolute -top-10 right-8 w-16 h-16 bg-[#003087] rounded-2xl shadow-2xl shadow-blue-900/40 flex items-center justify-center text-white border-4 border-white transition-transform group-hover:rotate-6">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 leading-tight mb-2 group-hover:text-[#003087] transition-colors tracking-tight">{d.nombre}</h4>
                                <p className="text-gray-400 text-xs font-black uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg w-fit border border-gray-100 group-hover:border-blue-100 transition-colors">{d.cargo}</p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-dashed border-gray-100 flex justify-between items-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
                                <span className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-100 group-hover:bg-blue-400 transition-colors" />
                                    Orden: {d.orden}
                                </span>
                                <MoreVertical size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {docentes.length === 0 && (
                <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[4rem] border border-dashed border-gray-200 shadow-sm mt-6 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-inner mb-6">
                        <GraduationCap size={48} />
                    </div>
                    <p className="text-gray-400 font-black text-xl tracking-tight">No hay docentes en el staff.</p>
                    <button onClick={() => setShowForm(true)} className="text-[#003087] font-black text-xs uppercase tracking-widest mt-4 hover:underline">Agregar primer docente</button>
                </div>
            )}
        </div>
    )
}

export default AdminDocentes;