export interface TrendRow { date: string; prescriptions: number; dispensations: number; }
export interface MedicineCountRow { medicineId: string; medicineName: string; count: number; }
export interface BranchCountRow { pharmacyId: string; pharmacyName: string; count: number; }
export interface PharmacySummaryResponse {
  dispensations: number;
  previousDispensations: number;
  trend: TrendRow[];
  topMedicines: MedicineCountRow[];
  byBranch: BranchCountRow[];
}
