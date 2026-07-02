import React, { useEffect, useState } from 'react';
import { API, UPLOADS_URL } from '../services/api';
import { 
  Image, Zap, X, ZoomIn, RefreshCw, Images, Search, Play, 
  ChevronLeft, ChevronRight, Video, Calendar, Eye 
} from 'lucide-react';
import Footer from '../components/Footer';

function SkeletonFoto() {
  return <div className="skeleton aspect-square rounded-2xl animate-pulse bg-slate-200" />;
}

const Galeria = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('Todos'); // 'Todos' | 'foto' | 'video'
  const [selectedYear, setSelectedYear] = useState('Todos');
  
  // Lightbox index tracking
  const [lightboxIndex, setLightboxIndex] = useState(null); // index of current item in filtered items

  useEffect(() => {
    API.get('/galeria')
      .then(res => setItems(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Navigation handlers
  const handlePrev = () => {
    if (filteredItems.length === 0) return;
    setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (filteredItems.length === 0) return;
    setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, items, search, selectedType, selectedYear]);

  // Dynamic values
  const years = ['Todos', ...new Set(items.map(f => {
    const yr = f.anio || new Date(f.fecha_publicacion || f.created_at).getFullYear().toString();
    return yr;
  }))].sort((a, b) => b - a);

  // Filters application
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.titulo.toLowerCase().includes(search.toLowerCase()) || 
                          (item.descripcion && item.descripcion.toLowerCase().includes(search.toLowerCase()));
    
    const matchesType = selectedType === 'Todos' || item.tipo === selectedType;
    
    const itemYear = item.anio || new Date(item.fecha_publicacion || item.created_at).getFullYear().toString();
    const matchesYear = selectedYear === 'Todos' || itemYear === selectedYear;

    return matchesSearch && matchesType && matchesYear;
  });

  // Mes Actual Publications
  const currentMonthItems = items.filter(item => {
    const date = new Date(item.fecha_publicacion || item.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).slice(0, 3); // top 3 for this month

  // YouTube URL Embed Parser
  const getEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      videoId = url; // fallback if only ID is provided
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg font-sans transition-colors duration-300">
      
      {/* ── Page Header ── */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-red-600 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center animate-fade-in-up">
          <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-[2rem] flex items-center justify-center mb-6 animate-float backdrop-blur-sm shadow-xl">
            <Images size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Galería Escolar
          </h1>
          <div className="w-24 h-1.5 bg-red-500 mx-auto mb-8 rounded-full shadow-lg" />
          <p className="text-xl md:text-2xl text-blue-100 font-light italic max-w-2xl px-4 leading-relaxed">
            Explora las fotografías y videos oficiales de eventos, aniversarios y logros de nuestra comunidad estudiantil.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50 dark:fill-dark-bg"></path>
            </svg>
        </div>
      </section>

      {/* ── MES ACTUAL HIGHLIGHT SHOWCASE ── */}
      {currentMonthItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-16 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-900/10 via-red-900/5 to-slate-900/10 p-8 rounded-[3rem] border border-blue-100/50 dark:border-dark-border backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-primary dark:text-blue-500 opacity-5">
              <Calendar size={120} />
            </div>
            
            <div className="flex items-center gap-3 text-primary dark:text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
              <Zap size={14} className="animate-bounce" />
              Publicaciones de este Mes
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentMonthItems.map((itm) => (
                <div 
                  key={itm.id} 
                  onClick={() => {
                    const idx = filteredItems.findIndex(fi => fi.id === itm.id);
                    if (idx !== -1) setLightboxIndex(idx);
                  }}
                  className="group bg-white dark:bg-dark-card border border-white/60 dark:border-dark-border p-4 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex gap-4 items-center"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 relative flex-shrink-0">
                    {itm.tipo === 'video' ? (
                      <>
                        <img 
                          src={itm.imagen_url?.startsWith('http') ? itm.imagen_url : `${UPLOADS_URL}/${itm.imagen_url}`} 
                          className="w-full h-full object-cover" 
                          alt={itm.titulo} 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play size={18} className="text-white fill-white" />
                        </div>
                      </>
                    ) : (
                      <img 
                        src={itm.imagen_url?.startsWith('http') ? itm.imagen_url : `${UPLOADS_URL}/${itm.imagen_url}`} 
                        className="w-full h-full object-cover" 
                        alt={itm.titulo} 
                      />
                    )}
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-red-500 tracking-wider">RECIENTE</span>
                    <h4 className="font-black text-sm text-gray-800 dark:text-white line-clamp-1 group-hover:text-primary transition-colors mt-0.5">{itm.titulo}</h4>
                    <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(itm.fecha_publicacion || itm.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FILTROS Y CONTROLES ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Barra de Herramientas Premium */}
        <div className="bg-white dark:bg-dark-card rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-blue-900/5 border border-white dark:border-dark-border flex flex-col xl:flex-row items-center justify-between gap-6 mb-12 relative z-10">
          
          <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
            {/* Buscador */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Buscar en la galería..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-dark-input border-none focus:ring-2 focus:ring-primary rounded-xl text-sm font-bold text-gray-700 dark:text-white outline-none transition-all shadow-inner"
              />
            </div>

            {/* Selector de Tipo (Foto/Video) */}
            <div className="flex bg-slate-100 dark:bg-dark-input p-1 rounded-xl w-full md:w-auto">
              {['Todos', 'foto', 'video'].map((tp) => (
                <button
                  key={tp}
                  onClick={() => setSelectedType(tp)}
                  className={`flex-1 md:flex-initial px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    selectedType === tp
                    ? 'bg-white dark:bg-dark-card text-primary dark:text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tp === 'Todos' ? 'Cualquier Medio' : tp === 'foto' ? 'Fotos' : 'Videos'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto justify-end">
            {/* Filtro por Año */}
            <div className="flex flex-wrap gap-2">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedYear === year
                    ? 'bg-primary text-white shadow-lg shadow-blue-900/10'
                    : 'bg-slate-50 dark:bg-dark-input text-gray-400 hover:bg-slate-100 hover:text-gray-800 dark:hover:bg-dark-hover'
                  }`}
                >
                  {year === 'Todos' ? 'Todos los Años' : year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => <SkeletonFoto key={i} />)}
          </div>
        )}

        {/* MEDIA GRID */}
        {!loading && filteredItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((foto, i) => (
              <div
                key={foto.id}
                onClick={() => setLightboxIndex(i)}
                className="group relative overflow-hidden rounded-3xl shadow-lg aspect-square bg-slate-100 dark:bg-dark-input cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <img
                  src={foto.imagen_url?.startsWith('http') ? foto.imagen_url : `${UPLOADS_URL}/${foto.imagen_url}`}
                  alt={foto.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                
                {/* Media Indicator Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="w-8 h-8 rounded-xl bg-black/45 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg">
                    {foto.tipo === 'video' ? <Video size={14} /> : <Image size={14} />}
                  </span>
                </div>

                {/* Overlapping Hover Info Card */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end p-6 gap-2">
                  <div className="w-10 h-10 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-xl scale-90 group-hover:scale-100 transition-transform">
                    <Eye size={18} className="text-white" />
                  </div>
                  <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest mt-1">
                    {foto.anio || new Date(foto.fecha_publicacion || foto.created_at).getFullYear()}
                  </span>
                  <h4 className="text-white font-black text-xs uppercase tracking-wider text-center line-clamp-1 w-full">
                    {foto.titulo}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-dark-card rounded-[3.5rem] border border-dashed border-gray-200 dark:border-dark-border shadow-sm">
            <div className="w-24 h-24 bg-slate-50 dark:bg-dark-input rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <Images size={40} className="text-slate-300 dark:text-slate-650" />
            </div>
            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight mb-2">Sin Recursos Encontrados</h3>
            <p className="text-gray-400 dark:text-slate-550 text-sm max-w-xs">
              No hemos hallado fotos o videos que correspondan con los criterios o filtros establecidos.
            </p>
            <button 
              onClick={() => { setSearch(''); setSelectedType('Todos'); setSelectedYear('Todos'); }} 
              className="text-primary dark:text-blue-400 font-black text-xs uppercase tracking-widest mt-6 hover:underline"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </section>

      {/* ── ADVANCED LIGHTBOX CAROUSEL MODAL ── */}
      {lightboxIndex !== null && activeItem && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-between p-6 animate-fade-in select-none"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Panel */}
          <div className="flex items-center justify-between text-white relative z-50 py-2">
            <div>
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">
                Galería Escolar · {lightboxIndex + 1} de {filteredItems.length}
              </span>
              <h3 className="text-lg font-black tracking-tight mt-0.5 uppercase">
                {activeItem.titulo}
              </h3>
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="w-12 h-12 bg-white/10 hover:bg-red-600 hover:border-red-600 border border-white/10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xl"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Central Body (Carousel Panel) */}
          <div className="flex-1 flex items-center justify-between gap-6 relative" onClick={e => e.stopPropagation()}>
            
            {/* Left Prev Button */}
            <button 
              onClick={handlePrev}
              className="w-14 h-14 bg-white/10 hover:bg-primary border border-white/10 rounded-full flex items-center justify-center text-white transition-all active:scale-90 shadow-2xl z-50 flex-shrink-0"
              title="Anterior"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Multimedia Display Frame */}
            <div className="flex-1 flex items-center justify-center max-h-[70vh] relative z-45">
              {activeItem.tipo === 'video' ? (
                <div className="w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                  {activeItem.video_url?.includes('youtube') || activeItem.video_url?.includes('youtu.be') ? (
                    <iframe 
                      className="w-full h-full"
                      src={getEmbedUrl(activeItem.video_url)} 
                      title={activeItem.titulo}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
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
                  className="max-w-full max-h-[70vh] object-contain rounded-3xl shadow-2xl"
                />
              )}
            </div>

            {/* Right Next Button */}
            <button 
              onClick={handleNext}
              className="w-14 h-14 bg-white/10 hover:bg-primary border border-white/10 rounded-full flex items-center justify-center text-white transition-all active:scale-90 shadow-2xl z-50 flex-shrink-0"
              title="Siguiente"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Bottom Panel */}
          <div className="text-center text-gray-400 py-4 relative z-50">
            {activeItem.descripcion && (
              <p className="text-sm font-medium text-blue-100 max-w-2xl mx-auto italic mb-2">
                "{activeItem.descripcion}"
              </p>
            )}
            <p className="text-[9px] font-black uppercase tracking-[0.25em]">
              Usa las flechas del teclado (← / →) o presiona ESC para cerrar
            </p>
          </div>

        </div>
      )}

      <Footer />
    </div>
  );
};

export default Galeria;