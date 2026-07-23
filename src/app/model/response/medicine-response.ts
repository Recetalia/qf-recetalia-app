export interface MedicineResponse {
  id: string;                    // AMP or VMP ID
  name: string;                  // AMP_DSC or VMP_DSC
  unit: string | null;           // SNOMED_DSC (DSC_ABR)
  unidadDsc: string | null;      // UNIDAD_DSC (optional display)
  substanceName: string;         // SUSTANCIA_DSC
  labName: string | null;        // LABORATORIO.NOMBRE, null for VMP
  dosificationUnit: string;      // UNIDAD_DSC or FFA.DESCRIPCION
  permission: string[];          // AMP.PERMISION or hardcoded ['ROLE_MEDIC']
  productType: string;           // 'AMP' or 'VMP'
  dosif: string;                 // CANT_VOL_DOSIF
  dosificationType: 'VOLUME' | 'QUANTITY'; // Based on UNI_VOL_DOSIF or UNI_CONCENTR
  prodMsp: string | null;
  condvtaId: number | null;
}

