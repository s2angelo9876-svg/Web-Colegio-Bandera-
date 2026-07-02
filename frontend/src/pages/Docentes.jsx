import { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { API, UPLOADS_URL } from '../services/api';
import {
  GraduationCap, BookOpen, Award, Users,
  UserX, RefreshCw, Search
} from 'lucide-react';
import Footer from '../components/Footer';

function SkeletonDocente() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
      <div className="bg-slate-100 aspect-[3/4]" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-100 w-3/4 rounded mx-auto" />
        <div className="h-3 bg-slate-50 w-1/2 rounded-full mx-auto" />
      </div>
    </div>
  );
}

SkeletonDocente.propTypes = {};

function DocenteCard({ doc, index }) {
  const isDirector = doc.cargo?.toLowerCase().includes('director');
  const isCoordinador = doc.cargo?.toLowerCase().includes('coordinad');

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="aspect-[3/4] overflow-hidden bg-slate-100 relative">
        <img
          src={doc.imagen_url?.startsWith('http') ? doc.imagen_url : (doc.imagen_url ? `${UPLOADS_URL}/${doc.imagen_url}` : '')}
          alt={doc.nombre || 'Docente'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x500/f1f5f9/64748b?text=Docente';
          }}
        />
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-wider text-white ${
          isDirector ? 'bg-red-600' : isCoordinador ? 'bg-blue-700' : 'bg-primary'
        }`}>
          <Award size={9} />
          {doc.cargo?.split(' ')[0] || 'Docente'}
        </span>
      </div>

      <div className="p-4 text-center">
        <h3 className="text-primary font-bold text-sm leading-tight mb-1 group-hover:text-red-600 transition-colors">
          {doc.nombre}
        </h3>
        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
          {doc.cargo}
        </p>
        {doc.especialidad && (
          <div className="bg-slate-50 rounded-lg py-1.5 px-2 inline-flex items-center gap-1.5 border border-slate-100">
            <BookOpen size={10} className="text-primary" />
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {doc.especialidad}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

DocenteCard.propTypes = {
  doc: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    nombre: PropTypes.string,
    cargo: PropTypes.string,
    especialidad: PropTypes.string,
    imagen_url: PropTypes.string,
    tutoria: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const Docentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargar = useCallback(() => {
    setCargando(true);
    setError(false);
    API.get('/docentes')
      .then(res => { setDocentes(res.data || []); })
      .catch(() => { setError(true); })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return docentes;
    const q = busqueda.toLowerCase();
    return docentes.filter(d =>
      (d.nombre || '').toLowerCase().includes(q) ||
      (d.cargo || '').toLowerCase().includes(q)
    );
  }, [docentes, busqueda]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-20">

      <section className="relative py-20 px-6 overflow-hidden bg-primary">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-semibold uppercase tracking-widest mb-6">
            <GraduationCap size={14} />
            Plana Académica
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Nuestros Docentes
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Profesionales comprometidos con la excelencia educativa y la formación integral de nuestros alumnos.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-10 pb-20 relative z-20">

        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">
                {cargando ? 'Cargando...' : `${filtrados.length} Miembros Activos`}
              </h2>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Personal académico calificado</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar docente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Buscar docente"
              />
            </div>
            <button
              onClick={cargar}
              disabled={cargando}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/20 rounded-lg transition-all disabled:opacity-50"
              aria-label="Actualizar"
            >
              <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {cargando && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => <SkeletonDocente key={i} />)}
          </div>
        )}

        {!cargando && !error && filtrados.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtrados.map((doc, i) => (
              <DocenteCard key={doc.id} doc={doc} index={i} />
            ))}
          </div>
        )}

        {!cargando && error && (
          <div className="bg-white rounded-xl p-16 text-center border border-red-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <UserX size={32} className="text-red-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Error de conexión</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              No se pudo establecer conexión con el servidor institucional. Por favor, intenta más tarde.
            </p>
            <button
              onClick={cargar}
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-600 transition-all"
            >
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && filtrados.length === 0 && (
          <div className="bg-white rounded-xl p-16 text-center border border-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sin coincidencias</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              No hemos encontrado ningún docente que coincida con tu búsqueda.
            </p>
            <button
              onClick={() => setBusqueda('')}
              className="text-primary font-semibold text-xs uppercase tracking-wider hover:text-red-600 transition-colors underline underline-offset-4"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Docentes;
