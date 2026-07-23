import { LaboratorioResponse } from "./laboratorio-response";
import { MedicineResponse } from "./medicine-response";

export interface ApiResponse<T> {
    status: string;
    answer: T;
    applicationProvider?: string;
    metadata?: any;
    serverDateTime: string;
}

export type AnswerMap = { [key: string]: MedicineResponse };

export type AnswerMapLaboratorio = { [key: string]: LaboratorioResponse };