import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FileText, Search, Download, ShieldCheck } from 'lucide-react';
import { API, UPLOADS_URL } from '../services/api';
import Footer from '../components/Footer';

const DocumentosInstitucionales = () => {
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [cargando, setCargando] = useState(true);

  const cargarDocumentos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await API.get('/transparencia');
      setDocumentos(res.data || []);
    } catch { /* ignore error */ } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDocumentos(); }, [cargarDocumentos]);

  const docsFiltrados = useMemo(() => {
    const q = filtro.toLowerCase().trim();
    return documentos.filter(doc =>
      ((doc.titulo || '').toLowerCase().includes(q) ||
       (doc.descripcion || '').toLowerCase().includes(q)) &&
      (categoria === 'Todos' || doc.categoria === categoria)
    );
  }, [documentos, filtro, categoria]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-20">

      <section className="relative py-20 px-6 overflow-hidden bg-primary">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-semibold uppercase tracking-widest mb-6">
            <ShieldCheck size={14} />
            Transparencia
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Documentos Institucionales
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Acceso a documentos oficiales de gestión, normativas internas y comunicados formales de nuestra institución.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 -mt-10 pb-20 relative z-20">
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 md:p-8">

          <div className="flex flex-col md:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar documento..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Buscar documento"
              />
            </div>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              aria-label="Filtrar por categoría"
            >
              <option value="Todos">Todas las categorías</option>
              <option value="Gestion">Documentos de Gestión</option>
              <option value="Normativa">Normativas e Internos</option>
              <option value="Comunicado">Comunicados Oficiales</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div className="space-y-3">
            {cargando ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Cargando documentos...</p>
              </div>
            ) : docsFiltrados.length > 0 ? docsFiltrados.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-primary/20 rounded-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-3 sm:mb-0 flex-1">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm group-hover:text-primary transition-colors">
                      {doc.titulo}
                    </h3>
                    {doc.descripcion && (
                      <p className="text-slate-500 text-xs mt-0.5">{doc.descripcion}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {doc.categoria && (
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-500 rounded text-[10px] font-semibold uppercase tracking-wider">
                          {doc.categoria}
                        </span>
                      )}
                      {doc.fecha && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(doc.fecha).toLocaleDateString('es-PE')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <a
                  href={doc.archivo_pdf?.startsWith('http') ? doc.archivo_pdf : `${UPLOADS_URL}/${doc.archivo_pdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors text-xs font-semibold uppercase tracking-wider"
                >
                  <Download size={14} />
                  Descargar
                </a>
              </div>
            )) : (
              <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <FileText size={32} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">Sin archivos</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mb-4">
                  No se encontraron documentos con esos criterios.
                </p>
                <button
                  onClick={() => { setFiltro(''); setCategoria('Todos'); }}
                  className="text-primary font-semibold text-xs uppercase tracking-wider hover:text-red-600 transition-colors underline underline-offset-4"
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

DocumentosInstitucionales.propTypes = {};

export default DocumentosInstitucionales;
