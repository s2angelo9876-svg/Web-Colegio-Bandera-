import { useEffect, useState } from 'react'
import { API, UPLOADS_URL } from '../services/api'
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

function AdminDocumentosInstitucionales() {
    const [documentos, setDocumentos] = useState([])
    const [filtro, setFiltro] = useState('Todos')
    const [showForm, setShowForm] = useState(false)
    const [subiendo, setSubiendo] = useState(false)
    
    const [form, setForm] = useState({ 
        titulo: '', 
        categoria: 'Gestion',
        descripcion: ''
    })
    const [selectedFile, setSelectedFile] = useState(null)

    const categorias = [
        { id: 'Gestion', label: 'Documentos de Gestión' },
        { id: 'Normativa', label: 'Normativas e Internos' },
        { id: 'Comunicado', label: 'Comunicados Oficiales' },
        { id: 'Otros', label: 'Otros' }
    ]

    useEffect(() => { cargarDocumentos() }, [])

    const cargarDocumentos = async () => {
        try {
            const res = await API.get('/transparencia')
            setDocumentos(res.data || [])
        } catch { /* ignore error */ }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedFile) {
            Swal.fire('Error', 'Por favor selecciona un archivo PDF o documento', 'error')
            return;
        }

        setSubiendo(true)
        const formData = new FormData()
        formData.append('titulo', form.titulo)
        formData.append('categoria', form.categoria)
        formData.append('descripcion', form.descripcion)
        formData.append('archivo_pdf', selectedFile)

        try {
            await API.post('/transparencia', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            Swal.fire({
                title: 'Documento Publicado',
                text: 'El archivo está disponible en el portal de documentos',
                icon: 'success',
                confirmButtonColor: '#003087'
            })
            
            setForm({ titulo: '', categoria: 'Gestion', descripcion: '' })
            setSelectedFile(null)
            // Reset input file element
            document.getElementById('input-file-pdf').value = '';
            setShowForm(false)
            cargarDocumentos()
        } catch {
            Swal.fire('Error', 'No se pudo subir el archivo. Revisa el tamaño (max 10MB) y tipo (PDF/doc).', 'error')
        } finally {
            setSubiendo(false)
        }
    }

    const handleEliminar = async (id) => {
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
                await API.delete(`/transparencia/${id}`)
                cargarDocumentos()
                Swal.fire('Eliminado', 'El documento ha sido borrado del sistema.', 'success')
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el documento.', 'error')
            }
        }
    }

    const docsFiltrados = filtro === 'Todos' 
        ? documentos 
        : documentos.filter(d => d.categoria === filtro)

    return (
        <div className="p-8 lg:p-12 bg-surface dark:bg-dark-bg min-h-screen transition-colors duration-300 relative overflow-hidden font-sans">
            {/* Decorative background mesh */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-primary dark:text-blue-300 font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 dark:bg-dark-accent/40 w-fit px-4 py-2 rounded-full border border-blue-100/50 dark:border-dark-accent/50">
                        <FolderTree size={14} className="animate-pulse" />
                        Gobierno Digital
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4 uppercase">
                        Documentos <span className="text-primary dark:text-blue-400">Institucionales</span>
                    </h2>
                    <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">Administración de archivos oficiales de gestión escolar.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 group ${
                        showForm 
                        ? 'bg-white dark:bg-dark-card text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover' 
                        : 'bg-primary text-white shadow-blue-900/30 hover:bg-blue-900'
                    }`}
                >
                    {showForm ? <><X size={18}/> Cancelar Registro</> : <><FilePlus size={18}/> Cargar Documento</>}
                </button>
            </div>

            {/* Formulario */}
            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-6 duration-500 mb-12 relative z-10">
                    <form onSubmit={handleSubmit} className="p-10 bg-white/80 dark:bg-dark-card backdrop-blur-xl rounded-[3.5rem] shadow-2xl shadow-blue-900/10 dark:shadow-none border border-white dark:border-dark-border flex flex-col gap-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.2em]">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Info size={18}/>
                                </div>
                                Registro de Nuevo Documento Oficial
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Título del Recurso</label>
                                <input type="text" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required placeholder="Ej: Reglamento Interno de Convivencia" />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Categoría Legal</label>
                                <select className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-black text-gray-700 outline-none transition-all cursor-pointer appearance-none" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Descripción Corta</label>
                                <input type="text" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Ej: Edición Oficial 2026" />
                            </div>
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Archivo PDF / Word Oficial</label>
                            <div className="relative">
                                <input 
                                    id="input-file-pdf"
                                    type="file" 
                                    accept=".pdf,.doc,.docx"
                                    className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-700 outline-none transition-all cursor-pointer" 
                                    onChange={e => setSelectedFile(e.target.files[0])} 
                                    required 
                                />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={subiendo}
                            className="bg-gradient-to-r from-primary to-blue-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 transition-all active:scale-[0.98] text-xs disabled:opacity-50"
                        >
                            {subiendo ? 'Subiendo archivo...' : 'Confirmar Publicación Oficial'}
                        </button>
                    </form>
                </div>
            )}

            {/* Filtros */}
            <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar relative z-10">
                <button onClick={() => setFiltro('Todos')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${filtro === 'Todos' ? 'bg-primary text-white shadow-blue-900/20' : 'bg-white dark:bg-dark-card text-gray-400 hover:bg-gray-50 border border-white dark:border-dark-border'}`}>Todos los Recursos</button>
                {categorias.map(cat => (
                    <button key={cat.id} onClick={() => setFiltro(cat.id)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-xl active:scale-95 ${filtro === cat.id ? 'bg-primary text-white shadow-blue-900/20' : 'bg-white dark:bg-dark-card text-gray-400 hover:bg-gray-50 border border-white dark:border-dark-border'}`}>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Tabla */}
            <div className="bg-white/70 dark:bg-dark-card/90 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-white dark:border-dark-border overflow-hidden relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-gray-100 dark:border-dark-border">
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Recurso Documental</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Clasificación</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fecha de Alta</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Herramientas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50 dark:divide-dark-border">
                            {docsFiltrados.map(doc => (
                                <tr key={doc.id} className="hover:bg-blue-50/40 dark:hover:bg-dark-hover transition-all group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-sm shadow-red-900/5">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <div className="font-black text-gray-900 dark:text-white text-lg group-hover:text-primary dark:group-hover:text-blue-400 transition-colors tracking-tight uppercase">{doc.titulo}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700" />
                                                    {doc.descripcion || 'Sin descripción'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 text-primary dark:text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100/50 dark:border-blue-900/40 group-hover:bg-white dark:group-hover:bg-dark-card transition-colors">{doc.categoria}</span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                                            {new Date(doc.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <a href={doc.archivo_pdf?.startsWith('http') ? doc.archivo_pdf : `${UPLOADS_URL}/${doc.archivo_pdf}`} target="_blank" rel="noreferrer" className="p-4 bg-white dark:bg-dark-input border border-gray-100 dark:border-dark-border text-primary dark:text-blue-400 hover:bg-primary dark:hover:bg-blue-500 hover:text-white rounded-2xl shadow-xl transition-all" title="Ver documento">
                                                <ExternalLink size={20} />
                                            </a>
                                            <button onClick={() => handleEliminar(doc.id)} className="p-4 bg-white dark:bg-dark-input border border-gray-100 dark:border-dark-border text-red-500 hover:bg-red-500 hover:text-white rounded-2xl shadow-xl transition-all" title="Eliminar registro">
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
                        <button onClick={() => setFiltro('Todos')} className="text-primary font-black text-[10px] uppercase tracking-widest mt-4 hover:underline">Ver todos los archivos</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminDocumentosInstitucionales;
