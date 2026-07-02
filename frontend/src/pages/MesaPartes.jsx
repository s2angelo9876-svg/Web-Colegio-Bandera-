import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API } from '../services/api';
import { validateDNI, validateEmail, validatePhone } from '../utils/sanitize';
import {
  User, Phone, ClipboardList, Send, FileText, CheckCircle2,
  AlertCircle, Loader2, Shield, Info, MapPin, Mail, Sparkles, Upload
} from 'lucide-react';
import Footer from '../components/Footer';

const GuiaItem = ({ step, title, desc }) => (
  <div className="flex gap-3">
    <div className="w-7 h-7 rounded-full bg-blue-50 text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs">
      {step}
    </div>
    <div>
      <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{desc}</p>
    </div>
  </div>
);

GuiaItem.propTypes = {
  step: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};

const InputField = ({ id, name, label, type = 'text', value, onChange, placeholder, error, icon: Icon, required, inputMode, pattern, maxLength, autoComplete, optional }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
      {label} {optional && <span className="text-slate-400 font-normal italic text-[10px]">(opcional)</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Icon size={15} />
        </div>
      )}
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        pattern={pattern}
        maxLength={maxLength}
        autoComplete={autoComplete}
        required={required}
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-slate-50 border ${error ? 'border-red-400' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
    {error && <p id={`${id}-error`} className="text-red-500 text-xs mt-0.5">{error}</p>}
  </div>
);

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.elementType,
  required: PropTypes.bool,
  inputMode: PropTypes.string,
  pattern: PropTypes.string,
  maxLength: PropTypes.string,
  autoComplete: PropTypes.string,
  optional: PropTypes.bool,
};

const TextAreaField = ({ id, name, label, value, onChange, placeholder, error, required, rows = 4 }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold text-slate-700">{label}</label>
    <textarea
      id={id}
      name={name}
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`w-full px-4 py-3 bg-slate-50 border ${error ? 'border-red-400' : 'border-slate-200'} rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none`}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    {error && <p id={`${id}-error`} className="text-red-500 text-xs mt-0.5">{error}</p>}
  </div>
);

TextAreaField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  rows: PropTypes.number,
};

const MesaPartes = () => {
  const initialForm = {
    asunto:             '',
    nombres_completos:  '',
    dni:                '',
    direccion:          '',
    telefono:           '',
    correo:             '',
    fundamentacion:     '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [status, setStatus]     = useState(null);
  const [message, setMessage]   = useState('');

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.asunto.trim()) {
      newErrors.asunto = 'El asunto es requerido';
    }

    if (!formData.nombres_completos.trim()) {
      newErrors.nombres_completos = 'Los nombres son requeridos';
    }

    const dniValidation = validateDNI(formData.dni);
    if (!dniValidation.valid) {
      newErrors.dni = dniValidation.error;
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    const phoneValidation = validatePhone(formData.telefono);
    if (!phoneValidation.valid) {
      newErrors.telefono = phoneValidation.error;
    }

    if (formData.correo.trim()) {
      const emailValidation = validateEmail(formData.correo);
      if (!emailValidation.valid) {
        newErrors.correo = emailValidation.error;
      }
    }

    if (!formData.fundamentacion.trim()) {
      newErrors.fundamentacion = 'La fundamentación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const resetForm = () => {
    setFormData(initialForm);
    setArchivo(null);
    const fileInput = document.getElementById('archivo-adjunto-input');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setEnviando(true);
    setStatus(null);
    setMessage('');

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (archivo) data.append('archivo_adjunto', archivo);

    try {
      const res = await API.post('/mesa-partes', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('success');
      setMessage(res.data.mensaje || 'Su solicitud ha sido registrada exitosamente.');
      resetForm();
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'No se pudo procesar tu trámite. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-20">

      <section className="relative py-20 px-6 overflow-hidden bg-primary">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-semibold uppercase tracking-widest mb-6">
            <ClipboardList size={14} />
            Trámites en Línea
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Mesa de Partes Virtual
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Presenta solicitudes oficiales, trámites y peticiones formales a nuestra mesa de partes digital de manera inmediata y segura.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-10 pb-20 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-5 flex items-center gap-2">
                <Info className="text-primary" size={18} />
                Guía de Presentación
              </h2>
              <div className="space-y-5">
                {[
                  { step: '1', title: 'Datos del Remitente', desc: 'Ingresa nombres, DNI, dirección y número de teléfono válidos.' },
                  { step: '2', title: 'Fundamento claro', desc: 'Describe con claridad y detalle el motivo de tu petición o asunto.' },
                  { step: '3', title: 'Adjuntos Opcionales', desc: 'Puedes subir una foto legible o archivo PDF si deseas respaldar tu pedido.' },
                  { step: '4', title: 'Código de Seguimiento', desc: 'Al finalizar, recibirás un expediente (#) para consultar el estado del trámite.' },
                ].map((item) => (
                  <GuiaItem key={item.step} {...item} />
                ))}
              </div>
            </div>

            <div className="bg-primary rounded-xl p-6 text-white shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Shield size={80} strokeWidth={1} />
              </div>
              <div className="relative z-10 space-y-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-300" />
                  Horarios de Atención
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Nuestra mesa de partes virtual recibe documentos las 24 horas. La revisión oficial se efectúa de lunes a viernes de 8:00 AM a 2:00 PM.
                </p>
                <div className="text-blue-300 font-semibold text-xs uppercase tracking-wider">
                  I.E. Emblemática Bandera del Perú
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">

              <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-11 h-11 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-slate-900 font-bold text-lg">Registrar Solicitud</h2>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Formulario Digital Oficial</p>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {status === 'success' && (
                  <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg p-4 mb-6" role="alert">
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight mb-1">¡Trámite Registrado!</p>
                      <p className="text-xs text-emerald-700 leading-relaxed">{message}</p>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-800 rounded-lg p-4 mb-6" role="alert">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={18} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight mb-1">Error de Registro</p>
                      <p className="text-xs text-red-700 leading-relaxed">{message}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <InputField
                    id="asunto" name="asunto" label="Asunto del Trámite"
                    value={formData.asunto} onChange={handleChange}
                    placeholder="Ej: Solicitud de Certificado de Estudios"
                    error={errors.asunto} required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      id="nombres_completos" name="nombres_completos" label="Nombres Completos"
                      value={formData.nombres_completos} onChange={handleChange}
                      placeholder="Tu nombre completo" icon={User}
                      error={errors.nombres_completos} required autoComplete="name"
                    />
                    <InputField
                      id="dni" name="dni" label="Número de DNI"
                      value={formData.dni} onChange={handleChange}
                      placeholder="DNI de 8 dígitos"
                      error={errors.dni} required inputMode="numeric" pattern="[0-9]{8}" maxLength="8" autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      id="direccion" name="direccion" label="Dirección Domiciliaria"
                      value={formData.direccion} onChange={handleChange}
                      placeholder="Av / Calle / N° / Distrito" icon={MapPin}
                      error={errors.direccion} required autoComplete="street-address"
                    />
                    <InputField
                      id="telefono" name="telefono" label="Teléfono Celular"
                      value={formData.telefono} onChange={handleChange}
                      placeholder="999 999 999" icon={Phone} type="tel"
                      error={errors.telefono} required inputMode="tel" autoComplete="tel"
                    />
                  </div>

                  <InputField
                    id="correo" name="correo" label="Correo Electrónico"
                    value={formData.correo} onChange={handleChange}
                    placeholder="tu-correo@ejemplo.com" icon={Mail} type="email"
                    error={errors.correo} optional autoComplete="email"
                  />

                  <TextAreaField
                    id="fundamentacion" name="fundamentacion" label="Fundamentación del Pedido"
                    value={formData.fundamentacion} onChange={handleChange}
                    placeholder="Redacte detalladamente los motivos y sustento de su solicitud..."
                    error={errors.fundamentacion} required
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Documento de Sustento <span className="text-slate-400 font-normal italic text-[10px]">(opcional)</span>
                    </label>
                    <div className="w-full p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors relative">
                      <Upload size={20} className="text-slate-400 mb-1.5" />
                      <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Cargar PDF, JPG o PNG</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Límite: 10MB</p>
                      <input
                        id="archivo-adjunto-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    {archivo && (
                      <div className="bg-blue-50/50 border border-blue-100 text-blue-800 rounded-lg px-3 py-2 flex items-center justify-between text-xs font-semibold">
                        <span className="truncate pr-3 flex items-center gap-2">
                          <FileText size={13} className="text-blue-500 flex-shrink-0" />
                          {archivo.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setArchivo(null); document.getElementById('archivo-adjunto-input').value = ''; }}
                          className="text-red-500 hover:text-red-700 font-bold uppercase text-[10px] tracking-wider"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg shadow-md transition-all active:scale-[0.98] text-sm"
                  >
                    {enviando ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Enviar Solicitud Oficial
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 justify-center text-slate-400">
                    <Shield size={12} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider">Plataforma Certificada por la I.E.</p>
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

MesaPartes.propTypes = {};

export default MesaPartes;
