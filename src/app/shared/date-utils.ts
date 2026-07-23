// src/app/shared/date-utils.ts
/** Serialize a JS Date (or string) to 'YYYY-MM-DD' for Spring LocalDate params */
export function toLocalDateParam(d?: Date | string | null): string | undefined {
  if (!d) return undefined;
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
