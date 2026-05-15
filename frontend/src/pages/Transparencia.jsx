import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, ShieldCheck } from 'lucide-react';

const Transparencia = () => {
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [categoria, setCategoria] = useState('Todos');

  useEffect(() => {
    const dataPrueba = [
      { id: 1, titulo: 'Plan Anual de Trabajo 2026', categoria: 'Transparencia', fecha: '2026-02-15', url: '#' },
      { id: 2, titulo: 'Reglamento Interno de Convivencia', categoria: 'Norma', fecha: '2026-01-10', url: '#' },
      { id: 3, titulo: 'Comunicado N° 005: Inicio de Clases', categoria: 'Comunicado', fecha: '2026-03-01', url: '#' },
    ];
    setDocumentos(dataPrueba);
  }, []);

  const docsFiltrados = documentos.filter(doc => 
    doc.titulo.toLowerCase().includes(filtro.toLowerCase()) &&
    (categoria === 'Todos' || doc.categoria === categoria)
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="page-header flex flex-col items-center justify-center text-center">
        <ShieldCheck size={48} className="text-white/80 mb-4 animate-pulse-soft" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md uppercase">
          Portal de Transparencia
        </h1>
        <p className="text-blue-100 text-lg md:text-xl font-light max-w-2xl px-4">
          Acceso a la información pública y documentos oficiales
        </p>
        <div className="w-24 h-1.5 bg-red-500 mx-auto mt-8 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 mb-8 border border-gray-100 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Buscar documento por título..." 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            <select 
              className="bg-gray-50 border-transparent rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium text-gray-700"
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="Todos">Todas las categorías</option>
              <option value="Transparencia">Transparencia</option>
              <option value="Norma">Normas Internas</option>
              <option value="Comunicado">Comunicados</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {docsFiltrados.length > 0 ? docsFiltrados.map(doc => (
              <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
                <div className="flex items-center gap-5 pl-4 mb-4 sm:mb-0">
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-primary transition-colors">{doc.titulo}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold tracking-wide uppercase">
                        {doc.categoria}
                      </span>
                      <span className="text-sm text-gray-400">• Publicado el {doc.fecha}</span>
                    </div>
                  </div>
                </div>
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors shadow-sm hover:shadow-md font-medium"
                >
                  <Download size={18} /> <span>Descargar</span>
                </a>
              </div>
            )) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No se encontraron documentos que coincidan con tu búsqueda.</p>
                <button 
                  onClick={() => { setFiltro(''); setCategoria('Todos'); }}
                  className="mt-4 text-primary font-bold hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transparencia;