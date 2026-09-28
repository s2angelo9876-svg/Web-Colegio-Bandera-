import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
import { X, ArrowUpDown, Loader2 } from 'lucide-react';
import SortableList from './SortableList';
import { errorMsg } from '../utils/sweetalert';

/**
 * Modal de reordenamiento. Reutilizable para galeria, docentes, administrativos, carrusel, etc.
 *
 * Props:
 *   - open: bool
 *   - onClose: fn
 *   - title: string
 *   - description: string
 *   - items: array (estado actual)
 *   - renderItem: fn(item, index) => JSX
 *   - onSave: async (ordenIds) => void
 *   - entityName: string (para los toasts)
 */
export default function ReorderModal({
  open, onClose, title, description, items, renderItem, onSave, entityName = 'elementos',
}) {
  const [localItems, setLocalItems] = useState(items || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setLocalItems(items || []);
  }, [open, items]);

  const handleSave = useCallback(async () => {
    const ordenIds = localItems.map((it) => it.id);
    setSaving(true);
    try {
      await onSave(ordenIds);
      onClose();
    } catch (err) {
      errorMsg('No se pudo guardar el orden', err.message);
    } finally {
      setSaving(false);
    }
  }, [localItems, onSave, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ArrowUpDown size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-dark-text">{title}</h3>
              {description && (
                <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-dark-bg">
          <SortableList
            items={localItems}
            renderItem={renderItem}
            onSaveOrder={async (ordenIds) => {
              setSaving(true);
              try {
                await onSave(ordenIds);
                onClose();
              } finally {
                setSaving(false);
              }
            }}
            saving={saving}
            title="Arrastra para reordenar"
          />
        </div>
      </div>
    </div>
  );
}

ReorderModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  items: PropTypes.array,
  renderItem: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  entityName: PropTypes.string,
};
