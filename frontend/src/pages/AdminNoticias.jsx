import { useEffect, useState, useCallback } from 'react'
import { getNoticias, API, UPLOADS_URL } from '../services/api' 
import Swal from 'sweetalert2'
import { 
  Plus, X, Trash2, Image as ImageIcon, Search, 
  AlertCircle, Loader2, Send, Edit3, Type, FileText,
  Calendar as CalendarIcon, ExternalLink, Newspaper, Info
} from 'lucide-react'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true
});

function AdminNoticias() {
  const [noticias, setNoticias] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [cargando, setCargando] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editMode, setEditMode] = useState(null) // ID de la noticia a editar
  const [busqueda, setBusqueda] = useState('')
  
  // Estados del Formulario
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [imagen, setImagen] = useState(null)
  const [preview, setPreview] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => { cargarNoticias(pagination.page) }, [pagination.page])

  useEffect(() => {
    if (!imagen) { setPreview(null); return }
    const objectUrl = URL.createObjectURL(imagen)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imagen])

  const cargarNoticias = async (page = 1) => {
    setCargando(true)
    try {
      const res = await getNoticias({ page, limit: 10 })
      setNoticias(res.data.data)
      setPagination(prev => ({ ...prev, totalPages: res.data.pagination.totalPages }))
    } catch (error) {
      console.error(error)
    } finally { setCargando(false) }
  }

  // Activar modo edición
  const prepararEdicion = (n) => {
    setEditMode(n.id)
    setTitulo(n.titulo)
    setContenido(n.contenido)
    setPreview(`${UPLOADS_URL}/${n.imagen}`)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setShowForm(false)
    setEditMode(null)
    setTitulo('')
    setContenido('')
    setImagen(null)
    setPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    
    const formData = new FormData()
    formData.append('titulo', titulo)
    formData.append('contenido', contenido)
    if (imagen) formData.append('imagen', imagen)

    try {
      if (editMode) {
        await API.put(`/noticias/${editMode}`, formData)
        Toast.fire({ icon: 'success', title: 'Noticia actualizada' })
      } else {
        await API.post('/noticias', formData)
        Toast.fire({ icon: 'success', title: 'Noticia publicada' })
      }
      resetForm()
      cargarNoticias()
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema con la operación', 'error')
    } finally { setEnviando(false) }
  }

  const handleEliminar = (id) => {
    Swal.fire({
      title: '¿Confirmar eliminación?',
      text: "Esta acción es irreversible",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, borrar definitivamente',
      cancelButtonText: 'No, mantener'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/noticias/${id}`)
          Toast.fire({ icon: 'success', title: 'Eliminado correctamente' })
          cargarNoticias()
        } catch (error) { Swal.fire('Error', 'No se pudo eliminar', 'error') }
      }
    })
  }

  const noticiasFiltradas = noticias.filter(n => 
    n.titulo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-8 lg:p-12 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen relative overflow-hidden transition-colors duration-300">
      {/* Decorative background mesh */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      {/* Header Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
          <div className="animate-in fade-in slide-in-from-left duration-700">
              <div className="flex items-center gap-2 text-[#003087] dark:text-[#7cb3ff] font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 dark:bg-[#1a2d4a]/40 w-fit px-4 py-2 rounded-full border border-blue-100/50 dark:border-[#2a4a6a]/50">
                  <Newspaper size={14} className="animate-pulse" />
                  Gestión Editorial
              </div>
              <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
                  Portal de <span className="text-[#003087] dark:text-[#60a5fa]">Noticias</span>
              </h2>
              <p className="text-gray-400 dark:text-gray-400 font-bold text-lg">Administra la comunicación y novedades del plantel.</p>
          </div>
          <button 
              onClick={() => showForm ? resetForm() : setShowForm(true)} 
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 group ${
                  showForm 
                  ? 'bg-white dark:bg-[#1a2332] text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-[#2a3441] hover:bg-gray-50 dark:hover:bg-[#243040]' 
                  : 'bg-[#003087] text-white shadow-blue-900/30 hover:bg-blue-900'
              }`}
          >
              {showForm ? <><X size={18}/> Cancelar Edición</> : <><Plus size={18}/> Redactar Noticia</>}
          </button>
      </div>

      {/* FORMULARIO AVANZADO */}
      {showForm && (
        <div className="animate-in fade-in slide-in-from-top-6 duration-500 mb-12 relative z-10">
          <form onSubmit={handleSubmit} className="p-10 bg-white/80 dark:bg-[#1a2332] backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-blue-900/10 dark:shadow-none border border-white dark:border-[#2a3441] flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3 text-[#003087] font-black uppercase text-xs tracking-[0.2em]">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        {editMode ? <Edit3 size={18}/> : <Plus size={18}/>}
                    </div>
                    {editMode ? 'Editando Publicación Existente' : 'Componer Nueva Publicación'}
                </div>
                <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#003087]" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-8">
                <div className="relative space-y-2 group">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-[0.2em] flex items-center gap-2 group-focus-within:text-[#003087] transition-colors">
                      <Type size={14} /> Titular de la Noticia
                  </label>
                  <input 
                    type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required maxLength="100"
                    className="w-full bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 p-6 rounded-2xl outline-none transition-all font-black text-xl text-gray-800 placeholder:text-gray-300"
                    placeholder="Ingrese un titular impactante..."
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-[0.2em] flex items-center gap-2 group-focus-within:text-[#003087] transition-colors">
                      <FileText size={14} /> Contenido Detallado
                  </label>
                  <textarea 
                    value={contenido} onChange={(e) => setContenido(e.target.value)} required
                    className="w-full bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 p-8 rounded-[2rem] h-80 outline-none transition-all font-bold text-gray-600 leading-relaxed resize-none text-lg"
                    placeholder="Desarrolle la información aquí..."
                  />
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col">
                <div className="space-y-2 group flex-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-[0.2em] flex items-center gap-2 group-focus-within:text-[#003087] transition-colors">
                      <ImageIcon size={14} /> Fotografía de Portada
                  </label>
                  <div className={`relative group h-full min-h-[350px] rounded-[2.5rem] border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center ${preview ? 'border-solid border-[#003087] shadow-2xl shadow-blue-900/10' : 'border-gray-200 bg-slate-50/50 hover:bg-white hover:border-[#003087] hover:shadow-xl'}`}>
                     {preview ? (
                       <div className="relative w-full h-full group">
                          <img src={preview} className="w-full h-full object-cover animate-in fade-in duration-700 group-hover:scale-105 transition-transform" alt="Preview" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#001D52]/80 via-[#001D52]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm">
                              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                                <ImageIcon size={32} />
                              </div>
                              <p className="font-black text-xs uppercase tracking-widest">Reemplazar Imagen</p>
                              <p className="text-[10px] opacity-60 mt-2 font-bold uppercase">Haga clic o arrastre un nuevo archivo</p>
                          </div>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center gap-4 text-gray-300 group-hover:text-[#003087] transition-colors">
                          <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-xl transition-all">
                              <Plus size={32} />
                          </div>
                          <div className="text-center">
                            <p className="font-black text-xs uppercase tracking-[0.2em] mb-1">Cargar Recurso</p>
                            <p className="font-bold text-[10px] opacity-60 uppercase">JPG, PNG o WEBP (Máx 5MB)</p>
                          </div>
                       </div>
                     )}
                     <input 
                      type="file" accept="image/*" required={!editMode}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      onChange={(e) => setImagen(e.target.files[0])}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={enviando}
                  className="mt-8 w-full bg-gradient-to-r from-[#003087] to-blue-900 text-white font-black py-6 rounded-[1.5rem] shadow-2xl shadow-blue-900/40 hover:shadow-blue-900/60 hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50 tracking-[0.2em] uppercase text-xs"
                >
                  {enviando ? <Loader2 className="animate-spin" /> : <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  <span>{editMode ? 'Sincronizar Cambios' : 'Lanzar Publicación'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* CONTENEDOR DE TABLA / LISTADO */}
      <div className="bg-white dark:bg-[#1a2332] rounded-[3rem] shadow-xl shadow-blue-900/5 dark:shadow-none border border-white dark:border-[#2a3441] relative z-10 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-8 bg-slate-50/30">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#003087]">
                    <Newspaper size={24} />
                </div>
                <div>
                    <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-1">Registros Activos</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sincronizado con BD</span>
                        <span className="ml-2 bg-[#003087] text-white text-[10px] font-black px-3 py-1 rounded-lg">{noticias.length}</span>
                    </div>
                </div>
            </div>
            <div className="relative w-full sm:w-96 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003087] transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar por título o palabra clave..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full bg-white dark:bg-[#1f2937] border border-gray-100 dark:border-[#2a3441] focus:border-[#003087] dark:focus:border-[#4b7bec] focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 pl-14 pr-8 py-4 rounded-2xl text-sm outline-none transition-all font-bold text-gray-700 dark:text-gray-200 shadow-sm dark:shadow-none"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2 px-6">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Recurso</th>
                <th className="px-6 py-4">Contenido Editorial</th>
                <th className="px-6 py-4 text-center">Publicación</th>
                <th className="px-6 py-4 text-right">Herramientas</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                [1,2,3].map(i => (
                    <tr key={i} className="animate-pulse">
                        <td className="p-6"><div className="w-24 h-16 bg-gray-100 rounded-2xl" /></td>
                        <td className="p-6"><div className="h-4 bg-gray-100 rounded w-64 mb-2" /><div className="h-3 bg-gray-50 rounded w-32" /></td>
                        <td className="p-6"><div className="h-4 bg-gray-100 rounded w-20 mx-auto" /></td>
                        <td className="p-6"><div className="h-10 bg-gray-100 rounded ml-auto w-24" /></td>
                    </tr>
                ))
              ) : noticiasFiltradas.map(n => (
                <tr key={n.id} className="group bg-white dark:bg-[#1a2332] hover:bg-blue-50/50 dark:hover:bg-[#243040]/50 transition-all rounded-[2rem]">
                  <td className="px-6 py-4 first:rounded-l-[2rem]">
                    <div className="relative w-24 h-16 rounded-2xl overflow-hidden shadow-sm">
                        <img 
                          src={`${UPLOADS_URL}/${n.imagen}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          alt="" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-800 dark:text-white block truncate max-w-sm group-hover:text-[#003087] dark:group-hover:text-[#60a5fa] transition-colors text-base">{n.titulo}</span>
                    <p className="text-[11px] text-gray-400 dark:text-gray-400 font-medium mt-1 line-clamp-1">{n.contenido}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex flex-col items-center bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 group-hover:border-blue-100 transition-colors">
                        <CalendarIcon size={12} className="text-gray-400 mb-1" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {new Date(n.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right last:rounded-r-[2rem]">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => prepararEdicion(n)}
                        className="p-3 bg-white border border-gray-100 text-[#003087] hover:bg-[#003087] hover:text-white rounded-xl shadow-sm transition-all"
                        title="Editar noticia"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleEliminar(n.id)}
                        className="p-3 bg-white border border-gray-100 text-red-500 hover:bg-red-500 hover:text-white rounded-xl shadow-sm transition-all"
                        title="Borrar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!cargando && noticiasFiltradas.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
              <div className="p-6 bg-slate-50 rounded-[2rem] text-gray-300">
                <Search size={48} />
              </div>
              <p className="text-gray-400 font-bold tracking-tight text-lg">No se encontraron noticias con ese criterio.</p>
              <button onClick={() => setBusqueda('')} className="text-[#003087] font-black text-[10px] uppercase tracking-widest hover:underline mt-2">Limpiar búsqueda</button>
            </div>
          )}
        </div>

        {/* Paginación Admin */}
        {!cargando && pagination.totalPages > 1 && (
            <div className="p-6 bg-slate-50/50 border-t border-gray-50 flex justify-center items-center gap-6">
                <button
                    onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#003087] disabled:opacity-30 transition-all shadow-sm"
                >
                    <ArrowRight size={20} className="rotate-180" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Página</span>
                    <span className="w-8 h-8 rounded-lg bg-[#003087] text-white flex items-center justify-center font-black text-xs">{pagination.page}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">de {pagination.totalPages}</span>
                </div>
                <button
                    onClick={() => setPagination(p => ({ ...p, page: Math.min(pagination.totalPages, p.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#003087] disabled:opacity-30 transition-all shadow-sm"
                >
                    <ArrowRight size={20} />
                </button>
            </div>
        )}
      </div>
    </div>
  )
}

export default AdminNoticias