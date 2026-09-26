import { toPhoneInput } from './phone-input.util';

describe('toPhoneInput', () => {

  /**
   * El caso que rompía /registro: el backend guarda `international` formateado con espacios
   * (`+598 94 462 626`, verificado en PROD el 2026-09-02 sobre el CJP 0129836), el widget le
   * saca el prefijo y le pasa el resto a un `<input type="number">`, y el navegador descarta
   * cualquier valor que no sea un número válido. Resultado: campo vacío con sólo "+598".
   */
  it('saca los espacios del formato internacional', () => {
    expect(toPhoneInput({ international: '+598 94 462 626' })).toBe('+59894462626');
  });

  it('deja intacto un número que ya viene sin espacios', () => {
    expect(toPhoneInput({ international: '+59894462626' })).toBe('+59894462626');
  });

  /** El espacio duro llega al pegar desde una planilla y `trim()` no lo saca. */
  it('saca también el espacio no separable', () => {
    expect(toPhoneInput({ international: '+598 94 462 626' })).toBe('+59894462626');
  });

  it('devuelve vacío cuando no hay teléfono', () => {
    expect(toPhoneInput(null)).toBe('');
    expect(toPhoneInput(undefined)).toBe('');
    expect(toPhoneInput({})).toBe('');
    expect(toPhoneInput({ international: '' })).toBe('');
  });

  /** Los registros viejos guardaron sólo el nacional; mejor eso que un campo en blanco. */
  it('cae al número nacional si no hay internacional', () => {
    expect(toPhoneInput({ national: '94 462 626' })).toBe('94462626');
  });
});
