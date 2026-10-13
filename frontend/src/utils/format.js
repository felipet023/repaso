import { SERVER_URL } from '../config/env';

export function urlImagen(nombreArchivo) {
  return nombreArchivo ? `${SERVER_URL}/uploads/products/${nombreArchivo}` : null;
}

export function formatCurrency(valor) {
  const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(valor);
  return `$${numero}`;
}

export function precioConDescuento(precio, descuento) {
  return Number(precio) * (1 - (Number(descuento) || 0) / 100);
}

export function formatFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
