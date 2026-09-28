import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { successMsg, errorMsg } from '../utils/sweetalert';
import SortableList from '../components/SortableList';

/**
 * Hook que encapsula la logica de reordenar items:
 * - Carga la lista desde fetchList
 * - Optimistic update del orden local
 * - Llama onSaveOrder al confirmar
 * - Toast de exito/error
 *
 * Uso:
 *   const { items, setItems, ReorderView, cargando } = useReorderList({
 *     fetchList: () => fetchGaleria().then(r => setItems(r.data)),
 *     onReorder: reordenarGaleria,
 *     entityName: 'fotos',
 *   });
 */
export function useReorderList({ fetchList, onReorder, entityName = 'elementos' }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      await fetchList(setItems);
    } catch (err) {
      errorMsg('Error al cargar', err.message);
    } finally {
      setCargando(false);
    }
  }, [fetchList]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleGuardar = async (ordenIds) => {
    setGuardando(true);
    try {
      await onReorder(ordenIds);
      successMsg('Orden guardado', `Se actualizo el orden de los ${entityName}.`);
      // Re-fetch para asegurar consistencia con el server
      await fetchList(setItems);
    } catch (err) {
      errorMsg('Error al guardar', err.response?.data?.error || err.message);
    } finally {
      setGuardando(false);
    }
  };

  const ReorderView = useCallback(({ renderItem, titulo, descripcion }) => (
    <SortableList
      items={items}
      renderItem={renderItem}
      onSaveOrder={handleGuardar}
      saving={guardando}
      title={titulo || `Reordenar ${entityName}`}
    />
  ), [items, guardando, entityName]);

  return { items, setItems, cargando, ReorderView };
}
