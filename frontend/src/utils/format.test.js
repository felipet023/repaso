import { describe, expect, it } from 'vitest';
import { formatCurrency, precioConDescuento, urlImagen } from './format';

describe('format', () => {
  it('formatea moneda COP sin decimales', () => {
    expect(formatCurrency(1499990)).toBe('$1.499.990');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('calcula precio con descuento', () => {
    expect(precioConDescuento(100000, 10)).toBe(90000);
    expect(precioConDescuento(100000, 0)).toBe(100000);
    expect(precioConDescuento(100000, undefined)).toBe(100000);
  });

  it('construye la URL de imagen del servidor', () => {
    expect(urlImagen('producto-1.svg')).toContain('/uploads/products/producto-1.svg');
    expect(urlImagen(null)).toBeNull();
    expect(urlImagen('')).toBeNull();
  });
});
