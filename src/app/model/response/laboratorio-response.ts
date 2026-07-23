export interface LaboratorioResponse {
  id: string | null;              // Primary key of the Laboratorio entity
  nombre: string | null;          // Name of the laboratory
  nombreAbr: string | null;       // Abbreviated name of the laboratory
  rut: string | null;             // RUT (Tax ID) of the laboratory
  estadoVal: string | null;       // Validation state of the laboratory
  observacion: string | null;     // Observations or notes
  url: string | null;             // URL of the laboratory
  estado: string | null; 
}