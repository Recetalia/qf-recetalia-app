export interface MedicResponse {
  id: string;
  name: string;
  lastname: string;
  gender?: string;
  email: string;
  phone: {
    countryCode: string;
    national: string;
    international: string;
    type: string;
    validated: boolean;
  };
  document: {
    number: string;
    type: string;
  };
  birthdate: string
  addressCountryId?: string
  addressLocalityId?: string
  addressStreet?: string
  addressNumber?: string
  addressComments?: string
  createdAt: string
  updatedAt: string
  deletedAt: any
  cjp: string
  status: string
  especialityId: string
  medicalProviderId: any
  medicalProviderName: string
  especialityName: string
}