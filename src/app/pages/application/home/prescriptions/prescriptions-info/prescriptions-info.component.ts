import { Component, DefaultIterableDiffer } from '@angular/core';
import { MAT_FAB_DEFAULT_OPTIONS_FACTORY } from '@angular/material/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-prescriptions-info',
  templateUrl: './prescriptions-info.component.html',
  styleUrl: './prescriptions-info.component.scss'
})
export class PrescriptionsInfoComponent {
  prescription: any;

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) {
    this.prescription = this.config.data.prescription;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'Disponible';
      case 'DISPENSED':
        return 'Dispensada';
      case 'PENDING':
        return 'Pendiente';
      default:
        return status;
    }
  }
}
