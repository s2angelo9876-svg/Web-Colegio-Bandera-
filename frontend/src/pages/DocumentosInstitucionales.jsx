import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, ShieldCheck, RefreshCw } from 'lucide-react';
import { API, UPLOADS_URL } from '../services/api';
import Footer from '../components/Footer';

const DocumentosInstitucionales = () => {
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDocumentos();
  }, []);

  const cargarDocumentos = async () => {
    setCargando(true);
    try {
      const res = await API.get('/transparencia');
      setDocumentos(res.data || []);
    } catch (err) {
      console.error('Error al cargar documentos:', err);
    } finally {
      setCargando(false);
    }
  };

  const docsFiltrados = documentos.filter(doc => 
    (doc.titulo?.toLowerCase().includes(filtro.toLowerCase()) || 
     doc.descripcion?.toLowerCase().includes(filtro.toLowerCase())) &&
    (categoria === 'Todos' || doc.categoria === categoria)
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* ── Page Header ── */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
           <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="animate-badge-pop mb-6">
            <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-[2rem] flex items-center justify-center animate-float backdrop-blur-sm">
                <ShieldCheck size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 animate-fade-in-up">
            Documentos Institucionales
          </h1>
          <div className="w-24 h-1.5 bg-red-500 mx-auto mb-8 rounded-full shadow-lg shadow-red-900/40" />
          <p className="text-xl md:text-2xl text-blue-100 font-light italic max-w-2xl px-4 animate-fade-in-up delay-100 leading-relaxed">
            Acceso a documentos oficiales de gestión, normativas internas y comunicados formales de nuestra institución.
          </p>
        </div>

        {/* Onda decorativa inferior */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
            </svg>
        </div>
      </section>

      {/* ── Content Body ── */}
      <div className="max-w-5xl mx-auto px-6 -mt-16 pb-32 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 p-8 md:p-12 border border-white/60 backdrop-blur-sm">
          
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar documento por título..." 
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-bold text-gray-700 shadow-inner"
              />
            </div>
            <select 
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-5 py-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-bold text-sm text-gray-700 shadow-inner"
            >
              <option value="Todos">Todas las categorías</option>
              <option value="Gestion">Documentos de Gestión</option>
              <option value="Normativa">Normativas e Internos</option>
              <option value="Comunicado">Comunicados Oficiales</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          {/* Document list */}
          <div className="grid grid-cols-1 gap-4">
            {cargando ? (
              <div className="text-center py-16">
                <RefreshCw className="animate-spin text-primary mx-auto mb-4" size={32} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando documentos oficiales...</p>
              </div>
            ) : docsFiltrados.length > 0 ? docsFiltrados.map((doc, idx) => (
              <div 
                key={doc.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-blue-100 rounded-2xl hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
                
                <div className="flex items-center gap-5 pl-4 mb-4 sm:mb-0">
                  <div className="p-3.5 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <FileText size={26} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 text-lg group-hover:text-primary transition-colors uppercase tracking-tight">
                      {doc.titulo}
                    </h3>
                    <p className="text-gray-400 text-sm mt-0.5 font-medium">{doc.descripcion || 'Sin descripción adicional.'}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-3 py-1 bg-white border border-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                        {doc.categoria}
                      </span>
                      <span className="text-[11px] text-gray-400 font-bold">
                        • Publicado: {new Date(doc.fecha).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <a 
                  href={doc.archivo_pdf?.startsWith('http') ? doc.archivo_pdf : `${UPLOADS_URL}/${doc.archivo_pdf}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-primary text-white px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-blue-900/10 active:scale-95 font-bold text-xs uppercase tracking-widest"
                >
                  <Download size={15} /> 
                  <span>Descargar</span>
                </a>
              </div>
            )) : (
              <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-1">Sin archivos</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto font-medium">No se encontraron documentos en esta categoría que coincidan con tu búsqueda.</p>
                <button 
                  onClick={() => { setFiltro(''); setCategoria('Todos'); }}
                  className="mt-6 text-primary font-black text-xs uppercase tracking-widest hover:text-red-600 transition-colors underline underline-offset-4"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DocumentosInstitucionales;
