import { useState, useEffect } from 'react';
import { API } from '../services/api';
import Swal from 'sweetalert2';
import { 
  Settings, 
  Save, 
  Layout, 
  Trophy, 
  BookOpen, 
  Zap,
  Star,
  Info,
  Loader2
} from 'lucide-react';

function AdminConfigInicio() {
    const [config, setConfig] = useState({
        hero_titulo_1: 'Bandera',
        hero_titulo_2: 'del Perú',
        hero_subtitulo: 'Forjando la excelencia con tradición y honor.',
        stats_anios: '65',
        stats_alumnos: '1200+',
        stats_docentes: '60+',
        stats_logros: '98%',
        pilar1_titulo: 'Liderazgo Académico',
        pilar1_desc: 'Metodologías de vanguardia que despiertan el potencial crítico y creativo.',
        pilar2_titulo: 'Valores Sólidos',
        pilar2_desc: 'Disciplina, honor y respeto son los cimientos de nuestra formación.',
        pilar3_titulo: 'Visión Global',
        pilar3_desc: 'Preparamos a nuestros alumnos para los retos de un mundo tecnológico.',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        cargarConfig();
    }, []);

    const cargarConfig = async () => {
        try {
            const res = await API.get('/configuracion');
            if (Object.keys(res.data).length > 0) {
                setConfig(prev => ({ ...prev, ...res.data }));
            }
        } catch (error) {
            console.error("Error al cargar config:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await API.post('/configuracion', config);
            Swal.fire({
                title: '¡Guardado!',
                text: 'La configuración de la página de inicio se ha actualizado.',
                icon: 'success',
                confirmButtonColor: '#003087'
            });
        } catch (error) {
            console.error("Error guardando config:", error);
            Swal.fire('Error', 'No se pudo guardar la configuración.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-[#003087]" size={48} />
        </div>
    );

    return (
        <div className="p-8 lg:p-12 bg-[#F8FAFC] min-h-screen">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-[#003087] font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-blue-50 w-fit px-4 py-2 rounded-full border border-blue-100/50">
                        <Settings size={14} />
                        Personalización UI
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-4">
                        Gestión de <span className="text-[#003087]">Contenido Inicio</span>
                    </h2>
                    <p className="text-gray-400 font-bold text-lg text-pretty">Modifica los textos principales de la página de aterrizaje en tiempo real.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* SECCIÓN HERO */}
                    <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-blue-900/5 border border-white">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                                <Layout size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-slate-800 tracking-tight">Sección Hero Principal</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Títulos y Subtítulos de impacto</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Título Línea 1</label>
                                <input 
                                    name="hero_titulo_1"
                                    value={config.hero_titulo_1}
                                    onChange={handleChange}
                                    className="w-full p-6 bg-slate-50 border-transparent rounded-3xl font-black text-slate-700 focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Título Línea 2 (Itálica)</label>
                                <input 
                                    name="hero_titulo_2"
                                    value={config.hero_titulo_2}
                                    onChange={handleChange}
                                    className="w-full p-6 bg-slate-50 border-transparent rounded-3xl font-black text-red-600 italic focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-50 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Subtítulo Descriptivo</label>
                                <textarea 
                                    name="hero_subtitulo"
                                    value={config.hero_subtitulo}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full p-6 bg-slate-50 border-transparent rounded-3xl font-bold text-slate-600 focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-50 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN ESTADÍSTICAS */}
                    <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-blue-900/5 border border-white">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-slate-800 tracking-tight">Cifras e Impacto</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Contadores de éxito institucional</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { name: 'stats_anios', label: 'Años' },
                                { name: 'stats_alumnos', label: 'Alumnos' },
                                { name: 'stats_docentes', label: 'Docentes' },
                                { name: 'stats_logros', label: 'Logros %' }
                            ].map(stat => (
                                <div key={stat.name} className="space-y-3 text-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</label>
                                    <input 
                                        name={stat.name}
                                        value={config[stat.name]}
                                        onChange={handleChange}
                                        className="w-full p-6 bg-slate-50 border-transparent rounded-3xl font-black text-center text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECCIÓN PILARES */}
                    <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-blue-900/5 border border-white">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-slate-800 tracking-tight">Pilares Académicos</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ejes estratégicos del colegio</p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Título Pilar {i}</label>
                                        <input 
                                            name={`pilar${i}_titulo`}
                                            value={config[`pilar${i}_titulo`]}
                                            onChange={handleChange}
                                            className="w-full p-5 bg-white border-transparent rounded-2xl font-black text-slate-700 focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Descripción Corta</label>
                                        <input 
                                            name={`pilar${i}_desc`}
                                            value={config[`pilar${i}_desc`]}
                                            onChange={handleChange}
                                            className="w-full p-5 bg-white border-transparent rounded-2xl font-bold text-slate-500 focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BOTÓN GUARDAR FLOTANTE / FINAL */}
                    <div className="flex justify-end sticky bottom-8 z-50">
                        <button 
                            disabled={saving}
                            className="flex items-center gap-4 px-12 py-7 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-red-900/40 hover:bg-red-700 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            {saving ? 'Guardando Cambios...' : 'Guardar Configuración'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminConfigInicio;
