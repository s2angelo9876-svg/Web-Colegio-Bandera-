import { useState, useEffect, useCallback } from 'react';
import { getTags, createTag, deleteTag } from '../services/api';
import { useToast } from '../context/ToastContext';
import { successMsg, errorMsg, confirmDelete } from '../utils/sweetalert';
import { Tag, Plus, Trash2, Search, Hash, Edit3, X } from 'lucide-react';

export default function AdminTags() {
  const toast = useToast();
  const [tags, setTags] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [creando, setCreando] = useState(false);

  const cargarTags = useCallback(async () => {
    setCargando(true);
    try {
      const res = await getTags({ search: busqueda || undefined });
      setTags(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cargar etiquetas');
    } finally {
      setCargando(false);
    }
  }, [busqueda, toast]);

  useEffect(() => { cargarTags(); }, [cargarTags]);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || creando) return;
    setCreando(true);
    try {
      await createTag({ nombre: nuevoNombre.trim() });
      successMsg('Etiqueta creada', `"${nuevoNombre.trim()}" se agrego correctamente.`);
      setNuevoNombre('');
      cargarTags();
    } catch (err) {
      errorMsg('No se pudo crear', err.response?.data?.error || 'Intenta de nuevo.');
    } finally {
      setCreando(false);
    }
  };

  const handleEliminar = (id, nombre) => {
    confirmDelete(`la etiqueta "${nombre}"`, async () => {
      try {
        await deleteTag(id);
        successMsg('Etiqueta eliminada', `"${nombre}" ya no esta disponible.`);
        cargarTags();
      } catch (err) {
        errorMsg('No se pudo eliminar', err.response?.data?.error || 'Puede que este siendo usada.');
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 bg-slate-50 dark:bg-dark-bg min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded mb-2">
            <Tag className="w-3 h-3" />
            Taxonomia
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-dark-text">
            Etiquetas y Categorias
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">
            Crea etiquetas para clasificar noticias, comunicados y eventos.
          </p>
        </div>
      </div>

      <form onSubmit={handleCrear} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl p-4 shadow-sm mb-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder="Ej: Talleres, Aniversario, Deportes, Academico..."
          className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          type="submit"
          disabled={!nuevoNombre.trim() || creando}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition active:scale-95 disabled:opacity-50"
        >
          <Plus size={15} />
          Crear etiqueta
        </button>
      </form>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-border flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {tags.length} etiqueta{tags.length === 1 ? '' : 's'}
          </span>
        </div>
        {cargando ? (
          <div className="p-10 text-center text-slate-400 text-sm">Cargando...</div>
        ) : tags.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            No hay etiquetas. Crea la primera con el formulario de arriba.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tags.map(t => (
              <div key={t.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                    <Hash size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{t.nombre}</p>
                    <p className="text-[10px] text-slate-400 font-mono">/{t.slug}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {t.total_noticias || 0} noticias · {t.total_comunicados || 0} comunicados · {t.total_eventos || 0} eventos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminar(t.id, t.nombre)}
                  className="flex-shrink-0 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
