import { describe, expect, it } from 'vitest';
import { isEmail, passwordErrors, required } from './validators';

describe('validators', () => {
  it('valida correos electrónicos', () => {
    expect(isEmail('usuario@ejemplo.com')).toBe(true);
    expect(isEmail('no-correo')).toBe(false);
    expect(isEmail('')).toBe(false);
  });

  it('exige contraseña segura: 8+ caracteres, mayúscula, minúscula, número y especial', () => {
    expect(passwordErrors('ClaveSegura1!')).toHaveLength(0);
    expect(passwordErrors('corta')).toContain('Mínimo 8 caracteres');
    expect(passwordErrors('todominuscula1!')).toContain('una mayúscula');
    expect(passwordErrors('TODOMAYUSCULA1!')).toContain('una minúscula');
    expect(passwordErrors('SinNumero!')).toContain('un número');
    expect(passwordErrors('SinEspecial1')).toContain('un carácter especial');
  });

  it('valida campos requeridos', () => {
    expect(required('texto')).toBe(true);
    expect(required('  ')).toBe(false);
    expect(required('')).toBe(false);
    expect(required(null)).toBe(false);
  });
});
