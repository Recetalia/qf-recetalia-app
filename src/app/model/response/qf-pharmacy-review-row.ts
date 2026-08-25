/** Una farmacia que declara a este QF como responsable, con lo que él ya dijo al respecto. */
export interface QfPharmacyReviewRow {
  pharmacyId: string;
  name: string;
  address: string;
  /**
   * ACCEPTED | REJECTED, o null si todavía no se pronunció.
   *
   * `null` es "pendiente", y no está guardado en ningún lado: es la ausencia de fila en la
   * tabla de decisiones. Así una farmacia nueva que lo declare aparece pendiente sola.
   */
  decision: 'ACCEPTED' | 'REJECTED' | null;
}
