export interface PharmacyRequest {
  name: string;
  businessName: string | null;
  rut: string | null;
  email: string;
  password: string;
  phone: {
    countryCode: string;
    national: string;
    international: string;
    type: string;
    validated: boolean;
  };
  addressCountryId?: string;
  addressLocalityId?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComments?: string;
  camera?: string| null;
  logoId?: string| null;
  franchiseId?: string| null;
  passwordForgotCode?: string| null;
  managerName: string| null;
  managerLastname: string| null;
  managerCJP: string| null;
  managerDocument: {
    number: string;
    type: string;
  };
  status: string;
  info: string;
}