// src/app/pages/application/home/dispensations/dispensations-info/dispensations-info.component.ts
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DispensationService } from '../../../../../services/dispensation.service';
import { DispensationSearchRow } from '../../../../../model/response/dispensation-search-row';
import { LaboratorioService } from '../../../../../services/laboratorio.service';
import { MedicsService } from '../../../../../services/medics.service';
import { PatientService } from '../../../../../services/patient.service';
import { Router } from '@angular/router';
import { MedicResponse } from '../../../../../model/response/medic-response';
import { PrescriptionService } from '../../../../../services/prescription.service';
import { PrescriptionResponse } from '../../../../../model/response/prescription-response';
import { AuthService } from '../../../../../services/auth.service';
import { DispensationFileService } from '../../../../../services/dispensation-file.service';

@Component({
  selector: 'app-dispensations-info',
  templateUrl: './dispensations-info.component.html',
  styleUrls: ['./dispensations-info.component.scss'] // <- plural
})
export class DispensationsInfoComponent implements OnInit {
  loading = true;
  detail!: DispensationSearchRow & { dispensationProductName?: string | null };
  labName?: string;
  medicResponse?: MedicResponse;
  prescription?: PrescriptionResponse;
  public Date = Date;

  constructor(
    private router: Router,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dispensationService: DispensationService,
    private laboratorioService: LaboratorioService,
    private medicService: MedicsService,
    private patientService: PatientService,
    private prescriptionService: PrescriptionService,
    private authService: AuthService,
    private dispensationFileService: DispensationFileService
  ) { }

  ngOnInit(): void {
    // 1) Instant preview (from the row you clicked)
    const preview = this.config.data?.dispensationPreview as DispensationSearchRow | undefined;
    if (preview) {
      this.detail = preview as any;
      this.loading = false;
    }

    // 2) Optional: fetch full detail by id (if you have an endpoint)
    const id: string | undefined = this.config.data?.dispensationId;
    if (id) {
      this.loading = true;
      this.dispensationService.getById(id).subscribe({
        next: (full) => {
          // Prefer values from the full detail, fallback to preview:
          this.detail = { ...(this.detail || {}), ...(full as any) };
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          // even if error, still try lab name from preview
        }
      });

      this.findprescriptionById(preview?.prescriptionId ? preview.prescriptionId : '');
    }
  }

  findMedicById(medicId: string): void {
    this.medicService.getById(medicId).subscribe(
      (data: MedicResponse) => {
        this.medicResponse = data;
      },
      error => {
        console.error('Error find Medic by Id', error);
      }
    );
  }

  exportDispensationsPDF() {
    this.dispensationFileService.exportDispensationsToPdf(this.detail);
  }

  findprescriptionById(prescriptionId: string): void {
    this.prescriptionService.getById(prescriptionId).subscribe({
      next: (data) => {
        this.prescription = data;
      },
      error: (error) => {
        console.error('Error find prescriptions by Id', error);
      }
    });
  }

  cancelDispensation(dispensationId: string, cancellerId: string): void {
    if (!dispensationId) { return; }

    if (!cancellerId) {
      console.error('No cancelling dispenser id available.');
      return;
    }

    this.loading = true;

    // NOTE: service method is `cancel(id, cancelledByDispenserId)`
    this.dispensationService.cancel(dispensationId, cancellerId).subscribe({
      next: (res) => {
        (this.detail as any).dispensationStatus = res?.status ?? 'CANCELLED';
        (this.detail as any).dispensationUpdatedAt = res?.updatedAt ?? new Date().toISOString();

        if ((this as any).computeCanCancel) {
          (this as any).computeCanCancel();
        }

        this.loading = false;

        // 👇 Wait 5s and hard-reload the app
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to cancel dispensation', err);
      }
    });
  }


  getStatusLabel(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'Disponible';
      case 'DISPENSED': return 'Dispensada';
      case 'PENDING': return 'Pendiente';
      case 'CANCEL': return 'Cancelada';
      default: return status || '';
    }
  }

  close() { this.ref.close(); }
}
