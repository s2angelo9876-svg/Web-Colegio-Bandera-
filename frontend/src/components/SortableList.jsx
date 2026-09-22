import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Save, CheckCircle, RefreshCw } from 'lucide-react';

export default function SortableList({
  items = [],
  renderItem,
  onSaveOrder,
  saving = false,
  title = 'Reordenar elementos (Arrastra para cambiar el orden)',
}) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setOrderedItems(items);
    setHasChanges(false);
  }, [items]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    const list = Array.from(orderedItems);
    const [removed] = list.splice(source.index, 1);
    list.splice(destination.index, 0, removed);

    setOrderedItems(list);
    setHasChanges(true);
  };

  const handleSave = () => {
    const ordenIds = orderedItems.map((item) => item.id);
    onSaveOrder(ordenIds, orderedItems);
    setHasChanges(false);
  };

  const handleReset = () => {
    setOrderedItems(items);
    setHasChanges(false);
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-dark-border">
        <div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-dark-text flex items-center gap-2">
            <GripVertical size={16} className="text-slate-400" />
            {title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-0.5">
            Mantén presionado y arrastra cada tarjeta a su nueva posición.
          </p>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-2 animate-fade-in self-end sm:self-auto">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-800 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              Guardar nuevo orden
            </button>
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sortable-list">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 rounded-lg p-1 transition-colors ${
                snapshot.isDraggingOver ? 'bg-primary/5 ring-1 ring-primary/20' : ''
              }`}
            >
              {orderedItems.map((item, index) => (
                <Draggable key={String(item.id)} draggableId={String(item.id)} index={index}>
                  {(providedDraggable, snapshotDraggable) => (
                    <div
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      className={`flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-dark-card transition-shadow ${
                        snapshotDraggable.isDragging
                          ? 'border-primary ring-2 ring-primary/30 shadow-lg z-50'
                          : 'border-slate-200 dark:border-dark-border hover:border-slate-300'
                      }`}
                    >
                      <div
                        {...providedDraggable.dragHandleProps}
                        className="p-1 text-slate-400 hover:text-primary cursor-grab active:cursor-grabbing rounded"
                        title="Arrastra para reordenar"
                      >
                        <GripVertical size={18} />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        {renderItem(item, index)}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

SortableList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  onSaveOrder: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  title: PropTypes.string,
};
