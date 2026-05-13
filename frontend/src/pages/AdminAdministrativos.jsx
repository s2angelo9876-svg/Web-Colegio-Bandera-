import { useEffect, useState } from 'react'
import { API, UPLOADS_URL } from '../services/api'
import Swal from 'sweetalert2'
import { UserPlus, Trash2, Briefcase, Image as ImageIcon, X, Info } from 'lucide-react'

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

function AdminAdministrativos() {
    const [personal, setPersonal] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ nombre: '', cargo: '', area: '', imagen_url: '' })

    useEffect(() => { cargarPersonal() }, [])

    const cargarPersonal = async () => {
        try {
            const res = await API.get('/administrativos')
            setPersonal(res.data)
        } catch (error) {
            console.error("Error cargando administrativos", error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await API.post('/administrativos', form)
            Toast.fire({ title: 'Personal Registrado', icon: 'success' })
            setForm({ nombre: '', cargo: '', area: '', imagen_url: '' })
            setShowForm(false)
            cargarPersonal()
        } catch (error) {
            Swal.fire('Error', 'No se pudo registrar el personal', 'error')
        }
    }

    const handleEliminar = async (id) => {
        const res = await Swal.fire({
            title: '¿Eliminar registro?',
            text: "Se borrará del organigrama administrativo",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar'
        })
        if (res.isConfirmed) {
            await API.delete(`/administrativos/${id}`)
            Toast.fire({ title: 'Registro eliminado', icon: 'success' })
            cargarPersonal()
        }
    }

    return (
        <div className="p-8 lg:p-12 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen transition-colors duration-300 relative overflow-hidden">
            {/* Decorative background mesh */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-[#003087] dark:text-blue-300 font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 dark:bg-dark-accent/40 w-fit px-4 py-2 rounded-full border border-blue-100/50 dark:border-dark-accent/50">
                        <Briefcase size={14} className="animate-pulse" />
                        Operaciones Institucionales
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
                        Gestión <span className="text-[#003087] dark:text-blue-400">Administrativa</span>
                    </h2>
                    <p className="text-gray-400 dark:text-gray-400 font-bold text-lg">Administra el personal no docente y áreas de soporte.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 group ${showForm
                            ? 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover'
                            : 'bg-[#003087] text-white shadow-blue-900/30 hover:bg-blue-900'
                        }`}
                >
                    {showForm ? <><X size={18} /> Cancelar</> : <><UserPlus size={18} /> Nuevo Administrativo</>}
                </button>
            </div>

            {/* Formulario Animado */}
            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-6 duration-500 mb-12 relative z-10">
                    <form onSubmit={handleSubmit} className="p-10 bg-white/80 dark:bg-dark-card backdrop-blur-xl rounded-[3.5rem] shadow-2xl shadow-blue-900/10 dark:shadow-none border border-white dark:border-dark-border flex flex-col gap-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-3 text-[#003087] font-black uppercase text-xs tracking-[0.2em]">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Info size={18} />
                                </div>
                                Registro de Nuevo Personal Administrativo
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Nombre Completo</label>
                                <input type="text" placeholder="Ej: María Gonzales" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Cargo</label>
                                <input type="text" placeholder="Ej: Secretaria General" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} required />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Área / Oficina</label>
                                <input type="text" placeholder="Ej: Tesorería" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">URL de Foto</label>
                                <input type="text" placeholder="https://..." className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-medium text-[#003087] outline-none transition-all" value={form.imagen_url} onChange={e => setForm({ ...form, imagen_url: e.target.value })} />
                            </div>
                        </div>
                        <button className="bg-gradient-to-r from-[#003087] to-blue-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 transition-all active:scale-[0.98] text-xs">
                            Confirmar Registro Administrativo
                        </button>
                    </form>
                </div>
            )}

            {/* Listado de Personal Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
                {personal.map(p => (
                    <div key={p.id} className="bg-white/70 dark:bg-dark-card/90 backdrop-blur-sm p-8 rounded-[3.5rem] shadow-xl shadow-blue-900/5 flex flex-col items-center gap-6 relative group border border-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full">
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button onClick={() => handleEliminar(p.id)} className="bg-white dark:bg-dark-input text-red-500 p-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-900/10 dark:shadow-none border border-red-50 dark:border-dark-border">
                                <Trash2 size={20} />
                            </button>
                        </div>
                        <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 overflow-hidden shrink-0 shadow-2xl border-4 border-white relative group">
                            {p.imagen_url ? (
                                <img src={p.imagen_url?.startsWith('http') ? p.imagen_url : `${UPLOADS_URL}/${p.imagen_url}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.nombre} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                    <ImageIcon size={40} className="opacity-20" />
                                </div>
                            )}
                        </div>
                        <div className="text-center w-full">
                            <span className="bg-blue-50 text-[#003087] text-[9px] font-black uppercase px-4 py-1.5 rounded-xl mb-4 inline-block tracking-[0.2em] border border-blue-100/50 group-hover:bg-white transition-colors">{p.area || 'Administración'}</span>
                            <h4 className="font-black text-gray-900 dark:text-white text-xl leading-tight mb-2 group-hover:text-[#003087] transition-colors line-clamp-2 tracking-tight">{p.nombre}</h4>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.1em]">{p.cargo}</p>
                        </div>
                        <div className="mt-auto pt-6 w-full flex justify-center">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-100 group-hover:bg-[#003087] transition-colors" />
                                <div className="w-4 h-1.5 rounded-full bg-blue-50 group-hover:bg-red-500 transition-colors" />
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-100 group-hover:bg-[#003087] transition-colors" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {personal.length === 0 && (
                <div className="text-center py-24 bg-white/50 dark:bg-dark-card/60 backdrop-blur-sm rounded-[4rem] border border-dashed border-gray-200 dark:border-dark-border shadow-sm flex flex-col items-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-inner mb-6">
                        <Briefcase size={48} />
                    </div>
                    <p className="text-gray-400 dark:text-gray-400 font-black text-xl tracking-tight">No hay personal administrativo.</p>
                    <button onClick={() => setShowForm(true)} className="text-[#003087] font-black text-xs uppercase tracking-widest mt-4 hover:underline">Registrar primer ingreso</button>
                </div>
            )}
        </div>
    )
}

export default AdminAdministrativos;