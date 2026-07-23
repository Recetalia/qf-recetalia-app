import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { PharmacyDispensersService } from '../../../../../services/pharmacy-dispensers.service';
import { PharmacyDispenserRequest } from '../../../../../model/request/pharmacy-dispenser-request';
import { PharmacyDispenserResponse } from '../../../../../model/response/pharmacy-dispenser-response';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-pharmacy-dispenser-add',
  templateUrl: './pharmacy-dispenser-add.component.html',
  styleUrls: ['./pharmacy-dispenser-add.component.scss']
})
export class PharmacyDispenserAddComponent implements OnInit {
  dispenserForm!: FormGroup;
  validDispenser!: PharmacyDispenserResponse;
  actionFrom: string = 'Crear Dispensador';
  pharmacyId: string | undefined; 
  isEditMode: boolean = false;
  

  constructor(
    private fb: FormBuilder,
    private service: PharmacyDispensersService,
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
     this.authService.getCurrentUser().subscribe({
      next: (data => {
        this.pharmacyId= data?.pharmacyId;
      })
    });
    this.isEditMode = !!this.config.data?.selectedDispenserId;
    this.actionFrom = this.isEditMode ? 'Editar Dispensador' : 'Crear Dispensador';
    this.initializeForm();
    if (this.isEditMode) {
      this.patchFormValues();
    }
    
  }

  initializeForm(): void {
    this.dispenserForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      documentNumber: ['', Validators.required],
      documentType: ['OTHER', Validators.required],
      pharmacyId: []
    });
  }

  patchFormValues(): void {
    const dispenserId = this.config.data?.selectedDispenserId;

    if(dispenserId) {
      this.service.getById(dispenserId).subscribe(
        (dispenser: PharmacyDispenserResponse) => {
          this.dispenserForm.patchValue({
            name: dispenser.name,
            lastname: dispenser.lastname,
            documentNumber: dispenser.document.number,
            documentType: dispenser.document.type,
            pharmacyId: this.pharmacyId
          });

       },
        (error) => {
          console.error('Error fetching patient:', error);
          this.dispenserForm.setErrors(null); // Clear form-level errors
        }
      );
    }
  }

  onSubmit(): void {
    if (this.dispenserForm.invalid) return;

    const form = this.dispenserForm.value;
    const request: PharmacyDispenserRequest = {
      name: form.name,
      lastname: form.lastname,
      document: {
        number: form.documentNumber,
        type: form.documentType
      },
      pharmacyId: this.pharmacyId
    };

    if (this.isEditMode && this.config.data?.selectedDispenserId) {
      this.service.update(this.config.data.selectedDispenserId, request).subscribe(
        response => this.ref.close(response),
        error => console.error('Error updating dispenser', error)
      );
    } else {
      this.service.create(request).subscribe(
        response => this.ref.close(response),
        error => console.error('Error creating dispenser', error)
      );
    }
  }

  onCancel(): void {
    this.ref.close(null);
  }
}
