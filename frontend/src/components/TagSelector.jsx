import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { API } from '../services/api';
import { Tag, Plus, Check, Loader2 } from 'lucide-react';

export default function TagSelector({ selectedTagIds = [], onChange }) {
  const [tags, setTags] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    let montado = true;
    const cargarTags = async () => {
      setCargando(true);
      try {
        const res = await API.get('/tags');
        if (montado) setTags(res.data || []);
      } catch (err) {
        console.error('Error al cargar tags:', err);
      } finally {
        if (montado) setCargando(false);
      }
    };
    cargarTags();
    return () => { montado = false; };
  }, []);

  const toggleTag = (id) => {
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter((tId) => tId !== id));
    } else {
      onChange([...selectedTagIds, id]);
    }
  };

  const handleCrearTag = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || creando) return;
    setCreando(true);
    try {
      const res = await API.post('/tags', { nombre: nuevoNombre.trim() });
      if (res.data) {
        const tagCreado = res.data;
        setTags((prev) => [...prev.filter((t) => t.id !== tagCreado.id), tagCreado]);
        onChange([...selectedTagIds, tagCreado.id]);
        setNuevoNombre('');
        setMostrarCrear(false);
      }
    } catch (err) {
      console.error('Error al crear tag:', err);
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider flex items-center gap-1.5">
          <Tag size={13} className="text-primary" />
          Etiquetas / Categorías
        </label>
        <button
          type="button"
          onClick={() => setMostrarCrear(!mostrarCrear)}
          className="text-xs text-primary hover:text-red-700 font-semibold flex items-center gap-1"
        >
          <Plus size={13} />
          {mostrarCrear ? 'Cerrar' : 'Nueva etiqueta'}
        </button>
      </div>

      {mostrarCrear && (
        <form onSubmit={handleCrearTag} className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg">
          <input
            type="text"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Ej: Talleres, Aniversario..."
            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-md text-slate-800 dark:text-dark-text focus:outline-none focus:border-primary"
            autoFocus
          />
          <button
            type="submit"
            disabled={!nuevoNombre.trim() || creando}
            className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
          >
            {creando ? <Loader2 size={13} className="animate-spin" /> : 'Agregar'}
          </button>
        </form>
      )}

      {cargando ? (
        <div className="text-xs text-slate-400 py-2">Cargando etiquetas...</div>
      ) : (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((t) => {
            const seleccionado = selectedTagIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  seleccionado
                    ? 'bg-primary text-white shadow-sm ring-1 ring-primary'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {seleccionado && <Check size={11} className="stroke-[3]" />}
                {t.nombre}
              </button>
            );
          })}
          {tags.length === 0 && (
            <p className="text-xs text-slate-400 italic">No hay etiquetas creadas aún.</p>
          )}
        </div>
      )}
    </div>
  );
}

TagSelector.propTypes = {
  selectedTagIds: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func.isRequired,
};
