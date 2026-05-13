import { useEffect, useState } from 'react'
import { API, getEventos } from '../services/api'
import Swal from 'sweetalert2'
import { Calendar, MapPin, Clock, Plus, X, Trash2, CalendarDays, Edit3, Info } from 'lucide-react'

function AdminEventos() {
    const [eventos, setEventos] = useState([])
    const [showForm, setShowForm] = useState(false)
    // El estado del formulario ahora coincide con las columnas de tu DB
    const [form, setForm] = useState({ titulo: '', descripcion: '', fecha_evento: '', hora_evento: '', lugar: '' })

    useEffect(() => { cargarEventos() }, [])

    const cargarEventos = async () => {
        const res = await getEventos()
        setEventos(res.data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await API.post('/eventos', form)
            Swal.fire({ title: '¡Excelente!', text: 'El evento ha sido agendado correctamente', icon: 'success', confirmButtonColor: '#003087' })
            setShowForm(false)
            setForm({ titulo: '', descripcion: '', fecha_evento: '', hora_evento: '', lugar: '' })
            cargarEventos()
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar el evento', 'error')
        }
    }

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar de la agenda?',
            text: "El evento desaparecerá del calendario público",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })
        if (result.isConfirmed) {
            await API.delete(`/eventos/${id}`)
            cargarEventos()
        }
    }

    return (
        <div className="p-8 lg:p-12 bg-[#F8FAFC] dark:bg-dark-bg min-h-screen relative overflow-hidden transition-colors duration-300">
            {/* Decorative background mesh */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-[#003087] dark:text-blue-300 font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 dark:bg-dark-accent/40 w-fit px-4 py-2 rounded-full border border-blue-100/50 dark:border-dark-accent/50">
                        <CalendarDays size={14} className="animate-pulse" />
                        Planificación Anual
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
                        Agenda <span className="text-[#003087] dark:text-blue-400">Escolar</span>
                    </h2>
                    <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">Organiza actividades, ceremonias y fechas cívicas.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 group ${
                        showForm 
                        ? 'bg-white dark:bg-dark-card text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover' 
                        : 'bg-[#003087] text-white shadow-blue-900/30 hover:bg-blue-900'
                    }`}
                >
                    {showForm ? <><X size={18}/> Cancelar</> : <><Plus size={18}/> Agendar Evento</>}
                </button>
            </div>

            {/* Formulario */}
            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-6 duration-500 mb-12 relative z-10">
                    <form onSubmit={handleSubmit} className="p-10 bg-white/80 dark:bg-dark-card backdrop-blur-xl rounded-[3.5rem] shadow-2xl shadow-blue-900/10 dark:shadow-none border border-white dark:border-dark-border grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 flex items-center justify-between border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-3 text-[#003087] font-black uppercase text-xs tracking-[0.2em]">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Calendar size={18}/>
                                </div>
                                Detalles del Nuevo Evento
                            </div>
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Nombre del Evento</label>
                            <input type="text" placeholder="Ej: Ceremonia de Graduación" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Ubicación / Lugar</label>
                            <input type="text" placeholder="Ej: Auditorio Principal" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-800 outline-none transition-all" value={form.lugar} onChange={e => setForm({...form, lugar: e.target.value})} required />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Fecha Programada</label>
                            <input type="date" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-black text-gray-700 outline-none transition-all cursor-pointer" value={form.fecha_evento} onChange={e => setForm({...form, fecha_evento: e.target.value})} required />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Hora de Inicio</label>
                            <input type="time" className="w-full p-5 rounded-2xl bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-black text-gray-700 outline-none transition-all cursor-pointer" value={form.hora_evento} onChange={e => setForm({...form, hora_evento: e.target.value})} required />
                        </div>
                        <div className="md:col-span-2 space-y-2 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest group-focus-within:text-[#003087] transition-colors">Descripción del Acto</label>
                            <textarea placeholder="Explica de qué trata el evento..." className="w-full p-6 rounded-[2rem] bg-slate-50/50 border border-transparent focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-600 outline-none transition-all h-32 resize-none leading-relaxed" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}></textarea>
                        </div>
                        <button className="md:col-span-2 bg-gradient-to-r from-[#003087] to-blue-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 transition-all active:scale-[0.98] text-xs">
                           Confirmar Registro en Agenda
                        </button>
                    </form>
                </div>
            )}

            {/* Listado tipo Timeline Premium */}
            <div className="space-y-6 relative z-10">
                {eventos.map(ev => (
                    <div key={ev.id} className="bg-white/70 dark:bg-dark-card/90 backdrop-blur-sm p-4 rounded-[3rem] border border-white dark:border-dark-border flex flex-col md:flex-row items-center gap-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group pr-10 relative overflow-hidden">
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-30 pointer-events-none group-hover:bg-blue-100 transition-colors" />
                        
                        {/* Fecha Badge Premium */}
                        <div className="w-full md:w-40 h-32 bg-[#001D52] rounded-[2.5rem] flex flex-col items-center justify-center text-white shrink-0 shadow-2xl shadow-blue-900/40 group-hover:scale-105 transition-transform duration-500 m-2 relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-red-600" />
                            <span className="text-5xl font-black tracking-tighter mb-1 animate-in fade-in zoom-in duration-700">
                                {ev.fecha_evento ? new Date(ev.fecha_evento).getDate() + 1 : '??'}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300/60">
                                {ev.fecha_evento ? new Date(ev.fecha_evento).toLocaleString('es-ES', { month: 'long' }) : 'Mes'}
                            </span>
                        </div>

                        {/* Detalles */}
                        <div className="flex-1 text-center md:text-left py-4 z-10">
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-[#003087] dark:group-hover:text-blue-400 transition-colors tracking-tight">{ev.titulo}</h3>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-2 text-[11px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-dark-border group-hover:border-blue-100 transition-colors">
                                    <Clock size={16} className="text-red-500" />
                                    {ev.hora_evento ? ev.hora_evento.slice(0, 5) : "--:--"} hrs
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-dark-border group-hover:border-blue-100 transition-colors">
                                    <MapPin size={16} className="text-[#003087] dark:text-blue-400" />
                                    {ev.lugar || "Sede Institucional"}
                                </div>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="hidden lg:block flex-[1.5] border-l border-gray-100 pl-8 z-10">
                            <div className="flex items-start gap-3">
                                <div className="w-1 h-12 bg-blue-100 rounded-full shrink-0 group-hover:bg-red-500 transition-colors" />
                                <p className="text-[15px] text-gray-500 line-clamp-2 font-bold italic leading-relaxed">"{ev.descripcion || 'Este evento no cuenta con una descripción detallada cargada en el sistema.'}"</p>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="absolute top-8 right-8 md:relative md:top-auto md:right-auto opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
                            <button 
                                onClick={() => handleEliminar(ev.id)} 
                                className="bg-white dark:bg-dark-input text-red-500 p-5 rounded-[1.5rem] hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-900/10 dark:shadow-none border border-red-50 dark:border-dark-border"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </div>
                ))}
                
                {eventos.length === 0 && (
                    <div className="text-center py-24 bg-white/50 dark:bg-dark-card/60 backdrop-blur-sm rounded-[4rem] border border-dashed border-gray-200 dark:border-dark-border shadow-sm mt-6 flex flex-col items-center">
                        <div className="w-24 h-24 bg-white dark:bg-dark-input rounded-full flex items-center justify-center text-gray-200 dark:text-slate-500 shadow-inner mb-6">
                            <Calendar size={48} />
                        </div>
                        <p className="text-gray-400 dark:text-slate-400 font-black text-xl tracking-tight">No hay eventos registrados.</p>
                        <button onClick={() => setShowForm(true)} className="text-[#003087] dark:text-blue-400 font-black text-xs uppercase tracking-widest mt-4 hover:underline">Registrar el primer evento</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminEventos;