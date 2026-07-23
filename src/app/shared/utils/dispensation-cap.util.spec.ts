import { computeDispensationCap } from './dispensation-cap.util';

describe('computeDispensationCap', () => {
  it('caso de control agudo: 1 c/8h × 8 días, caja de 20 → 2 cajas (24 unidades)', () => {
    expect(computeDispensationCap({ dose: 1, frecuency: 8, duration: 8, isCronic: false }, '20'))
      .toEqual({ maxBoxes: 2, units: 24 });
  });

  it('crónica topea un mes de 30 días e ignora duration', () => {
    expect(computeDispensationCap({ dose: 1, frecuency: 8, duration: 2, isCronic: true }, '20'))
      .toEqual({ maxBoxes: 5, units: 90 });
  });

  it('frecuencia no divisora redondea tomas hacia arriba', () => {
    expect(computeDispensationCap({ dose: 1, frecuency: 7, duration: 3, isCronic: false }, '10'))
      .toEqual({ maxBoxes: 2, units: 11 });
  });

  it('dose fraccionada', () => {
    expect(computeDispensationCap({ dose: 0.5, frecuency: 12, duration: 10, isCronic: false }, '30'))
      .toEqual({ maxBoxes: 1, units: 10 });
  });

  it('sin datos devuelve null (no topear)', () => {
    expect(computeDispensationCap({ dose: 0, frecuency: 8, duration: 8 }, '20')).toBeNull();
    expect(computeDispensationCap({ dose: 1, frecuency: 0, duration: 8 }, '20')).toBeNull();
    expect(computeDispensationCap({ dose: 1, frecuency: 8, duration: 0, isCronic: false }, '20')).toBeNull();
    expect(computeDispensationCap({ dose: 1, frecuency: 8, duration: 8 }, undefined)).toBeNull();
    expect(computeDispensationCap({ dose: 1, frecuency: 8, duration: 8 }, 'abc')).toBeNull();
    expect(computeDispensationCap({ dose: 1, frecuency: 8, duration: 8 }, '0')).toBeNull();
  });
});
