import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Image, Zap, X, ZoomIn, RefreshCw, Images } from 'lucide-react';
import Footer from '../components/Footer';

function SkeletonFoto() {
  return <div className="skeleton aspect-square rounded-2xl" />;
}

const Galeria = () => {
  const [fotos,   setFotos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [lightbox, setLightbox] = useState(null); // foto seleccionada

  useEffect(() => {
    axios.get('http://localhost:3000/api/galeria')
      .then(res => setFotos(res.data))
      .catch(err => console.error('Error al cargar galería', err))
      .finally(() => setLoading(false));
  }, []);

  /* Cerrar lightbox con tecla Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const years = ['Todos', ...new Set(fotos.map(f => f.anio || new Date(f.fecha_publicacion).getFullYear().toString()))].sort((a, b) => b - a)
  const filteredFotos = selectedYear === 'Todos' 
    ? fotos 
    : fotos.filter(f => (f.anio || new Date(f.fecha_publicacion).getFullYear().toString()) === selectedYear)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ── */}
      <section className="page-header">
        <div className="relative z-10 pt-4">
          <span className="badge badge-red mb-5 inline-flex animate-badge-pop">
            <Zap size={10} />
            Momentos Especiales
          </span>
          <div className="flex items-center justify-center mb-5">
            <div className="w-14 h-14 bg-white/15 border border-white/25 rounded-2xl flex items-center justify-center animate-float backdrop-blur-sm">
              <Image size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 animate-fade-in-up">
            Galería Institucional
          </h1>
          <p className="text-blue-200 max-w-xl mx-auto font-light text-lg animate-fade-in-up delay-100 relative z-10 pb-10">
            Revive los mejores momentos de nuestra comunidad educativa.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Images size={22} className="text-[#003087]" />
              {loading ? 'Cargando...' : `${filteredFotos.length} fotografías`}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">Haz clic en una foto para ampliarla</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedYear === year
                  ? 'bg-[#003087] text-white shadow-lg shadow-blue-900/20'
                  : 'bg-white text-gray-400 hover:bg-blue-50 hover:text-[#003087] border border-gray-100'
                }`}
              >
                {year === 'Todos' ? 'Todos' : year}
              </button>
            ))}
          </div>
        </div>

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => <SkeletonFoto key={i} />)}
          </div>
        )}

        {/* Grid masonry */}
        {!loading && filteredFotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredFotos.map((foto, i) => (
              <div
                key={foto.id}
                onClick={() => setLightbox(foto)}
                className="group relative overflow-hidden rounded-2xl shadow-md aspect-square bg-gray-100 cursor-pointer hover:shadow-xl transition-all duration-400 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <img
                  src={foto.imagen_url?.startsWith('http') ? foto.imagen_url : `http://localhost:3000/uploads/${foto.imagen_url}`}
                  alt={foto.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#001D52]/85 via-[#003087]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <ZoomIn size={18} className="text-white" />
                  </div>
                  <p className="text-white font-bold text-xs uppercase tracking-wider text-center px-3">
                    {foto.titulo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vacío */}
        {!loading && fotos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
              <Image size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-400 mb-2">Sin fotografías</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              No hay fotos publicadas en la galería en este momento.
            </p>
          </div>
        )}
      </section>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 w-11 h-11 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl flex items-center justify-center text-white transition-all"
            onClick={() => setLightbox(null)}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
          <div
            className="max-w-4xl max-h-[85vh] w-full animate-fade-in-up"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={lightbox.imagen_url?.startsWith('http') ? lightbox.imagen_url : `http://localhost:3000/uploads/${lightbox.imagen_url}`}
              alt={lightbox.titulo}
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
              style={{ maxHeight: '75vh' }}
            />
            <p className="text-white text-center font-bold mt-4 text-sm uppercase tracking-wider">
              {lightbox.titulo}
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Galeria;