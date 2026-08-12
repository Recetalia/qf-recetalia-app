import { PharmacyResponse } from './pharmacy-response';

export interface PharmaceuticalDirectorMeResponse {
  id: string;
  cjp: string;
  name: string;
  lastname: string;
  document: { number: string; type: string } | null;
  email: string | null;
  phone: any | null;
  /** ACTIVE | INACTIVE | NEEDS_REVIEW */
  status: string;
  /** null = nunca completó el registro */
  registeredAt: string | null;
  pharmacies: PharmacyResponse[];
}
