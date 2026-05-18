import React from 'react';
import { ShieldCheck, Mail, Users, Award, Briefcase, Clock, Calendar } from 'lucide-react';
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
      cargo: 'Subdirectora de Formación General (Académica)',
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

const Directivos = () => {
  return (
    <div className="bg-slate-50 dark:bg-dark-bg min-h-screen font-sans transition-colors duration-300">
      
      {/* ── Header de Página ── */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-red-600 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center animate-fade-in-up">
          <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-[2rem] flex items-center justify-center mb-6 animate-float backdrop-blur-sm shadow-xl">
            <Users size={40} className="text-white animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Plana Directiva
          </h1>
          <div className="w-24 h-1.5 bg-red-500 mx-auto mb-8 rounded-full shadow-lg" />
          <p className="text-xl md:text-2xl text-blue-100 font-light italic max-w-2xl px-4">
            Líderes comprometidos con la gestión institucional y la excelencia académica de nuestra emblemática casa de estudios.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50 dark:fill-dark-bg"></path>
            </svg>
        </div>
      </section>

      {/* ── Cuerpo del Organigrama / Lista ── */}
      <div className="max-w-7xl mx-auto px-6 pb-40 -mt-10 relative z-20 space-y-24">
        
        {/* SECCIÓN 1: DIRECCIÓN GENERAL */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-2">Nivel 1 · Dirección</h2>
            <div className="w-16 h-1 bg-red-500 mx-auto rounded-full" />
          </div>

          <div className="flex justify-center">
            {directivos.direccion.map((dir) => (
              <div 
                key={dir.nombre}
                className="w-full max-w-2xl bg-white dark:bg-dark-card border border-white dark:border-dark-border p-8 rounded-[3rem] shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 flex flex-col md:flex-row gap-8 items-center"
              >
                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-inner flex-shrink-0">
                  <img src={dir.imagen} className="w-full h-full object-cover" alt={dir.nombre} />
                </div>
                <div className="space-y-4 text-center md:text-left flex-1">
                  <span className="px-4 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100 dark:border-red-900/40">
                    {dir.cargo}
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase mt-2">{dir.nombre}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm italic font-medium leading-relaxed">
                    "{dir.frase}"
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-dark-border flex flex-wrap gap-4 text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1.5"><Award size={14} /> {dir.anios}</span>
                    <span className="flex items-center gap-1.5"><Mail size={14} /> {dir.correo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN 2: SUBDIRECCIONES */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-2">Nivel 2 · Subdirecciones</h2>
            <div className="w-16 h-1 bg-red-500 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {directivos.subdireccion.map((sub) => (
              <div 
                key={sub.nombre}
                className="bg-white dark:bg-dark-card border border-white dark:border-dark-border p-8 rounded-[3rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col gap-6 items-center text-center"
              >
                <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-inner flex-shrink-0">
                  <img src={sub.imagen} className="w-full h-full object-cover" alt={sub.nombre} />
                </div>
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-primary dark:text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100/50 dark:border-blue-900/40">
                      {sub.cargo}
                    </span>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase mt-3">{sub.nombre}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs italic font-medium leading-relaxed mt-2">
                      "{sub.frase}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-dark-border flex flex-col gap-2 text-[11px] font-bold text-gray-400 items-center">
                    <span className="flex items-center gap-1.5"><Award size={13} /> {sub.anios}</span>
                    <span className="flex items-center gap-1.5"><Mail size={13} /> {sub.correo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN 3: COORDINACIONES ACADÉMICAS */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-2">Nivel 3 · Coordinación Académica</h2>
            <div className="w-16 h-1 bg-red-500 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {directivos.coordinadoresAcad.map((acad) => (
              <div 
                key={acad.nombre}
                className="bg-white dark:bg-dark-card border border-white dark:border-dark-border p-8 rounded-[3rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col gap-6 items-center text-center"
              >
                <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-inner flex-shrink-0">
                  <img src={acad.imagen} className="w-full h-full object-cover" alt={acad.nombre} />
                </div>
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-dark-input text-gray-700 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-850">
                      {acad.cargo}
                    </span>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase mt-3">{acad.nombre}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs italic font-medium leading-relaxed mt-2">
                      "{acad.frase}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-dark-border flex flex-col gap-2 text-[11px] font-bold text-gray-400 items-center">
                    <span className="flex items-center gap-1.5"><Award size={13} /> {acad.anios}</span>
                    <span className="flex items-center gap-1.5"><Mail size={13} /> {acad.correo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN 4: COORDINACIONES DE TUTORÍA */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-2">Nivel 4 · Tutoría y Bienestar Estudiantil</h2>
            <div className="w-16 h-1 bg-red-500 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {directivos.coordinadoresTut.map((tut) => (
              <div 
                key={tut.nombre}
                className="bg-white dark:bg-dark-card border border-white dark:border-dark-border p-8 rounded-[3rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col gap-6 items-center text-center"
              >
                <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-inner flex-shrink-0">
                  <img src={tut.imagen} className="w-full h-full object-cover" alt={tut.nombre} />
                </div>
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100/50 dark:border-blue-900/40">
                      {tut.cargo}
                    </span>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase mt-3">{tut.nombre}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs italic font-medium leading-relaxed mt-2">
                      "{tut.frase}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-dark-border flex flex-col gap-2 text-[11px] font-bold text-gray-400 items-center">
                    <span className="flex items-center gap-1.5"><Award size={13} /> {tut.anios}</span>
                    <span className="flex items-center gap-1.5"><Mail size={13} /> {tut.correo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Directivos;
