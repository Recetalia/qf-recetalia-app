import { toPhonePayload } from './phone-payload.util';

describe('toPhonePayload', () => {
  it('arma el objeto que espera el backend a partir de un E.164 uruguayo', () => {
    expect(toPhonePayload('+59899123456')).toEqual({
      countryCode: 'UY',
      national: '99123456',
      international: '+598 99 123 456',
      type: 'mobile',
      validated: true,
    });
  });

  it('devuelve null si el numero no parsea, para que el llamador avise', () => {
    expect(toPhonePayload('123')).toBeNull();
    expect(toPhonePayload('')).toBeNull();
    expect(toPhonePayload(null)).toBeNull();
    expect(toPhonePayload(undefined)).toBeNull();
  });

  it('acepta el valor numerico que el componente emite antes del E.164', () => {
    expect(toPhonePayload(99123456 as unknown as number)).toBeNull();
  });
});
