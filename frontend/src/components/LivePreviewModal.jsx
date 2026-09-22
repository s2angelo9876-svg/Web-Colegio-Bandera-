import { useState } from 'react';
import PropTypes from 'prop-types';
import { sanitizeHTML } from '../utils/sanitize';
import { X, Eye, Calendar, MapPin, Tag, Smartphone, Monitor } from 'lucide-react';

export default function LivePreviewModal({
  isOpen,
  onClose,
  tipo = 'noticia', // 'noticia' | 'evento' | 'comunicado'
  titulo = '',
  contenido = '',
  imagenUrl = null,
  fecha = null,
  lugar = '',
  tags = [],
  estado = 'publicado',
}) {
  const [vista, setVista] = useState('articulo'); // 'articulo' | 'tarjeta'
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'mobile'

  if (!isOpen) return null;

  const fechaTexto = fecha
    ? new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-dark-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-dark-border">
        {/* Header de la vista previa */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Vista Previa en Tiempo Real
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-800 text-slate-300">
              {estado}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle vista */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setVista('articulo')}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  vista === 'articulo' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Artículo completo
              </button>
              <button
                type="button"
                onClick={() => setVista('tarjeta')}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  vista === 'tarjeta' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tarjeta en lista
              </button>
            </div>

            {/* Toggle dispositivo */}
            <div className="hidden sm:flex bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                title="Vista de escritorio"
                className={`p-1.5 rounded-md transition ${
                  device === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor size={15} />
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                title="Vista móvil"
                className={`p-1.5 rounded-md transition ${
                  device === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone size={15} />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Cerrar vista previa"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Contenido de la vista previa */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-900/60 flex justify-center">
          <div className={`transition-all duration-300 w-full ${
            device === 'mobile' ? 'max-w-sm bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4' : 'max-w-3xl'
          }`}>
            {vista === 'tarjeta' ? (
              /* Simulación de tarjeta en la lista */
              <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden max-w-sm mx-auto">
                <div className="h-48 overflow-hidden relative bg-slate-200 dark:bg-slate-800">
                  {imagenUrl ? (
                    <img src={imagenUrl} alt={titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Sin imagen de portada
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {tipo}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2">
                    <Calendar size={12} />
                    <span>{fechaTexto}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-dark-text text-base line-clamp-2 mb-2">
                    {titulo || 'Título de ejemplo para la publicación'}
                  </h3>
                  <div
                    className="text-xs text-slate-500 dark:text-dark-text-muted line-clamp-3 mb-4 prose dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(contenido) || 'Contenido preliminar...' }}
                  />
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          #{typeof t === 'string' ? t : t.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-xs text-primary font-bold">
                    <span>Leer noticia completa →</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Simulación de artículo completo */
              <article className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tags.map((t, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                          <Tag size={10} />
                          {typeof t === 'string' ? t : t.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-dark-text leading-tight">
                    {titulo || 'Título de la publicación'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-dark-text-muted mt-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-primary" />
                      {fechaTexto}
                    </span>
                    {lugar && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-primary" />
                        {lugar}
                      </span>
                    )}
                  </div>
                </div>

                {imagenUrl && (
                  <div className="rounded-xl overflow-hidden max-h-96 bg-slate-100 dark:bg-slate-800">
                    <img src={imagenUrl} alt={titulo} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Renderizado de texto enriquecido con sanitización */}
                <div
                  className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 leading-relaxed text-sm sm:text-base border-t border-slate-100 dark:border-dark-border pt-6"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(contenido) || '<p class="text-slate-400 italic">No hay contenido escrito aún.</p>',
                  }}
                />
              </article>
            )}
          </div>
        </div>

        {/* Footer del modal */}
        <div className="px-5 py-3 bg-white dark:bg-dark-card border-t border-slate-200 dark:border-dark-border flex items-center justify-between text-xs text-slate-500">
          <span>Esta es una simulación de cómo lo verán los usuarios en la web.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-800 transition"
          >
            Volver a editar
          </button>
        </div>
      </div>
    </div>
  );
}

LivePreviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tipo: PropTypes.oneOf(['noticia', 'evento', 'comunicado']),
  titulo: PropTypes.string,
  contenido: PropTypes.string,
  imagenUrl: PropTypes.string,
  fecha: PropTypes.string,
  lugar: PropTypes.string,
  tags: PropTypes.array,
  estado: PropTypes.string,
};
