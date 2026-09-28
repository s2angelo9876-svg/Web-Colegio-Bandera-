import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../services/api';
import { Tag, ArrowLeft, Calendar, FileText, Megaphone } from 'lucide-react';
import { sanitizeText } from '../utils/sanitize';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function TagPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    API.get(`/tags/${slug}/contenido`)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setCargando(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-32 text-slate-400">Cargando...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <Tag size={48} className="mx-auto text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-700">Etiqueta no encontrada</h1>
          <p className="text-slate-500 mt-2">No hay contenido asociado a este tema.</p>
          <Link to="/tags" className="inline-flex items-center gap-1 mt-6 text-primary hover:underline">
            <ArrowLeft size={16} />
            Ver todos los temas
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { tag, contenido } = data;
  const totalItems = (contenido.noticias?.length || 0) + (contenido.comunicados?.length || 0) + (contenido.eventos?.length || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-primary text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <Link to="/tags" className="inline-flex items-center gap-1 text-blue-200 hover:text-white text-sm mb-4">
            <ArrowLeft size={14} /> Todos los temas
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-2">
            <Tag size={28} />
            #{tag.nombre}
          </h1>
          <p className="text-blue-100 mt-2">{totalItems} resultado{totalItems === 1 ? '' : 's'}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {contenido.noticias?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Noticias
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contenido.noticias.map(n => (
                <Link
                  key={n.id}
                  to="/noticias"
                  className="block bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md hover:border-primary transition"
                >
                  <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{sanitizeText(n.titulo)}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{sanitizeText(n.contenido)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {contenido.comunicados?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Megaphone size={20} className="text-amber-500" />
              Comunicados
            </h2>
            <div className="space-y-3">
              {contenido.comunicados.map(c => (
                <Link
                  key={c.id}
                  to="/comunicados"
                  className="block bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md hover:border-primary transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{c.tipo}</span>
                    <span className="text-xs text-slate-400">{new Date(c.fecha).toLocaleDateString('es-PE')}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{sanitizeText(c.titulo)}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {contenido.eventos?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-emerald-500" />
              Eventos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contenido.eventos.map(e => (
                <div key={e.id} className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-1">{sanitizeText(e.titulo)}</h3>
                  <p className="text-xs text-slate-500">
                    {new Date(e.fecha_evento).toLocaleDateString('es-PE')} {e.hora_evento && `· ${e.hora_evento}`} {e.lugar && `· ${e.lugar}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalItems === 0 && (
          <div className="text-center text-slate-400 py-10">
            Aun no hay contenido publicado con este tema.
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
