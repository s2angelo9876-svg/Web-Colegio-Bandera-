import { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API, UPLOADS_URL } from '../services/api';
import {
  Image, X, RefreshCw, Images, Search, Play,
  ChevronLeft, ChevronRight, Video, Calendar, Eye
} from 'lucide-react';
import Footer from '../components/Footer';

function SkeletonFoto() {
  return <div className="aspect-square rounded-lg bg-slate-200 animate-pulse" />;
}

SkeletonFoto.propTypes = {};

const Galeria = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const cargar = useCallback(() => {
    setLoading(true);
    API.get('/galeria')
      .then(res => setItems(res.data || []))
      .catch(() => { /* ignore error */ })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      const matchesSearch = !q ||
        (item.titulo || '').toLowerCase().includes(q) ||
        ((item.descripcion || '').toLowerCase().includes(q));
      const matchesType = selectedType === 'Todos' || item.tipo === selectedType;
      return matchesSearch && matchesType;
    });
  }, [items, search, selectedType]);

  const handlePrev = useCallback(() => {
    if (filteredItems.length === 0) return;
    setLightboxIndex(prev => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  }, [filteredItems.length]);

  const handleNext = useCallback(() => {
    if (filteredItems.length === 0) return;
    setLightboxIndex(prev => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  }, [filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : url;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-20">

      <section className="relative py-20 px-6 overflow-hidden bg-primary">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-semibold uppercase tracking-widest mb-6">
            <Images size={14} />
            Multimedia
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Galería Escolar
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Explora las fotografías y videos oficiales de eventos, aniversarios y logros de nuestra comunidad estudiantil.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-10 pb-20 relative z-20">

        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en la galería..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Buscar en galería"
              />
            </div>

            <div className="flex bg-slate-50 p-1 rounded-lg w-full md:w-auto">
              {[
                { v: 'Todos', l: 'Todos' },
                { v: 'foto', l: 'Fotos' },
                { v: 'video', l: 'Videos' }
              ].map((tp) => (
                <button
                  key={tp.v}
                  onClick={() => setSelectedType(tp.v)}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedType === tp.v
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tp.l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={cargar}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/20 rounded-lg transition-all disabled:opacity-50"
            aria-label="Actualizar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonFoto key={i} />)}
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((foto, i) => (
              <div
                key={foto.id || i}
                onClick={() => setLightboxIndex(i)}
                className="group relative overflow-hidden rounded-lg shadow-sm aspect-square bg-slate-100 cursor-pointer hover:shadow-md transition-all duration-300"
              >
                <img
                  src={foto.imagen_url?.startsWith('http') ? foto.imagen_url : `${UPLOADS_URL}/${foto.imagen_url}`}
                  alt={foto.titulo || 'Galería'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f1f5f9/64748b?text=Imagen'; }}
                />
                <div className="absolute top-2 right-2 z-10">
                  <span className="w-7 h-7 rounded-md bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
                    {foto.tipo === 'video' ? <Video size={12} /> : <Image size={12} />}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-3">
                  <Eye size={16} className="text-white mb-1" />
                  <h4 className="text-white font-semibold text-xs line-clamp-1 text-center w-full">
                    {foto.titulo}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Images size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sin resultados</h3>
            <p className="text-slate-500 text-sm max-w-xs mb-6">
              No hemos encontrado fotos o videos con esos criterios.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedType('Todos'); }}
              className="text-primary font-semibold text-xs uppercase tracking-wider hover:text-red-600 transition-colors underline underline-offset-4"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </section>

      {lightboxIndex !== null && activeItem && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-between p-6 select-none"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="flex items-center justify-between text-white relative z-50 py-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-400 tracking-widest">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
              <h3 className="text-lg font-bold mt-0.5">{activeItem.titulo}</h3>
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="w-11 h-11 bg-white/10 hover:bg-red-600 rounded-full flex items-center justify-center transition-all"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-between gap-4 relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={handlePrev}
              className="w-12 h-12 bg-white/10 hover:bg-primary rounded-full flex items-center justify-center text-white transition-all flex-shrink-0"
              aria-label="Anterior"
            >
              <ChevronLeft size={26} />
            </button>

            <div className="flex-1 flex items-center justify-center max-h-[70vh]">
              {activeItem.tipo === 'video' ? (
                <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-black">
                  {activeItem.video_url?.includes('youtube') || activeItem.video_url?.includes('youtu.be') ? (
                    <iframe
                      className="w-full h-full"
                      src={getEmbedUrl(activeItem.video_url)}
                      title={activeItem.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      autoPlay
                      src={activeItem.video_url?.startsWith('http') ? activeItem.video_url : `${UPLOADS_URL}/${activeItem.video_url}`}
                      className="w-full h-full"
                    />
                  )}
                </div>
              ) : (
                <img
                  src={activeItem.imagen_url?.startsWith('http') ? activeItem.imagen_url : `${UPLOADS_URL}/${activeItem.imagen_url}`}
                  alt={activeItem.titulo}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                />
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-12 h-12 bg-white/10 hover:bg-primary rounded-full flex items-center justify-center text-white transition-all flex-shrink-0"
              aria-label="Siguiente"
            >
              <ChevronRight size={26} />
            </button>
          </div>

          <div className="text-center text-slate-400 py-4">
            {activeItem.descripcion && (
              <p className="text-sm text-blue-100 max-w-2xl mx-auto italic mb-2">
                "{activeItem.descripcion}"
              </p>
            )}
            <p className="text-[10px] font-semibold uppercase tracking-wider">
              ← / → para navegar · ESC para cerrar
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

Galeria.propTypes = {};

export default Galeria;
