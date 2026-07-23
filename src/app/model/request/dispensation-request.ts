/** Matches your backend DispensationRequest (Instant fields as ISO strings) */
export interface DispensationRequest {
  qty?: number; // default 1
  prescriptionId: string;
  pharmacyId: string | undefined;
  status?: string;          // "DISPENSED" | "CANCELLED" | "AVAILABLE"
  substitute?: string;      // "Y" | "N"
  loteNumber: string;
  loteExpireAt?: string | null;    // ISO date string
  dispensedToName: string;
  dispensedToLastname: string;
  dispensedToDocument: {
        number: string;
        type: string;
    };
  dispensedToAddressCity?: string;
  dispensedToAddressStreet?: string;
  dispensedToAddressCountryId?: string;
  dispensedById: string | undefined;
  productId: string;
  productType: string;      // "AMP" | "VMP"
  dispensedCancelledById?: string;
  dnmaLaboratoryId?: number | undefined;
  condvtaId?: string | null;
}