import { useState, useEffect } from 'react';
import { getNubeTags } from '../services/api';
import { Link } from 'react-router-dom';
import { Tag, Hash } from 'lucide-react';
import { sanitizeText } from '../utils/sanitize';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getNubeTags()
      .then(res => setTags(res.data || []))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const maxTotal = Math.max(1, ...tags.map(t => t.total || 0));

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-primary text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold mb-4">
            <Tag size={14} />
            Temas del Colegio
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            Explora por categoría
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Encuentra noticias, eventos y comunicados organizados por tema.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">
        {cargando ? (
          <div className="text-center text-slate-400 py-10">Cargando...</div>
        ) : tags.length === 0 ? (
          <div className="text-center text-slate-400 py-10">
            Aun no hay temas publicados.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            {tags.map(t => {
              const scale = 0.85 + (t.total / maxTotal) * 0.6;
              return (
                <Link
                  key={t.id}
                  to={`/tags/${t.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md hover:border-primary hover:scale-105 transition-all"
                  style={{ fontSize: `${scale}rem` }}
                >
                  <Hash size={14} className="text-primary" />
                  <span className="font-semibold text-slate-800">{sanitizeText(t.nombre)}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                    {t.total}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
