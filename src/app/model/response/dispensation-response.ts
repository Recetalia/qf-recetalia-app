/** Matches your backend DispensationResponse */
export interface DispensationResponse {
  id: string;
  qty: number;
  createdAt: string;      // ISO string
  updatedAt: string;      // ISO string
  deletedAt?: string | null;

  status: string;
  substitute: string;

  loteNumber: string;
  loteExpireAt?: string | null;

  dispensedToName: string;
  dispensedToLastname: string;
  dispensedToDocument: {
    number: string;
    type: string;
  };

  dispensedToAddressCity?: string | null;
  dispensedToAddressStreet?: string | null;
  dispensedToAddressCountryId?: string | null;
  dispensedToAddressCountryName?: string | null;

  prescriptionId: string;

  pharmacyId: string;
  pharmacyName?: string | null;

  dispensedById: string;
  dispensedByName?: string | null;

  dispensedCancelledById?: string | null;
  dispensedCancelledByName?: string | null;

  productId: string;
  productType: string;
}
