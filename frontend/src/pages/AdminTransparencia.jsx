import { useEffect, useState } from 'react'
import { API } from '../services/api'
import Swal from 'sweetalert2'
import { 
  FolderTree, 
  FilePlus, 
  Trash2, 
  FileText, 
  ExternalLink,
  Info,
  X
} from 'lucide-react'

function AdminTransparencia() {
    const [documentos, setDocumentos] = useState([])
    const [filtro, setFiltro] = useState('Todos')
    const [showForm, setShowForm] = useState(false)
    
    // 1. Sincronizamos el estado inicial con los nombres de tu DB
    const [form, setForm] = useState({ 
        titulo: '', 
        categoria: 'normas', // Coincide con tu ENUM
        archivo_pdf: '',     // Antes archivo_url
        descripcion: ''      // Usaremos este campo para notas o el año
    })

    // 2. Categorías EXACTAS a tu ENUM de MySQL 
    const categorias = [
        { id: 'normas', label: 'Normas' },
        { id: 'resoluciones', label: 'Resoluciones' },
        { id: 'presupuesto', label: 'Presupuesto' },
        { id: 'plan_anual', label: 'Plan Anual' }
    ]

    useEffect(() => { cargarDocumentos() }, [])

    const cargarDocumentos = async () => {
        try {
            const res = await API.get('/transparencia')
            setDocumentos(res.data)
        } catch (error) {
            console.error("Error al cargar documentos:", error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = localStorage.getItem('token') // Obtenemos el token

        try {
            // Enviamos los nombres de campos exactos: titulo, descripcion, archivo_pdf, categoria
            await API.post('/transparencia', form, {
                headers: { Authorization: `Bearer ${token}` }
            })

            Swal.fire({
                title: 'Documento Publicado',
                text: 'El archivo está disponible en el portal',
                icon: 'success',
                confirmButtonColor: '#003087'
            })
            
            setForm({ titulo: '', categoria: 'normas', archivo_pdf: '', descripcion: '' })
            setShowForm(false)
            cargarDocumentos()
        } catch (error) {
            Swal.fire('Error', 'No se pudo subir el registro. Verifica los permisos.', 'error')
        }
    }

    const handleEliminar = async (id) => {
        const token = localStorage.getItem('token')
        const result = await Swal.fire({
            title: '¿Eliminar documento?',
            text: "Esta acción es irreversible",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, borrar'
        })
        if (result.isConfirmed) {
            try {
                await API.delete(`/transparencia/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                cargarDocumentos()
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar', 'error')
            }
        }
    }

    // Filtro corregido para usar "categoria"
    const docsFiltrados = filtro === 'Todos' 
        ? documentos 
        : documentos.filter(d => d.categoria === filtro)

    return (
        <div className="p-8 lg:p-12 bg-[#F8FAFC] dark:bg-slate-900 min-h-screen transition-colors duration-300 relative overflow-hidden">
            {/* Decorative background mesh */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-[#003087] dark:text-blue-300 font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 dark:bg-blue-900/30 w-fit px-4 py-2 rounded-full border border-blue-100/50 dark:border-blue-800/50">
                        <FolderTree size={14} className="animate-pulse" />
                        Gobierno Digital
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
                        Portal de <span className="text-[#003087] dark:text-blue-400">Transparencia</span>
                    </h2>
                    <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">Rendición de cuentas y normatividad institucional.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 group ${
                        showForm 
                        ? 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700' 
                        : 'bg-[#003087] text-white shadow-blue-900/30 hover:bg-blue-900'
                    }`}
                >
                    {showForm ? <><X size={18}/> Cancelar Registro</> : <><FilePlus size={18}/> Cargar Documento</>}
                </button>
            </div>

            {/* Formulario Sincronizado */}
            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-6 duration-500 mb-12 relative z-10">
                    <form onSubmit={handleSubmit} className="p-10 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-[3.5rem] shadow-2xl shadow-blue-900/10 dark:shadow-none border border-white dark:border-slate-700 flex flex-col gap-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-3 text-[#003087] font-black uppercase text-xs tracking-[0.2em]">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Info size={18}/>
                                </div>
                                Registro de Nuevo Documento Oficial
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Título del Recurso</label>
                                <input type="text" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required placeholder="Ej: Presupuesto Anual" />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Categoría Legal</label>
                                <select className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-black text-gray-700 outline-none transition-all cursor-pointer appearance-none" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Etiqueta / Año</label>
                                <input type="text" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Ej: Año Fiscal 2024" />
                            </div>
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Enlace de Acceso (PDF/Drive)</label>
                            <div className="relative">
                                <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input type="text" className="w-full p-5 pl-14 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-medium text-[#003087] outline-none transition-all" value={form.archivo_pdf} onChange={e => setForm({...form, archivo_pdf: e.target.value})} required placeholder="https://drive.google.com/..." />
                            </div>
                        </div>
                        <button className="bg-gradient-to-r from-[#003087] to-blue-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 transition-all active:scale-[0.98] text-xs">
                            Confirmar Publicación Oficial
                        </button>
                    </form>
                </div>
            )}

            {/* Filtros Premium */}
            <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar relative z-10">
                <button onClick={() => setFiltro('Todos')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${filtro === 'Todos' ? 'bg-[#003087] text-white shadow-blue-900/20' : 'bg-white text-gray-400 hover:bg-gray-50 border border-white'}`}>Todos los Recursos</button>
                {categorias.map(cat => (
                    <button key={cat.id} onClick={() => setFiltro(cat.id)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-xl active:scale-95 ${filtro === cat.id ? 'bg-[#003087] text-white shadow-blue-900/20' : 'bg-white text-gray-400 hover:bg-gray-50 border border-white'}`}>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Tabla Premium */}
            <div className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-gray-100">
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Recurso Documental</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Clasificación</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fecha de Alta</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Herramientas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {docsFiltrados.map(doc => (
                                <tr key={doc.id} className="hover:bg-blue-50/40 transition-all group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-sm shadow-red-900/5">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <div className="font-black text-gray-900 text-lg group-hover:text-[#003087] transition-colors tracking-tight">{doc.titulo}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                    {doc.descripcion || 'Sin metadatos'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="px-4 py-2 bg-blue-50 text-[#003087] rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100/50 group-hover:bg-white transition-colors">{doc.categoria}</span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                                            {new Date(doc.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <a href={doc.archivo_pdf} target="_blank" rel="noreferrer" className="p-4 bg-white border border-gray-100 text-[#003087] hover:bg-[#003087] hover:text-white rounded-2xl shadow-xl shadow-blue-900/10 transition-all" title="Ver documento">
                                                <ExternalLink size={20} />
                                            </a>
                                            <button onClick={() => handleEliminar(doc.id)} className="p-4 bg-white border border-gray-100 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl shadow-xl shadow-red-900/10 transition-all" title="Eliminar registro">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {docsFiltrados.length === 0 && (
                    <div className="text-center py-24 bg-slate-50/30 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200 mb-6 shadow-inner">
                            <FolderTree size={40} />
                        </div>
                        <p className="text-gray-400 dark:text-slate-400 font-black text-lg tracking-tight">No se encontraron documentos en esta categoría.</p>
                        <button onClick={() => setFiltro('Todos')} className="text-[#003087] font-black text-[10px] uppercase tracking-widest mt-4 hover:underline">Ver todos los archivos</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminTransparencia;