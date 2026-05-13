import React, { useState } from 'react';
import { API } from '../services/api';
import {
  User, Phone, BookOpen, ClipboardList, ChevronRight,
  CheckCircle2, AlertCircle, Loader2, Send, Zap,
  FileText, Clock, Star, ArrowRight, Shield, Award
} from 'lucide-react';
import Footer from '../components/Footer';

const grados = [
  '1er Año Secundaria', '2do Año Secundaria', '3er Año Secundaria',
  '4to Año Secundaria', '5to Año Secundaria',
];

const pasos = [
  { icon: FileText,     step: '01', title: 'Completa el formulario', desc: 'Ingresa los datos del apoderado y del estudiante de forma precisa.' },
  { icon: Clock,        step: '02', title: 'Evaluación de Solicitud',  desc: 'Nuestro equipo académico revisará el perfil en 24–48 horas.' },
  { icon: Phone,        step: '03', title: 'Entrevista Personal',     desc: 'Coordinaremos una reunión presencial para conocernos mejor.' },
  { icon: Star,         step: '04', title: 'Matrícula Oficial',      desc: '¡Felicidades! Ya eres parte de nuestra prestigiosa institución.' },
];

const Admision = () => {
  const [formData, setFormData] = useState({
    nombre_padre:   '',
    nombre_student: '',
    grado:          '1er Año Secundaria',
    telefono:       '',
  });
  const [enviando, setEnviando] = useState(false);
  const [status, setStatus]     = useState(null); // 'success' | 'error' | null

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setStatus(null);
    try {
      await API.post('/admision', formData);
      setStatus('success');
      setFormData({ nombre_padre: '', nombre_student: '', grado: '1er Año Secundaria', telefono: '' });
    } catch {
      setStatus('error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Page Header ── */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-[#003087] to-[#001D52]">
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
           <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="animate-badge-pop mb-6">
            <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-[2rem] flex items-center justify-center animate-float backdrop-blur-sm">
                <ClipboardList size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 animate-fade-in-up">
            Admisión 2026
          </h1>
          <div className="w-24 h-1.5 bg-red-500 mx-auto mb-8 rounded-full shadow-lg shadow-red-900/40" />
          <p className="text-xl md:text-2xl text-blue-100 font-light italic max-w-2xl px-4 animate-fade-in-up delay-100 leading-relaxed">
            Inicia el camino hacia la excelencia. Asegura el futuro académico de tus hijos en una institución emblemática.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
            </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-10 pb-32 relative z-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* ── Columna izquierda: pasos ── */}
          <div className="space-y-10 animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-xl shadow-blue-900/5 border border-white">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-6 uppercase">
                Proceso de Inscripción
              </h2>
              <div className="space-y-8">
                {pasos.map(({ icon: Icon, step, title, desc }, i) => (
                  <div
                    key={step}
                    className="group flex items-start gap-6 relative"
                  >
                    {i < pasos.length - 1 && (
                       <div className="absolute left-7 top-14 w-0.5 h-10 bg-slate-100 group-hover:bg-blue-100 transition-colors" />
                    )}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-[#003087] group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-sm">
                        <Icon size={24} />
                      </div>
                      <span className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-600 rounded-lg text-white text-[10px] font-black flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                        {step}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg mb-1 group-hover:text-[#003087] transition-colors">{title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner de Ayuda */}
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-[2.5rem] p-10 text-white shadow-xl shadow-red-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                  <Shield size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <h3 className="font-black text-2xl mb-4 flex items-center gap-3">
                  <Phone size={24} className="animate-bounce" />
                  Atención Directa
                </h3>
                <p className="text-red-100 text-lg leading-relaxed mb-8 font-light italic">
                  Si tienes dudas sobre los requisitos o el proceso, llámanos. Un asesor está listo para ayudarte.
                </p>
                <a href="tel:056123456" className="inline-flex items-center gap-4 bg-white text-red-600 font-black px-8 py-4 rounded-2xl hover:bg-slate-100 transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs">
                  (056) 123-456
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* ── Columna derecha: formulario ── */}
          <div className="animate-fade-in-up delay-200">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-white overflow-hidden sticky top-32">

              {/* Header formulario */}
              <div className="bg-slate-50 p-10 md:p-12 border-b border-slate-100 relative">
                <div className="absolute top-0 right-0 p-8 text-blue-50">
                    <Award size={80} strokeWidth={1} />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-[#003087] rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-blue-900/20">
                    <Send size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-gray-900 font-black text-2xl uppercase tracking-tighter">Postulación</h2>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-1">Admisión Virtual 2026</p>
                  </div>
                </div>
              </div>

              <div className="p-10 md:p-12">
                {/* Alerta éxito */}
                {status === 'success' && (
                  <div className="flex items-start gap-5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-[2rem] p-6 mb-8 animate-badge-pop">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-black text-lg leading-tight mb-1 uppercase tracking-tight">¡Enviado con éxito!</p>
                      <p className="text-sm text-emerald-600 font-medium">
                        Tu solicitud ha sido recibida. Un asesor te contactará muy pronto.
                      </p>
                    </div>
                  </div>
                )}

                {/* Alerta error */}
                {status === 'error' && (
                  <div className="flex items-start gap-5 bg-red-50 border border-red-100 text-red-800 rounded-[2rem] p-6 mb-8 animate-badge-pop">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={24} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-black text-lg leading-tight mb-1 uppercase tracking-tight">Hubo un problema</p>
                      <p className="text-sm text-red-600 font-medium">
                        No pudimos procesar tu solicitud. Intenta nuevamente en unos minutos.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Nombre apoderado */}
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                          Padre o Apoderado
                        </label>
                        <div className="relative group">
                          <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003087] transition-colors" />
                          <input
                            type="text"
                            name="nombre_padre"
                            value={formData.nombre_padre}
                            onChange={handleChange}
                            placeholder="Nombre completo"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-[#003087] rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                            required
                          />
                        </div>
                      </div>

                      {/* Teléfono */}
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                          Teléfono de Contacto
                        </label>
                        <div className="relative group">
                          <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003087] transition-colors" />
                          <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="999 999 999"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-[#003087] rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                            required
                          />
                        </div>
                      </div>
                  </div>

                  {/* Nombre estudiante */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                      Nombre del Postulante
                    </label>
                    <div className="relative group">
                      <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003087] transition-colors" />
                      <input
                        type="text"
                        name="nombre_student"
                        value={formData.nombre_student}
                        onChange={handleChange}
                        placeholder="Nombres y apellidos del alumno"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-[#003087] rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  {/* Grado */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                      Nivel y Grado Académico
                    </label>
                    <div className="relative group">
                      <BookOpen size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003087] transition-colors pointer-events-none" />
                      <select
                        name="grado"
                        value={formData.grado}
                        onChange={handleChange}
                        className="w-full pl-14 pr-12 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-[#003087] rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                      >
                        {grados.map(g => <option key={g}>{g}</option>)}
                      </select>
                      <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Botón submit */}
                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full flex items-center justify-center gap-4 bg-[#003087] hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-900/20 hover:shadow-red-500/30 transition-all duration-500 transform active:scale-95 uppercase tracking-widest text-xs"
                  >
                    {enviando ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Procesando Solicitud...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar Solicitud Virtual
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3 justify-center text-gray-400">
                     <Shield size={14} />
                     <p className="text-[10px] font-black uppercase tracking-widest">Protección de Datos Garantizada</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Admision;