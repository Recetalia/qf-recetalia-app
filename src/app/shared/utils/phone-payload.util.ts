import { parsePhoneNumberFromString } from 'libphonenumber-js';

/** La forma exacta en que el backend guarda un teléfono (entidad `Phone`, JSON en columna text). */
export interface PhonePayload {
  countryCode: string;
  national: string;
  international: string;
  type: string;
  validated: boolean;
}

/**
 * `angular-phone-number-input` entrega un string E.164; el backend espera el objeto.
 *
 * Devuelve `null` en vez de tirar cuando el número no parsea: antes esto era un
 * `console.error` dentro de `onSubmit` y el formulario quedaba mudo — el usuario apretaba
 * "Registrar" y no pasaba nada, sin ningún mensaje.
 *
 * Acepta `number` además de `string` porque el input interno del componente es `type="number"`
 * y emite un valor numérico antes de re-emitir el E.164 ya formateado.
 */
export function toPhonePayload(raw: string | number | null | undefined): PhonePayload | null {
  const parsed = parsePhoneNumberFromString((raw ?? '').toString().trim());
  if (!parsed) {
    return null;
  }
  return {
    countryCode: parsed.country || '',
    national: parsed.nationalNumber || '',
    international: parsed.formatInternational() || '',
    type: 'mobile',
    validated: true,
  };
}
