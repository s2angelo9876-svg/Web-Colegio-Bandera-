import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { API, UPLOADS_URL } from '../services/api';
import { Briefcase, Users } from 'lucide-react';
import Footer from '../components/Footer';

function Administrativos() {
    const [personal, setPersonal] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/administrativos')
            .then(res => { setPersonal(res.data || []); })
            .catch(() => { /* ignore error */ })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pt-20">

            <section className="relative py-20 px-6 overflow-hidden bg-primary">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-semibold uppercase tracking-widest mb-6">
                        <Users size={14} />
                        Equipo de Soporte
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                        Personal Administrativo
                    </h1>
                    <p className="text-white/80 max-w-2xl mx-auto">
                        El equipo que hace posible el funcionamiento de nuestra institución.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 -mt-10 pb-20 relative z-20">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="bg-white rounded-xl p-4 shadow-md animate-pulse border border-slate-100">
                                <div className="w-full aspect-[4/5] bg-slate-100 rounded-lg mb-4"></div>
                                <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto mb-2"></div>
                                <div className="h-3 bg-slate-50 rounded w-1/2 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {personal.map(p => (
                            <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all duration-300 group">
                                <div className="aspect-[4/5] relative overflow-hidden bg-slate-100">
                                    <img
                                        src={p.imagen_url?.startsWith('http') ? p.imagen_url : (p.imagen_url ? `${UPLOADS_URL}/${p.imagen_url}` : 'https://placehold.co/400x500/f1f5f9/64748b?text=Personal')}
                                        alt={p.nombre}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://placehold.co/400x500/f1f5f9/64748b?text=Personal';
                                        }}
                                    />
                                    {p.area && (
                                        <span className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-full shadow-md text-[10px] font-bold text-primary uppercase tracking-wider">
                                            {p.area}
                                        </span>
                                    )}
                                </div>
                                <div className="p-5 text-center bg-white">
                                    <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{p.nombre}</h3>
                                    <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-3">{p.cargo}</p>
                                    <div className="inline-flex w-9 h-9 bg-slate-50 rounded-full items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                        <Briefcase size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && personal.length === 0 && (
                    <div className="bg-white rounded-xl p-16 text-center border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Sin personal registrado</h3>
                        <p className="text-slate-500 text-sm">No hay personal administrativo para mostrar.</p>
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
}

Administrativos.propTypes = {};

export default Administrativos;
