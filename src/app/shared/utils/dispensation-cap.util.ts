/**
 * Tope de cajas a dispensar según posología × unidades por caja (vmpp.CANTIDAD).
 * Misma semántica que DispensationCapCalculator en recetalia-api-rest.
 * Devuelve null cuando el tope no es computable (fallback: no topear).
 */
export interface DispensationCapInfo {
  maxBoxes: number;
  units: number; // unidades necesarias según posología (para la leyenda)
}

const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30; // mes crónico fijo de 30 días

export function computeDispensationCap(
  posology: { dose?: number; frecuency?: number; duration?: number; isCronic?: boolean },
  unitsPerBoxRaw?: string | null
): DispensationCapInfo | null {
  const unitsPerBox = parseFloat(unitsPerBoxRaw ?? '');
  if (!isFinite(unitsPerBox) || unitsPerBox <= 0) return null;

  const dose = posology.dose ?? 0;
  const frecuencyHours = posology.frecuency ?? 0;
  if (dose <= 0 || frecuencyHours <= 0) return null;

  const treatmentHours = posology.isCronic
    ? DAYS_PER_MONTH * HOURS_PER_DAY
    : (posology.duration ?? 0) * HOURS_PER_DAY;
  if (treatmentHours <= 0) return null;

  const doses = Math.ceil(treatmentHours / frecuencyHours);
  const units = doses * dose;
  return { maxBoxes: Math.ceil(units / unitsPerBox), units };
}
