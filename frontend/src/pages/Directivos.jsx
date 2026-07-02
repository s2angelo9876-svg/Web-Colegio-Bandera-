import { Mail, Users, Award } from 'lucide-react';
import Footer from '../components/Footer';

const directivos = {
  direccion: [
    {
      nombre: 'Dr. Alejandro Mendoza Torres',
      cargo: 'Director General',
      correo: 'direccion@banderadelperu.edu.pe',
      imagen: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
      frase: 'Liderando con el ejemplo para formar las futuras generaciones con honor y valores sólidos.',
      anios: '15 años de trayectoria'
    }
  ],
  subdireccion: [
    {
      nombre: 'Mg. Beatriz Ramos Delgado',
      cargo: 'Subdirectora de Formación General',
      correo: 'subdireccion.academica@banderadelperu.edu.pe',
      imagen: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      frase: 'Supervisando la excelencia curricular y pedagógica para potenciar el talento de cada alumno.',
      anios: '12 años de trayectoria'
    },
    {
      nombre: 'Lic. Carlos Espinoza Ruiz',
      cargo: 'Subdirector de Administración',
      correo: 'subdireccion.admin@banderadelperu.edu.pe',
      imagen: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      frase: 'Gestionando los recursos institucionales y garantizando la mejor infraestructura para el aprendizaje.',
      anios: '10 años de trayectoria'
    }
  ],
  coordinadoresAcad: [
    {
      nombre: 'Lic. Diana Flores Palomino',
      cargo: 'Coordinadora Académica de Letras y Humanidades',
      correo: 'diana.flores@banderadelperu.edu.pe',
      imagen: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      frase: 'Fomentando el pensamiento crítico, la lectura analítica y el desarrollo social en la comunidad.',
      anios: '8 años de trayectoria'
    },
    {
      nombre: 'Ing. Eduardo Ortiz Castro',
      cargo: 'Coordinador Académico de Ciencias y Tecnología',
      correo: 'eduardo.ortiz@banderadelperu.edu.pe',
      imagen: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
      frase: 'Guiando la innovación escolar en matemáticas, robótica y desarrollo tecnológico.',
      anios: '9 años de trayectoria'
    }
  ],
  coordinadoresTut: [
    {
      nombre: 'Psic. Gabriel Salcedo Vera',
      cargo: 'Coordinador de Tutoría y Convivencia (Turno Mañana)',
      correo: 'gabriel.salcedo@banderadelperu.edu.pe',
      imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      frase: 'Acompañando el desarrollo emocional de los estudiantes para una convivencia escolar pacífica.',
      anios: '7 años de trayectoria'
    },
    {
      nombre: 'Dra. Helga Peralta Vásquez',
      cargo: 'Coordinadora de Tutoría y Convivencia (Turno Tarde)',
      correo: 'helga.peralta@banderadelperu.edu.pe',
      imagen: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      frase: 'Fortaleciendo los lazos familiares y promoviendo la resiliencia y el respeto en las aulas.',
      anios: '11 años de trayectoria'
    }
  ]
};

const Section = ({ title, nivel, color = 'border-primary' }) => (
  <div className="space-y-8">
    <div className="text-center">
      <h3 className="text-xs font-bold uppercase tracking-widest text-red-600">{nivel}</h3>
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{title}</h2>
    </div>
  </div>
);

const DirectivoCard = ({ person, highlight }) => (
  <div className={`bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col ${highlight ? 'md:flex-row gap-6 items-center' : 'items-center text-center'}`}>
    <div className={`rounded-lg overflow-hidden flex-shrink-0 ${highlight ? 'w-32 h-32' : 'w-28 h-28'}`}>
      <img
        src={person.imagen}
        alt={person.nombre}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f1f5f9/64748b?text=Dir'; }}
      />
    </div>
    <div className={`flex-1 ${highlight ? 'text-left' : 'text-center'}`}>
      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${
        person.cargo.toLowerCase().includes('director')
          ? 'bg-red-50 text-red-600'
          : 'bg-blue-50 text-primary'
      }`}>
        {person.cargo.split('(')[0].trim().substring(0, 30)}
      </span>
      <h4 className="text-lg font-bold text-slate-900 mb-1">{person.nombre}</h4>
      <p className="text-slate-500 text-sm italic leading-relaxed mb-3">"{person.frase}"</p>
      <div className={`flex flex-wrap gap-3 text-xs text-slate-500 ${highlight ? '' : 'justify-center'}`}>
        <span className="inline-flex items-center gap-1">
          <Award size={12} className="text-amber-500" />
          {person.anios}
        </span>
        <span className="inline-flex items-center gap-1">
          <Mail size={12} className="text-primary" />
          {person.correo}
        </span>
      </div>
    </div>
  </div>
);

const Directivos = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-20">

      <section className="relative py-20 px-6 overflow-hidden bg-primary">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-semibold uppercase tracking-widest mb-6">
            <Users size={14} />
            Equipo Directivo
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Plana Directiva
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Líderes comprometidos con la gestión institucional y la excelencia académica de nuestra emblemática casa de estudios.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 -mt-10 pb-20 relative z-20 space-y-16">

        <section>
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">Nivel 1 · Dirección</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Dirección General</h2>
          </div>
          {directivos.direccion.map((dir) => (
            <DirectivoCard key={dir.nombre} person={dir} highlight />
          ))}
        </section>

        <section>
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">Nivel 2 · Subdirecciones</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Subdirecciones</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {directivos.subdireccion.map((sub) => (
              <DirectivoCard key={sub.nombre} person={sub} />
            ))}
          </div>
        </section>

        <section>
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">Nivel 3 · Coordinación Académica</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Coordinaciones Académicas</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {directivos.coordinadoresAcad.map((acad) => (
              <DirectivoCard key={acad.nombre} person={acad} />
            ))}
          </div>
        </section>

        <section>
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">Nivel 4 · Tutoría y Bienestar</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Tutoría y Convivencia</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {directivos.coordinadoresTut.map((tut) => (
              <DirectivoCard key={tut.nombre} person={tut} />
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default Directivos;
