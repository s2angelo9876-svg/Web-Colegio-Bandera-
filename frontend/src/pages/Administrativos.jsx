import { useEffect, useState } from 'react'
import { API, UPLOADS_URL } from '../services/api'
import { Briefcase, Users } from 'lucide-react'

function Administrativos() {
    const [personal, setPersonal] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        API.get('/administrativos').then(res => {
            setPersonal(res.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="page-header flex flex-col items-center justify-center text-center">
                <Users size={48} className="text-white/80 mb-4 animate-pulse-soft" />
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                    Personal Administrativo
                </h1>
                <p className="text-blue-100 text-lg md:text-xl font-light max-w-2xl px-4">
                    El equipo que hace posible el funcionamiento de nuestra institución
                </p>
                <div className="w-24 h-1.5 bg-red-500 mx-auto mt-8 rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="bg-white rounded-[2.5rem] p-6 shadow-xl animate-pulse">
                                <div className="w-full aspect-[4/5] bg-gray-200 rounded-3xl mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {personal.map(p => (
                            <div key={p.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 transform hover:-translate-y-2">
                                <div className="aspect-[4/5] relative overflow-hidden">
                                    <img 
                                        src={p.imagen_url?.startsWith('http') ? p.imagen_url : (p.imagen_url ? `${UPLOADS_URL}/${p.imagen_url}` : 'https://via.placeholder.com/400x500?text=Personal')} 
                                        alt={p.nombre}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#003087]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg transform translate-y-[-20px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <span className="text-xs font-black text-blue-800 uppercase tracking-widest">{p.area || 'General'}</span>
                                    </div>
                                </div>
                                <div className="p-8 text-center relative bg-white">
                                    <h3 className="text-xl font-black text-gray-800 mb-1 group-hover:text-[#003087] transition-colors">{p.nombre}</h3>
                                    <p className="text-blue-600 font-bold text-sm uppercase tracking-tighter mb-4">{p.cargo}</p>
                                    <div className="flex justify-center gap-2">
                                        <div className="p-3 bg-gray-50 rounded-full text-gray-400 hover:bg-[#003087] hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-md">
                                            <Briefcase size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
export default Administrativos;