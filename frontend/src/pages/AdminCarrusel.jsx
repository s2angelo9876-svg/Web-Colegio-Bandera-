import React, { useState, useEffect } from 'react';
import { API, UPLOADS_URL } from '../services/api';
import Swal from 'sweetalert2';
import { 
    Plus, Trash2, Image as ImageIcon, Save, 
    Type, AlignLeft, Layers, Monitor, PlayCircle 
} from 'lucide-react';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

const AdminCarrusel = () => {
    const [slides, setSlides] = useState([]);
    const [form, setForm] = useState({
        titulo: '',
        subtitulo: '',
        orden: 0,
        imagen: null
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            const res = await API.get('/carrusel');
            setSlides(res.data);
        } catch { /* ignore error */ }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('titulo', form.titulo);
        formData.append('subtitulo', form.subtitulo);
        formData.append('orden', form.orden);
        if (form.imagen) formData.append('imagen', form.imagen);

        try {
            await API.post('/carrusel', formData);
            Toast.fire({ title: 'Slide añadido', icon: 'success' });
            setForm({ titulo: '', subtitulo: '', orden: 0, imagen: null });
            fetchSlides();
        } catch {
            Swal.fire('Error', 'No se pudo añadir el slide', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await API.delete(`/carrusel/${id}`);
                Toast.fire({ title: 'Slide borrado', icon: 'success' });
                fetchSlides();
            } catch {
                Swal.fire('Error', 'Hubo un problema al eliminar', 'error');
            }
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
                                <Monitor size={20} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Gestión de Carrusel</h1>
                        </div>
                        <p className="text-slate-500 font-medium">Personaliza el carrusel de la página de inicio.</p>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Formulario */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
                            <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                <Plus size={20} className="text-red-600" />
                                Nuevo Slide
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título</label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-4 text-slate-400" size={18} />
                                        <input 
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all font-bold" 
                                            placeholder="Título del slide"
                                            value={form.titulo}
                                            onChange={e => setForm({...form, titulo: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtítulo</label>
                                    <div className="relative">
                                        <AlignLeft className="absolute left-4 top-4 text-slate-400" size={18} />
                                        <textarea 
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all font-medium h-32" 
                                            placeholder="Descripción breve..."
                                            value={form.subtitulo}
                                            onChange={e => setForm({...form, subtitulo: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Orden</label>
                                        <input 
                                            type="number"
                                            className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all font-bold" 
                                            value={form.orden}
                                            onChange={e => setForm({...form, orden: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imagen</label>
                                        <label className="flex items-center justify-center w-full py-4 bg-slate-100 hover:bg-red-50 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl cursor-pointer transition-all">
                                            <ImageIcon size={20} className="text-slate-400" />
                                            <input type="file" className="hidden" onChange={e => setForm({...form, imagen: e.target.files[0]})} />
                                        </label>
                                    </div>
                                </div>

                                <button 
                                    disabled={loading}
                                    className="w-full bg-red-600 hover:bg-slate-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                >
                                    {loading ? 'Subiendo...' : 'Publicar Slide'}
                                    <Save size={18} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Listado */}
                    <div className="lg:col-span-2">
                        <div className="grid gap-6">
                            {slides.map(slide => (
                                <div key={slide.id} className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-6 group hover:shadow-2xl transition-all">
                                    <div className="w-full md:w-60 h-40 rounded-3xl overflow-hidden bg-slate-100 flex-shrink-0">
                                        <img 
                                            src={`${UPLOADS_URL}/${slide.imagen_url}`} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt={slide.titulo}
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-2">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-red-100 text-red-600 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Posición: {slide.orden}</span>
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight">{slide.titulo}</h3>
                                            </div>
                                            <p className="text-slate-500 text-sm line-clamp-2">{slide.subtitulo}</p>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => handleDelete(slide.id)}
                                                className="p-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCarrusel;
