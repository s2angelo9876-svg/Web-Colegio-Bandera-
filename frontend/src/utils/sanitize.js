import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty) {
  if (!dirty) return '';
  if (typeof dirty !== 'string') return dirty;
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

export function sanitizeText(text) {
  if (!text) return '';
  if (typeof text !== 'string') return text;
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function validateDNI(dni) {
  if (!dni) return { valid: false, error: 'DNI es requerido' };
  const dniRegex = /^\d{8}$/;
  if (!dniRegex.test(dni)) {
    return { valid: false, error: 'DNI debe tener exactamente 8 dígitos numéricos' };
  }
  return { valid: true, error: null };
}

export function validateEmail(email) {
  if (!email) return { valid: false, error: 'Email es requerido' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Formato de email inválido' };
  }
  return { valid: true, error: null };
}

export function validatePhone(phone) {
  if (!phone) return { valid: false, error: 'Teléfono es requerido' };
  const phoneRegex = /^\d{7,9}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'Teléfono debe tener entre 7 y 9 dígitos' };
  }
  return { valid: true, error: null };
}
