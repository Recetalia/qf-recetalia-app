export interface AmppResponse {
  id: string;
  descripcion: string;
  estado: string;
  comercializado: string;
  descripciones: string; // This is a JSON string, not a parsed object
  estadoValidacion: string;
  ampId: string;
  vmppId: string;
  dnmaLaboratoryId: number;
  laboratorioId: number;
  condvtaId: string;
  cantidad?: string; // unidades por caja (vmpp.CANTIDAD), puede faltar
}
