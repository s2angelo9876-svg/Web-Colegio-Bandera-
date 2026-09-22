import Swal from 'sweetalert2';

/**
 * Helpers de Swal con mensajes amigables para usuarios no-tecnicos.
 * Centraliza textos para que el admin siempre vea el mismo tono.
 */

const baseStyle = {
  customClass: {
    confirmButton: 'bg-primary text-white font-semibold px-5 py-2.5 rounded-lg mx-1',
    cancelButton:  'bg-slate-100 text-slate-700 font-semibold px-5 py-2.5 rounded-lg mx-1',
    denyButton:    'bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg mx-1',
  },
  buttonsStyling: false,
  reverseButtons: true,
  focusConfirm: true,
};

/**
 * Mensaje de exito simple.
 */
export function successMsg(title, text = '') {
  return Swal.fire({
    ...baseStyle,
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Listo',
  });
}

/**
 * Mensaje de exito con link a la web publica.
 * Uso: successWithLink('Noticia publicada!', 'Tu noticia ya esta visible.', '/noticias')
 */
export function successWithLink(title, text, publicUrl) {
  return Swal.fire({
    ...baseStyle,
    icon: 'success',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: '👁️ Ver en la web',
    cancelButtonText: 'Seguir aqui',
  }).then((result) => {
    if (result.isConfirmed && publicUrl) {
      window.open(publicUrl, '_blank', 'noopener,noreferrer');
    }
    return result;
  });
}

/**
 * Confirmacion amigable antes de borrar.
 * Uso: confirmDelete('esta noticia', () => deleteNoticia(id))
 */
export function confirmDelete(itemLabel, onConfirm) {
  return Swal.fire({
    ...baseStyle,
    icon: 'warning',
    title: '¿Eliminar ' + itemLabel + '?',
    text: 'Esta accion no se puede deshacer. Si te arrepientes, tendras que crearlo de nuevo.',
    showCancelButton: true,
    confirmButtonText: 'Si, eliminar',
    cancelButtonText: 'No, cancelar',
    confirmButtonColor: '#dc2626',
  }).then((result) => {
    if (result.isConfirmed) onConfirm();
    return result;
  });
}

/**
 * Error con mensaje claro.
 */
export function errorMsg(title, text = '') {
  return Swal.fire({
    ...baseStyle,
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Entendido',
  });
}

/**
 * Toast rapido (no bloquea).
 */
export function quickToast(icon, title) {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
}
