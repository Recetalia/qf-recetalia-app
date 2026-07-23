// src/app/model/response/dispensation-search-row.ts

// The backend may return the document as an object or as a JSON string.
// Keep it flexible so your existing parseDoc() helper can handle both.
export type DocumentLike = { number: string; type: string } | string | null;

export interface DispensationSearchRow {
  // Prescription
  prescriptionId: string;
  prescriptionCode: string;
  prescriptionStatus: string;
  prescriptionDoseUnit: string | null;
  prescriptionFrecuency: number | null;
  prescriptionFrecuencyUnit: string | null;
  prescriptionDoseType: string | null;
  prescriptionIsCronic: boolean | null;
  prescriptionDose: number | null;
  prescriptionDuration: number | null;
  prescriptionDurationUnit: string | null;

  // Patient
  patientId: string;
  patientName: string | null;
  patientLastName: string | null;
  patientDocument: DocumentLike;

  // Dispensation
  dispensationId: string;
  dispensationStatus: string;
  dispensationQty: number | null;
  dispensationCreatedAt: string;      // ISO date-time
  dispensationUpdatedAt: string | null;
  dispensationProductId: string | null;
  dispensationProductName?: string | null; // NEW
  dispensationSubstitute: string | null;

  // Dispenser
  pharmacyDispenserId: string | null;
  pharmacyDispenserName: string | null;
  pharmacyDispenserLastName: string | null;
  pharmacyDispenserDocument: DocumentLike;

  // Medic (NEW)
  medicId: string | null;
  medicName: string | null;
  medicLastname: string | null;
  medicEmail: string | null;
  medicDocument: DocumentLike;
  medicCJP: string | null;

  // DNMA lab chosen by rule
  dnmaLaboratoryId: number | null;

  condvtaId?: number;

  // Pharmacy (chain context)
  pharmacyName?: string | null;

  prescriptionSubstanceName?: string | null;
}
