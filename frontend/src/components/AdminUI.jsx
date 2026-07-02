import PropTypes from 'prop-types';
import { Plus, X, Search, Edit3, Trash2, Save, FileText, Type, Image as ImageIcon, Calendar, RefreshCw, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export function AdminPageHeader({ title, subtitle, badge, onButtonClick, formOpen, addButtonLabel = 'Crear' }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded mb-2">
          {badge}
          {subtitle}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h2>
      </div>
      {onButtonClick && (
        <button
          onClick={onButtonClick}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all active:scale-95 ${
            formOpen
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              : 'bg-primary text-white hover:bg-red-600 shadow-sm'
          }`}
        >
          {formOpen ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> {addButtonLabel}</>}
        </button>
      )}
    </div>
  );
}

AdminPageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  badge: PropTypes.node,
  buttonText: PropTypes.string,
  onButtonClick: PropTypes.func,
  formOpen: PropTypes.bool,
  addButtonLabel: PropTypes.string,
};

export function FormCard({ title, icon, children, onSubmit, submitting, submitLabel, onCancel }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-6 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
          <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center">
            {icon || <AlertCircle size={14} />}
          </div>
          {title}
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <form onSubmit={onSubmit} className="p-5 space-y-4">
        {children}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider hover:bg-slate-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {submitLabel || 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

FormCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  submitLabel: PropTypes.string,
  onCancel: PropTypes.func,
};

export function TextField({ id, name, label, value, onChange, placeholder, required, maxLength, type = 'text', icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700">{label}</label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          id={id}
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
        />
      </div>
    </div>
  );
}

TextField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  maxLength: PropTypes.string,
  type: PropTypes.string,
  icon: PropTypes.elementType,
};

export function TextAreaField({ id, name, label, value, onChange, placeholder, required, rows = 4 }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700">{label}</label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
      />
    </div>
  );
}

TextAreaField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  rows: PropTypes.number,
};

export function ImageUploadField({ id, label, preview, onChange, required }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">{label}</label>
      <div className={`relative border-2 border-dashed rounded-lg overflow-hidden transition-all ${
        preview ? 'border-solid border-primary' : 'border-slate-200 bg-slate-50 hover:border-primary'
      }`}>
        <div className="aspect-video flex flex-col items-center justify-center cursor-pointer relative">
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <>
              <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-2">
                <ImageIcon size={20} className="text-slate-400" />
              </div>
              <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Cargar imagen</p>
              <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG o WEBP</p>
            </>
          )}
          <input
            id={id}
            type="file"
            accept="image/*"
            required={required}
            onChange={onChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

ImageUploadField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  preview: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
};

export function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
    </div>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-3 mt-4">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30 transition-all"
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-xs font-semibold text-slate-700">
        Página {page} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30 transition-all"
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex gap-1.5 justify-end">
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-1.5 bg-blue-50 text-primary hover:bg-primary hover:text-white rounded-md transition-colors"
          title="Editar"
          aria-label="Editar"
        >
          <Edit3 size={14} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-colors"
          title="Eliminar"
          aria-label="Eliminar"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

ActionButtons.propTypes = {
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export function Alert({ type = 'info', children }) {
  if (!children) return null;
  const styles = {
    error: 'bg-red-50 border-red-100 text-red-800',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    info: 'bg-blue-50 border-blue-100 text-blue-800',
  };
  const icons = {
    error: <AlertCircle size={16} className="text-red-600" />,
    success: <AlertCircle size={16} className="text-emerald-600" />,
    info: <AlertCircle size={16} className="text-blue-600" />,
  };
  return (
    <div className={`flex items-start gap-2 border rounded-lg p-3 ${styles[type]}`}>
      <div className="w-7 h-7 bg-white/60 rounded-md flex items-center justify-center flex-shrink-0">
        {icons[type]}
      </div>
      <p className="text-sm font-medium leading-relaxed">{children}</p>
    </div>
  );
}

Alert.propTypes = {
  type: PropTypes.oneOf(['error', 'success', 'info']),
  children: PropTypes.node,
};
