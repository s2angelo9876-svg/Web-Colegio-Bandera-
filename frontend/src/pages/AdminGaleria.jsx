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
  Upload
} from 'lucide-react'

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

function AdminGaleria() {
    const [fotos, setFotos] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [selectedYear, setSelectedYear] = useState('Todos')
    const [form, setForm] = useState({ 
        titulo: '', 
        dia: new Date().getDate().toString(),
        mes: (new Date().getMonth() + 1).toString(),
        anio: new Date().getFullYear().toString() 
    })
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)

    useEffect(() => { cargarGaleria() }, [])

    const cargarGaleria = async () => {
        try {
            const res = await API.get('/galeria')
            setFotos(res.data)
        } catch (error) {
            console.error("Error al cargar la galería:", error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('titulo', form.titulo)
            formData.append('dia', form.dia)
            formData.append('mes', form.mes)
            formData.append('anio', form.anio)
            if (file) formData.append('imagen', file)

            await API.post('/galeria', formData)

            Toast.fire({
                title: 'Imagen Agregada',
                text: `Publicada en la galería ${form.anio}`,
                icon: 'success'
            })
            setForm({ 
                titulo: '', 
                dia: new Date().getDate().toString(),
                mes: (new Date().getMonth() + 1).toString(),
                anio: new Date().getFullYear().toString() 
            })
            setFile(null)
            setPreview(null)
            setShowForm(false)
            cargarGaleria()
        } catch (error) {
            console.error("Error submit:", error)
            Swal.fire('Error', 'No se pudo subir la imagen. Verifica la conexión.', 'error')
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            setPreview(URL.createObjectURL(selectedFile))
        }
    }

    const years = ['Todos', ...new Set(fotos.map(f => f.anio || new Date(f.fecha_publicacion).getFullYear().toString()))].sort((a, b) => b - a)
    const filteredFotos = selectedYear === 'Todos' 
        ? fotos 
        : fotos.filter(f => (f.anio || new Date(f.fecha_publicacion).getFullYear().toString()) === selectedYear)

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar imagen?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar'
        })
        if (result.isConfirmed) {
            await API.delete(`/galeria/${id}`)
            Toast.fire({
                title: 'Imagen eliminada',
                icon: 'success'
            })
            cargarGaleria()
        }
    }

    return (
        <div className="p-8 lg:p-12 bg-[#F8FAFC] dark:bg-slate-900 min-h-screen transition-colors duration-300 relative overflow-hidden">
            {/* Decorative background mesh */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-[#003087] dark:text-blue-300 font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 dark:bg-blue-900/30 w-fit px-4 py-2 rounded-full border border-blue-100/50 dark:border-blue-800/50">
                        <ImageIcon size={14} className="animate-pulse" />
                        Archivo Visual
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
                        Galería <span className="text-[#003087] dark:text-blue-400">Institucional</span>
                    </h2>
                    <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">Preservando la memoria visual de nuestra comunidad.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 group ${
                        showForm 
                        ? 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700' 
                        : 'bg-[#003087] text-white shadow-blue-900/30 hover:bg-blue-900'
                    }`}
                >
                    {showForm ? <><X size={18}/> Cancelar</> : <><Plus size={18}/> Nueva Imagen</>}
                </button>
            </div>

            {/* Filtro de Años */}
            <div className="flex flex-wrap gap-3 mb-10 relative z-10">
                {years.map(year => (
                    <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            selectedYear === year
                            ? 'bg-[#003087] text-white shadow-lg shadow-blue-900/20'
                            : 'bg-white text-gray-400 hover:bg-blue-50 hover:text-[#003087] border border-gray-100'
                        }`}
                    >
                        {year === 'Todos' ? 'Toda la Galería' : `Año ${year}`}
                    </button>
                ))}
            </div>

            {/* Formulario Animado */}
            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-6 duration-500 mb-12 relative z-10">
                    <form onSubmit={handleSubmit} className="p-10 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-[3.5rem] shadow-2xl shadow-blue-900/10 dark:shadow-none border border-white dark:border-slate-700 flex flex-col gap-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-3 text-[#003087] font-black uppercase text-xs tracking-[0.2em]">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Info size={18}/>
                                </div>
                                Detalles de la Nueva Captura
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Título descriptivo</label>
                                <input type="text" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required placeholder="Ej: Aniversario Institucional" />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Día</label>
                                <input type="number" min="1" max="31" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.dia} onChange={e => setForm({...form, dia: e.target.value})} required />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Mes</label>
                                <select className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all appearance-none" value={form.mes} onChange={e => setForm({...form, mes: e.target.value})} required>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Año</label>
                                <input type="number" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.anio} onChange={e => setForm({...form, anio: e.target.value})} required />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Seleccionar Fotografía</label>
                                <div className="relative">
                                    <label className="flex items-center gap-3 w-full p-5 rounded-2xl bg-slate-50/50 border border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#003087] hover:bg-blue-50/30 transition-all">
                                        <Upload size={20} className="text-gray-400" />
                                        <span className="text-sm font-bold text-gray-500">{file ? file.name : 'Subir imagen...'}</span>
                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" required />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {preview && (
                            <div className="relative w-full max-w-md aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white mx-auto">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button onClick={() => {setFile(null); setPreview(null)}} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transition-all">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <button className="bg-gradient-to-r from-[#003087] to-blue-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 transition-all active:scale-[0.98] text-xs">
                            Publicar en Galería
                        </button>
                    </form>
                </div>
            )}

            {/* Grid de la Galería Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
                {filteredFotos.map(foto => (
                    <div key={foto.id} className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm rounded-[3rem] overflow-hidden shadow-xl shadow-blue-900/5 border border-white group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col h-full">
                        <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                            <div className="absolute top-4 left-4 z-10">
                                <span className="bg-white/90 backdrop-blur-sm text-[#003087] text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg border border-white">
                                    Año {foto.anio || new Date(foto.fecha_publicacion).getFullYear()}
                                </span>
                            </div>
                            {foto.imagen_url ? (
                                <img src={foto.imagen_url?.startsWith('http') ? foto.imagen_url : `${UPLOADS_URL}/${foto.imagen_url}`} alt={foto.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                    <ImageIcon size={64} className="opacity-20" />
                                </div>
                            )}
                            
                            {/* Overlay dinámico */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#001D52] via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-all duration-500"></div>
                            
                            <div className="absolute top-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                <button 
                                    onClick={() => handleEliminar(foto.id)}
                                    className="bg-white/90 backdrop-blur-sm text-red-500 p-4 rounded-2xl hover:bg-red-500 hover:text-white shadow-2xl transition-all border border-red-50"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 flex flex-col justify-between flex-1">
                            <h4 className="font-black text-gray-900 dark:text-white text-lg leading-tight line-clamp-2 group-hover:text-[#003087] transition-colors tracking-tight">
                                {foto.titulo}
                            </h4>
                            <div className="mt-6 pt-6 border-t border-dashed border-gray-100 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#003087] bg-blue-50 px-3 py-1.5 rounded-lg">
                                    {foto.dia && foto.mes ? `${foto.dia} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][foto.mes-1]}` : 'Fecha'}
                                </span>
                                <div className="w-2 h-2 rounded-full bg-blue-100 group-hover:bg-[#003087] animate-pulse transition-colors" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {fotos.length === 0 && (
                <div className="text-center py-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[4rem] border border-dashed border-gray-200 dark:border-slate-700 shadow-sm flex flex-col items-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-inner mb-6">
                        <ImageIcon size={48} />
                    </div>
                    <p className="text-gray-400 dark:text-slate-400 font-black text-xl tracking-tight">La galería está vacía.</p>
                    <button onClick={() => setShowForm(true)} className="text-[#003087] font-black text-xs uppercase tracking-widest mt-4 hover:underline">Subir primera fotografía</button>
                </div>
            )}
        </div>
    )
}

export default AdminGaleria;