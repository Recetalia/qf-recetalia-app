// src/app/model/response/pharmacy-response.ts
export interface PharmacyResponse {
  id: string;
  name: string;
  businessName: string;
  rut: string;
  email: string;
  phone: {
    countryCode: string;
    national: string;
    international: string;
    type: string;
    validated: boolean;
  };
  status: string;
  managerName: string;
  managerLastname: string;
  managerDocument: {
    number: string;
    type: string;
  };
  managerCJP: string;
  createdAt: string;
  updatedAt: string;

  // ⬇️ Optional (present in API even if your TS was missing them)
  addressCountryId?: string;
  addressLocalityId?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComments?: string;
  franchiseId?: string;
}
