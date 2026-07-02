import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API } from '../services/api';
import Swal from 'sweetalert2';
import { TextField, TextAreaField } from '../components/AdminUI';
import { Settings, Save, Layout, Trophy, BookOpen, Loader2, RefreshCw } from 'lucide-react';

const DEFAULT_CONFIG = {
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
};

function SectionCard({ title, subtitle, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 bg-blue-50 text-primary rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-800">{title}</h3>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

function AdminConfigInicio() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cargarConfig = useCallback(async () => {
    try {
      const res = await API.get('/configuracion');
      if (res.data && Object.keys(res.data).length > 0) {
        setConfig(prev => ({ ...prev, ...res.data }));
      }
    } catch { /* ignore error */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    cargarConfig();
  }, [cargarConfig]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/configuracion', config);
      Swal.fire({ title: '¡Guardado!', text: 'La configuración se ha actualizado.', icon: 'success', confirmButtonColor: '#003087' });
    } catch {
      Swal.fire('Error', 'No se pudo guardar la configuración.', 'error');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded mb-2">
            <Settings size={11} />
            Personalización UI
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Configuración de Inicio</h2>
          <p className="text-slate-500 text-sm mt-1">Modifica los textos principales del portal en tiempo real.</p>
        </div>
        <button
          onClick={cargarConfig}
          className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
          aria-label="Recargar"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <SectionCard title="Sección Hero Principal" subtitle="Títulos y subtítulos de impacto" icon={<Layout size={18} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              id="hero_titulo_1" name="hero_titulo_1" label="Título Línea 1"
              value={config.hero_titulo_1} onChange={handleChange}
            />
            <TextField
              id="hero_titulo_2" name="hero_titulo_2" label="Título Línea 2 (Itálica)"
              value={config.hero_titulo_2} onChange={handleChange}
            />
            <div className="md:col-span-2">
              <TextAreaField
                id="hero_subtitulo" name="hero_subtitulo" label="Subtítulo"
                value={config.hero_subtitulo} onChange={handleChange} rows={3}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Cifras de Impacto" subtitle="Contadores de éxito" icon={<Trophy size={18} />}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: 'stats_anios', label: 'Años' },
              { name: 'stats_alumnos', label: 'Alumnos' },
              { name: 'stats_docentes', label: 'Docentes' },
              { name: 'stats_logros', label: 'Logros %' }
            ].map(stat => (
              <TextField
                key={stat.name}
                id={stat.name} name={stat.name} label={stat.label}
                value={config[stat.name]} onChange={handleChange}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Pilares Académicos" subtitle="Ejes estratégicos" icon={<BookOpen size={18} />}>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <TextField
                  id={`pilar${i}_titulo`} name={`pilar${i}_titulo`} label={`Título Pilar ${i}`}
                  value={config[`pilar${i}_titulo`]} onChange={handleChange}
                />
                <div className="md:col-span-2">
                  <TextField
                    id={`pilar${i}_desc`} name={`pilar${i}_desc`} label="Descripción"
                    value={config[`pilar${i}_desc`]} onChange={handleChange}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider hover:bg-red-600 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminConfigInicio;
