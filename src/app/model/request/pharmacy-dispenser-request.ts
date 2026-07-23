export interface PharmacyDispenserRequest {
  name: string;
  lastname: string;
  document: {
    number: string;
    type: string;
  };
  pharmacyId: string | undefined;
}
