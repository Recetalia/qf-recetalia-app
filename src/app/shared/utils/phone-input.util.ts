/**
 * Lo que guarda el backend, visto desde acá. Parcial a propósito: los registros viejos no
 * tienen todos los campos, y este util sólo necesita el número.
 */
interface PhoneLike {
  international?: string | null;
  national?: string | null;
}

/**
 * Deja un teléfono guardado listo para prellenar un `angular-phone-number-input`.
 *
 * **Por qué existe.** El widget renderiza su caja de texto como `<input type="number">`, y el
 * navegador descarta todo valor que no sea un número válido: un `international` formateado
 * (`+598 94 462 626`) entra bien al estado del componente y sale **vacío** en la pantalla, con
 * sólo el prefijo del país a la vista. Medido el 2026-09-02 sobre el DOM real: con espacios el
 * input queda en `""`, sin espacios muestra `94462626`.
 *
 * Cada pantalla que prellena un teléfono tiene que pasar por acá. Sin esto, la de médicos
 * resolvía lo mismo con un `.replace()` suelto y la del QF directamente no lo resolvía.
 *
 * Se sacan TODOS los separadores Unicode (`\p{Z}`), no sólo el espacio ASCII: el espacio duro
 * (U+00A0) llega al pegar desde una planilla y `trim()` no lo toca — mismo criterio que el
 * `trimToNull` del backend.
 */
export function toPhoneInput(phone: PhoneLike | null | undefined): string {
  const numero = phone?.international || phone?.national || '';
  return numero.replace(/[\p{Z}\s]/gu, '');
}
