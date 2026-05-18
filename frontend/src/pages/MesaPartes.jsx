import React, { useState } from 'react';
import { API } from '../services/api';
import {
  User, Phone, ClipboardList, Send, FileText, CheckCircle2,
  AlertCircle, Loader2, Shield, Info, MapPin, Mail, Sparkles, Upload
} from 'lucide-react';
import Footer from '../components/Footer';

const MesaPartes = () => {
  const [formData, setFormData] = useState({
    asunto:             '',
    nombres_completos:  '',
    dni:                '',
    direccion:          '',
    telefono:           '',
    correo:             '',
    fundamentacion:     '',
  });
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [status, setStatus]     = useState(null); // 'success' | 'error' | null
  const [message, setMessage]   = useState('');

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setStatus(null);
    setMessage('');

    const data = new FormData();
    data.append('asunto', formData.asunto);
    data.append('nombres_completos', formData.nombres_completos);
    data.append('dni', formData.dni);
    data.append('direccion', formData.direccion);
    data.append('telefono', formData.telefono);
    data.append('correo', formData.correo);
    data.append('fundamentacion', formData.fundamentacion);
    if (archivo) {
      data.append('archivo_adjunto', archivo);
    }

    try {
      const res = await API.post('/mesa-partes', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('success');
      setMessage(res.data.mensaje || 'Su solicitud ha sido registrada exitosamente.');
      setFormData({
        asunto:             '',
        nombres_completos:  '',
        dni:                '',
        direccion:          '',
        telefono:           '',
        correo:             '',
        fundamentacion:     '',
      });
      setArchivo(null);
      // Reset file input element
      const fileInput = document.getElementById('archivo-adjunto-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage(err.response?.data?.error || 'No se pudo procesar tu trámite. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Page Header ── */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
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
            Mesa de Partes Virtual
          </h1>
          <div className="w-24 h-1.5 bg-red-500 mx-auto mb-8 rounded-full shadow-lg shadow-red-900/40" />
          <p className="text-xl md:text-2xl text-blue-100 font-light italic max-w-2xl px-4 animate-fade-in-up delay-100 leading-relaxed">
            Presenta solicitudes oficiales, trámites y peticiones formales a nuestra mesa de partes digital de manera inmediata y segura.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
            </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-10 pb-32 relative z-20">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* ── Columna izquierda: info ── */}
          <div className="lg:col-span-5 space-y-8 animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/5 border border-white">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6 uppercase flex items-center gap-3">
                <Info className="text-primary" size={24} />
                Guía de Presentación
              </h2>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Datos del Remitente', desc: 'Ingresa nombres, DNI, dirección y número de teléfono válidos.' },
                  { step: '2', title: 'Fundamento claro', desc: 'Describe con claridad y detalle el motivo de tu petición o asunto.' },
                  { step: '3', title: 'Adjuntos Opcionales', desc: 'Puedes subir una foto legible o archivo PDF si deseas respaldar tu pedido.' },
                  { step: '4', title: 'Código de Seguimiento', desc: 'Al finalizar, recibirás un expediente (#) para consultar el estado del trámite.' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-primary font-black flex items-center justify-center flex-shrink-0 text-sm">
                      {step}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
                      <p className="text-gray-400 text-xs font-medium leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Informativo */}
            <div className="bg-gradient-to-br from-primary-dark to-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                  <Shield size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="font-black text-xl flex items-center gap-3">
                  <Sparkles size={22} className="text-blue-400 animate-pulse" />
                  Horarios de Atención
                </h3>
                <p className="text-blue-200/80 text-sm leading-relaxed font-medium">
                  Nuestra mesa de partes virtual recibe documentos las 24 horas del día. Sin embargo, la revisión oficial por secretaría general se efectúa de lunes a viernes en el horario de 8:00 AM a 2:00 PM.
                </p>
                <div className="pt-2 flex items-center gap-3 text-blue-300 font-bold text-xs uppercase tracking-wider">
                  <span>I.E. Emblemática Bandera del Perú</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Columna derecha: formulario ── */}
          <div className="lg:col-span-7 animate-fade-in-up delay-200">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-white overflow-hidden">
              
              <div className="bg-slate-50 p-10 border-b border-slate-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-primary rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-blue-900/20">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-gray-900 font-black text-2xl uppercase tracking-tighter">Registrar Solicitud</h2>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-1">Formulario Digital Oficial</p>
                </div>
              </div>

              <div className="p-10 md:p-12">
                {status === 'success' && (
                  <div className="flex items-start gap-5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-[2rem] p-6 mb-8 animate-badge-pop">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-black text-lg leading-tight mb-1 uppercase tracking-tight">¡Trámite Registrado!</p>
                      <p className="text-sm text-emerald-600 font-bold leading-normal">
                        {message}
                      </p>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex items-start gap-5 bg-red-50 border border-red-100 text-red-800 rounded-[2rem] p-6 mb-8 animate-badge-pop">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={24} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-black text-lg leading-tight mb-1 uppercase tracking-tight">Error de Registro</p>
                      <p className="text-sm text-red-600 font-semibold leading-normal">
                        {message}
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Asunto */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Asunto del Trámite *</label>
                    <input
                      type="text"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      placeholder="Ej: Solicitud de Certificado de Estudios"
                      className="w-full px-5 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-primary rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombres Completos */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nombres Completos *</label>
                      <div className="relative group">
                        <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          name="nombres_completos"
                          value={formData.nombres_completos}
                          onChange={handleChange}
                          placeholder="Tu nombre completo"
                          className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-primary rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                          required
                        />
                      </div>
                    </div>

                    {/* DNI */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Número de DNI *</label>
                      <input
                        type="text"
                        name="dni"
                        value={formData.dni}
                        onChange={handleChange}
                        placeholder="DNI de 8 dígitos"
                        maxLength="8"
                        className="w-full px-5 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-primary rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dirección */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Dirección Domiciliaria *</label>
                      <div className="relative group">
                        <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                          placeholder="Av / Calle / N° / Distrito"
                          className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-primary rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                          required
                        />
                      </div>
                    </div>

                    {/* Teléfono Celular */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Teléfono Celular *</label>
                      <div className="relative group">
                        <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          placeholder="999 999 999"
                          className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-primary rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Correo Electrónico (OPCIONAL) */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                      Correo Electrónico <span className="text-gray-300 font-bold lowercase italic">(opcional)</span>
                    </label>
                    <div className="relative group">
                      <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        placeholder="tu-correo@ejemplo.com"
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-primary rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Fundamentación del pedido */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Fundamentación del Pedido *</label>
                    <textarea
                      name="fundamentacion"
                      rows="4"
                      value={formData.fundamentacion}
                      onChange={handleChange}
                      placeholder="Redacte detalladamente los motivos y sustento de su solicitud..."
                      className="w-full px-5 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-primary rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none transition-all shadow-inner resize-none"
                      required
                    ></textarea>
                  </div>

                  {/* Archivo Adjunto (OPCIONAL) */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                      Documento de Sustento Adjunto <span className="text-gray-300 font-bold lowercase italic">(opcional)</span>
                    </label>
                    <div className="w-full p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.25rem] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-all relative">
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <p className="text-xs font-black uppercase text-gray-500 tracking-wider">Cargar PDF, JPG o PNG</p>
                      <p className="text-[10px] text-gray-400 mt-1">Límite de tamaño: 10MB</p>
                      <input
                        id="archivo-adjunto-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    {archivo && (
                      <div className="bg-blue-50/50 border border-blue-100 text-blue-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-bold animate-badge-pop">
                        <span className="truncate pr-4 flex items-center gap-2">
                          <FileText size={14} className="text-blue-500 flex-shrink-0" />
                          {archivo.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setArchivo(null); document.getElementById('archivo-adjunto-input').value = ''; }}
                          className="text-red-500 hover:text-red-700 font-black uppercase text-[10px] tracking-wider transition-colors ml-auto"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Botón submit */}
                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full flex items-center justify-center gap-4 bg-primary hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-900/20 hover:shadow-red-500/30 transition-all duration-500 transform active:scale-95 uppercase tracking-widest text-xs"
                  >
                    {enviando ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Enviando Expediente...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar Solicitud Oficial
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3 justify-center text-gray-400">
                     <Shield size={14} />
                     <p className="text-[10px] font-black uppercase tracking-widest">Plataforma Certificada por la I.E.</p>
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

export default MesaPartes;
