import { useEffect, useState } from 'react'
import { API, UPLOADS_URL } from '../services/api'
import Swal from 'sweetalert2'
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  X,
  Info,
  Calendar,
  Upload,
  Play,
  Film
} from 'lucide-react'

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

function AdminGaleria() {
    const [mediaItems, setMediaItems] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [selectedYear, setSelectedYear] = useState('Todos')
    const [subiendo, setSubiendo] = useState(false)
    
    const [form, setForm] = useState({ 
        titulo: '', 
        descripcion: '',
        dia: new Date().getDate().toString(),
        mes: (new Date().getMonth() + 1).toString(),
        anio: new Date().getFullYear().toString(),
        tipo: 'foto', // 'foto' | 'video'
        video_url: ''
    })
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)

    useEffect(() => { cargarGaleria() }, [])

    const cargarGaleria = async () => {
        try {
            const res = await API.get('/galeria')
            setMediaItems(res.data || [])
        } catch (error) {
            console.error("Error al cargar la galería:", error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (form.tipo === 'foto' && !file) {
            Swal.fire('Error', 'Por favor selecciona una imagen para subir', 'error')
            return;
        }

        setSubiendo(true)
        try {
            const formData = new FormData()
            formData.append('titulo', form.titulo)
            formData.append('descripcion', form.descripcion)
            formData.append('dia', form.dia)
            formData.append('mes', form.mes)
            formData.append('anio', form.anio)
            formData.append('tipo', form.tipo)
            formData.append('video_url', form.video_url)
            if (file) formData.append('imagen', file)

            await API.post('/galeria', formData)

            Toast.fire({
                title: 'Elemento Agregado',
                text: `Publicado en la galería ${form.anio}`,
                icon: 'success'
            })
            
            setForm({ 
                titulo: '', 
                descripcion: '',
                dia: new Date().getDate().toString(),
                mes: (new Date().getMonth() + 1).toString(),
                anio: new Date().getFullYear().toString(),
                tipo: 'foto',
                video_url: ''
            })
            setFile(null)
            setPreview(null)
            setShowForm(false)
            cargarGaleria()
        } catch (error) {
            console.error("Error submit:", error)
            Swal.fire('Error', 'No se pudo publicar el elemento multimedia.', 'error')
        } finally {
            setSubiendo(false)
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            setPreview(URL.createObjectURL(selectedFile))
        }
    }

    const years = ['Todos', ...new Set(mediaItems.map(f => {
        const yr = f.anio || new Date(f.fecha_publicacion || f.created_at).getFullYear().toString();
        return yr;
    }))].sort((a, b) => b - a)

    const filteredItems = selectedYear === 'Todos' 
        ? mediaItems 
        : mediaItems.filter(f => {
            const yr = f.anio || new Date(f.fecha_publicacion || f.created_at).getFullYear().toString();
            return yr === selectedYear;
        })

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar elemento?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar'
        })
        if (result.isConfirmed) {
            try {
                await API.delete(`/galeria/${id}`)
                Toast.fire({
                    title: 'Elemento eliminado',
                    icon: 'success'
                })
                cargarGaleria()
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el elemento de la galería', 'error')
            }
        }
    }

    return (
        <div className="p-8 lg:p-12 bg-surface dark:bg-dark-bg min-h-screen transition-colors duration-300 relative overflow-hidden font-sans">
            {/* Decorative background mesh */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-primary dark:text-blue-300 font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 dark:bg-dark-accent/40 w-fit px-4 py-2 rounded-full border border-blue-100/50 dark:border-dark-accent/50">
                        <ImageIcon size={14} className="animate-pulse" />
                        Archivo Visual
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4 uppercase">
                        Galería <span className="text-primary dark:text-blue-400">Multimedia</span>
                    </h2>
                    <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">Administración de fotos y videos oficiales del colegio.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 group ${
                        showForm 
                        ? 'bg-white dark:bg-dark-card text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover' 
                        : 'bg-primary text-white shadow-blue-900/30 hover:bg-blue-900'
                    }`}
                >
                    {showForm ? <><X size={18}/> Cancelar</> : <><Plus size={18}/> Nuevo Elemento</>}
                </button>
            </div>

            {/* Filtro de Años */}
            <div className="flex flex-wrap gap-3 mb-10 relative z-10 font-black">
                {years.map(year => (
                    <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] uppercase tracking-widest transition-all border ${
                            selectedYear === year
                            ? 'bg-primary border-primary text-white shadow-lg shadow-blue-900/20'
                            : 'bg-white dark:bg-dark-card text-gray-400 hover:bg-blue-50 border-white dark:border-dark-border'
                        }`}
                    >
                        {year === 'Todos' ? 'Toda la Galería' : `Año ${year}`}
                    </button>
                ))}
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
                                Detalles del Recurso Multimedia
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Título descriptivo</label>
                                <input type="text" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required placeholder="Ej: Ceremonia del Día del Logro" />
                            </div>
                            
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Tipo de Recurso</label>
                                <select className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-black text-gray-700 outline-none transition-all appearance-none cursor-pointer" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} required>
                                    <option value="foto">Fotografía</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Descripción Corta</label>
                                <input type="text" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Ej: Participación de secundaria" />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Día</label>
                                <input type="number" min="1" max="31" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.dia} onChange={e => setForm({...form, dia: e.target.value})} required />
                            </div>
                            
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Mes</label>
                                <select className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all appearance-none" value={form.mes} onChange={e => setForm({...form, mes: e.target.value})} required>
                                    <option value="1">Enero</option>
                                    <option value="2">Febrero</option>
                                    <option value="3">Marzo</option>
                                    <option value="4">Abril</option>
                                    <option value="5">Mayo</option>
                                    <option value="6">Junio</option>
                                    <option value="7">Julio</option>
                                    <option value="8">Agosto</option>
                                    <option value="9">Septiembre</option>
                                    <option value="10">Octubre</option>
                                    <option value="11">Noviembre</option>
                                    <option value="12">Diciembre</option>
                                </select>
                            </div>
                            
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Año</label>
                                <input type="number" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.anio} onChange={e => setForm({...form, anio: e.target.value})} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">
                                    {form.tipo === 'video' ? 'Miniatura del Video (Opcional)' : 'Seleccionar Imagen Principal *'}
                                </label>
                                <div className="relative">
                                    <label className="flex items-center gap-3 w-full p-5 rounded-2xl bg-slate-50/50 border-2 border-dashed border-gray-200 cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-all">
                                        <Upload size={20} className="text-gray-400" />
                                        <span className="text-sm font-bold text-gray-500 truncate">{file ? file.name : 'Subir imagen...'}</span>
                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" required={form.tipo === 'foto'} />
                                    </label>
                                </div>
                            </div>

                            {form.tipo === 'video' && (
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-primary transition-colors">Enlace / URL del Video (YouTube o local)</label>
                                    <div className="relative">
                                        <Film className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        <input 
                                            type="text" 
                                            className="w-full p-5 pl-14 rounded-2xl bg-slate-50/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50 font-medium text-primary outline-none transition-all" 
                                            value={form.video_url} 
                                            onChange={e => setForm({...form, video_url: e.target.value})} 
                                            required={form.tipo === 'video'} 
                                            placeholder="https://www.youtube.com/watch?v=..." 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {preview && (
                            <div className="relative w-full max-w-md aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white mx-auto">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => {setFile(null); setPreview(null)}} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transition-all">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={subiendo}
                            className="bg-gradient-to-r from-primary to-blue-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 transition-all active:scale-[0.98] text-xs disabled:opacity-50"
                        >
                            {subiendo ? 'Subiendo recurso...' : 'Publicar en Galería'}
                        </button>
                    </form>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
                {filteredItems.map(foto => (
                    <div key={foto.id} className="bg-white/70 dark:bg-dark-card/90 backdrop-blur-sm rounded-[3rem] overflow-hidden shadow-xl shadow-blue-900/5 border border-white dark:border-dark-border group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col h-full">
                        <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                            <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <span className="bg-white/95 backdrop-blur-sm text-primary text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg border border-white">
                                    Año {foto.anio || new Date(foto.fecha_publicacion).getFullYear()}
                                </span>
                                <span className="bg-slate-900/80 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg">
                                    {foto.tipo === 'video' ? 'Video' : 'Foto'}
                                </span>
                            </div>
                            
                            {foto.imagen_url ? (
                                <img src={foto.imagen_url?.startsWith('http') ? foto.imagen_url : `${UPLOADS_URL}/${foto.imagen_url}`} alt={foto.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                    <Play size={40} className="animate-pulse text-red-500 fill-red-500" />
                                </div>
                            )}
                            
                            {foto.tipo === 'video' && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <Play size={48} className="text-white fill-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                                </div>
                            )}
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-all duration-500"></div>
                            
                            <div className="absolute top-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all z-20">
                                <button 
                                    onClick={() => handleEliminar(foto.id)}
                                    className="bg-white/90 backdrop-blur-sm text-red-500 p-4 rounded-2xl hover:bg-red-500 hover:text-white shadow-2xl transition-all border border-red-50 dark:border-dark-border"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 flex flex-col justify-between flex-1">
                            <div>
                                <h4 className="font-black text-gray-900 dark:text-white text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors tracking-tight uppercase">
                                    {foto.titulo}
                                </h4>
                                <p className="text-xs text-gray-400 dark:text-slate-400 mt-2 line-clamp-1">
                                    {foto.descripcion || 'Sin descripción'}
                                </p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-dashed border-gray-100 dark:border-dark-border flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-3 py-1.5 rounded-lg">
                                    {foto.dia && foto.mes ? `${foto.dia} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][foto.mes-1]}` : 'Fecha'}
                                </span>
                                <div className="w-2 h-2 rounded-full bg-blue-100 group-hover:bg-primary dark:group-hover:bg-blue-400 animate-pulse transition-colors" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {mediaItems.length === 0 && (
                <div className="text-center py-24 bg-white/50 dark:bg-dark-card/60 backdrop-blur-sm rounded-[4rem] border border-dashed border-gray-200 dark:border-dark-border shadow-sm flex flex-col items-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-inner mb-6">
                        <ImageIcon size={48} />
                    </div>
                    <p className="text-gray-400 dark:text-slate-400 font-black text-xl tracking-tight">La galería está vacía.</p>
                    <button onClick={() => setShowForm(true)} className="text-primary font-black text-xs uppercase tracking-widest mt-4 hover:underline">Subir primer elemento</button>
                </div>
            )}
        </div>
    )
}

export default AdminGaleria;