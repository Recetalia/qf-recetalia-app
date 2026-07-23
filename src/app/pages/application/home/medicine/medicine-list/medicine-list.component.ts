import { Component } from '@angular/core';
import { AmpService } from '../../../../../services/amp.service';
import { MedicineResponse } from '../../../../../model/response/medicine-response';
import { CalendarModule } from 'primeng/calendar';
import { PrescriptionRequest } from '../../../../../model/request/prescription-request';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-pmedicine-list',
  templateUrl: './medicine-list.component.html',
  styleUrls: ['./medicine-list.component.scss']
})
export class MedicineListComponent {
  searchQuery: string = '';
  medicines: MedicineResponse[] = [];
  selectedMedicine: MedicineResponse | null = null;
  es: any;
  // prescriptionRequest: PrescriptionRequest;

  dosage: number = 1;
  frequency: number = 8;
  frequencyUnit: string = 'HOUR';
  duration: number = 8;
  durationUnit: string = 'DAYS';
  affections: string = '';
  medicalHistory: string = '';
  date: Date | null = null;
  showGeneric: Boolean = false;
  // property for "Crónico" checkbox
  isChronic: boolean = false;

  constructor(private ampService: AmpService, private ref: DynamicDialogRef) { }


  ngOnInit(): void {
  }

  onSearchChange(): void {
    this.showGeneric = false;
    if (this.searchQuery.trim()) {
      this.ampService.getSearchByprodMspLike(this.searchQuery).subscribe(
        (data: MedicineResponse[]) => {
          this.medicines = data;
          this.showGeneric = this.medicines.filter((medicine) => medicine.labName == null).length > 0;

        },
        error => {
          console.error('Error fetching medicine', error);
          this.medicines = [];
        }
      );
    } else {
      this.medicines = [];
    }
  }

  onMedicineSelect(medicine: MedicineResponse): void {
    this.selectedMedicine = medicine;
    this.selectedMedicine

    console.log('Submitting prescription:', this.selectedMedicine);

    // Pass the prescription back to the parent and close the dialog
    this.ref.close(this.selectedMedicine);

    this.resetSelection();
  }

  resetSelection(): void {
    this.selectedMedicine = null;
  }

  submitPrescription(): void {
    if (!this.date) {
      this.date = new Date();
      console.error('Date is not selected! new date: ', this.date);
    }

    const prescriptionRequest: PrescriptionRequest = {
      isCronic: this.isChronic,
      medicId: this.selectedMedicine?.id || '', // Replace with actual medicId
      patientId: '', // Replace with actual patientId
      code: '', // Example code
      status: 'AVAILABLE',
      dose: this.dosage,
      doseUnit: this.selectedMedicine?.dosificationUnit || '', // Example unit
      doseType: this.selectedMedicine?.dosificationType || '',
      frecuency: this.frequency,
      frecuencyUnit: this.frequencyUnit,
      medicalHistory: this.medicalHistory,
      affections: this.affections,
      duration: this.duration,
      durationUnit: this.isChronic? 'Meses': this.durationUnit,
      productType: this.selectedMedicine?.productType || '', // Example type
      productName: this.selectedMedicine?.name || '',
      productId: this.selectedMedicine?.id || '', // Use the selected medicine
      expireAt:  new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // Now + 45 days
      dosificationType: this.selectedMedicine?.dosificationUnit || ''
    };
    console.log('Submitting prescription:', prescriptionRequest);

    // Pass the prescription back to the parent and close the dialog
    this.ref.close(prescriptionRequest);

    this.resetSelection();
  }

  validateDosage(): void {
    if (this.dosage < 0.5) {
      this.dosage = 1;
    } else if (this.dosage % 0.5 !== 0) {
      this.dosage = Math.round(this.dosage * 2) / 2; // Round to nearest 0.5
    }
  }
  
  validateFrequency(): void {
    if (this.frequency < 1) {
      this.frequency = 1;
    }
  }
  
  validateDuration(): void {
    if (this.duration < 1) {
      this.duration = 1;
    }
  }

  isChronicChange(): void {
    if(this.isChronic) {
      this.duration = 8;
    } else {
      this.duration = 6;
    }
  }
}
