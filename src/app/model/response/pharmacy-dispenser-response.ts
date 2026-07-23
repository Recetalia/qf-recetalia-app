import { PharmacyResponse } from './pharmacy-response';

export interface PharmacyDispenserResponse {
  id: string;
  name: string;
  lastname: string;
  document: {
    number: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string | null;
  pharmacy: PharmacyResponse;
  displayLabel: String;
}
