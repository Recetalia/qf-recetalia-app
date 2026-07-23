import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { PrescriptionService } from '../../../../../services/prescription.service';
import { PatientService } from '../../../../../services/patient.service';
import { PatientResponse } from '../../../../../model/response/patient-response';
import { PatientAddComponent } from '../../patient/patient-add/patient-add.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MedicineListComponent } from '../../medicine/medicine-list/medicine-list.component';
import { MedicResponse } from '../../../../../model/response/medic-response';
import { PrescriptionRequest } from '../../../../../model/request/prescription-request';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prescription-add',
  templateUrl: './prescription-add.component.html',
  styleUrl: './prescription-add.component.scss',
  providers: [DialogService]
})
export class PrescriptionAddComponent {

  cities = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
  ];
  selectedCity: any;
  patients: PatientResponse[] = [];
  filteredPatients: PatientResponse[] = [];
  selectedPatient: PatientResponse | null = null;
  selectedMedicines: MedicResponse[] = [];
  prescriptionsRequest: PrescriptionRequest[] = [];
  isCollapsed: boolean = false; // Initial state
  defaultPatient: PatientResponse = {
    id: 'add',
    name: '+ Crear paciente nuevo',
    lastname: '',
    email: '',
    phone: {
      countryCode: '',
      national: '',
      international: '',
      type: '',
      validated: true,
    },
    document: {
      number: '',
      type: '',
    },
    addressCountryId: '',
    addressLocalityId: '',
    addressStreet: '',
    addressNumber: '',
    addressComments: '',
    user: '',
    password: '',
    birthdate: '',
    createdAt: '',
    updatedAt: '',
    sex: '',
    avatarId: '',
    displayLabel: '+ Crear paciente nuevo' // Add this property
  };

  isPatientSelected: boolean = false; // Flag to toggle cards


  constructor(
    private prescriptionService: PrescriptionService,
    private patientService: PatientService,
    private zone: NgZone,
    private cd: ChangeDetectorRef,
    public dialogService: DialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.filteredPatients = [this.defaultPatient];

  }

  filterPatients(event: any): void {
    const query = event.filter;

    if (query.length > 2) {
      this.filteredPatients = [];
      this.patientService.searchPatients(query, query, query).subscribe(
        (data: PatientResponse[]) => {
          this.zone.run(() => {
            // Transform patients to include the display label
            this.filteredPatients = [this.defaultPatient, ...data.map(patient => ({
              ...patient,
              displayLabel: `${patient.name.trim()} ${patient.lastname.trim()} ${patient.document.number.trim()}`
            }))];
          });
        },
        error => {
          console.error('Error fetching patients', error);
        },
      );
    }
  }

  onPatientSelect(event: any): void {
    console.log(this.selectedPatient)
    if (this.selectedPatient?.id === 'add') {
      this.openAddPatientModal();
    } else {
      this.isPatientSelected = true; // Show patient details card
      this.formatSelectedPatient(); // Format patient data
    }
  }

  editPatient(selectedPatientId: any): void {
    this.openAddPatientModal(selectedPatientId); // Open the modal in edit mode
  }

  openAddPatientModal(selectedPatientId?: string): void {
    const ref = this.dialogService.open(PatientAddComponent, {
      header: selectedPatientId ? 'Editar paciente' : 'Crear paciente',
      width: '70%',
      style: { 'max-width': '580px', 'min-width': '24rem', 'width': '70%' },
      contentStyle: { 'overflow': 'auto' },
      data: {
        selectedPatientId: selectedPatientId || null // Pass the ID if editing
      }
    });
  
    ref.onClose.subscribe((newPatient: PatientResponse) => {
      if (newPatient) {
        if (!selectedPatientId) {
          this.patients = [this.defaultPatient, ...this.patients];
        }
        this.selectedPatient = newPatient;
        this.isPatientSelected = true; // Show patient details card
        this.formatSelectedPatient(); // Format patient data
      }
    });
  }
  

  openGetMedecine(): void {
    const ref = this.dialogService.open(MedicineListComponent, {
      header: 'Buscar medicamento',
      width: '70%',
      style: { 'max-width': '580px', 'min-width': '24rem', 'width': '70%' },
      contentStyle: { 'overflow': 'auto' },
      baseZIndex: 10000, // Ensure modal displays on top
      data: {
        // Pass data if needed
        searchQuery: this.selectedPatient?.name || ''
      }
    });

    ref.onClose.subscribe((prescriptionRequest: PrescriptionRequest) => {
      if (prescriptionRequest) {
        this.prescriptionsRequest.push(prescriptionRequest);
      }
    });

  }

  removePrescription(index: number): void {
    this.prescriptionsRequest.splice(index, 1);
  }

  submitPrescription() {
    const code = this.generateDynamicInfo();
    var count = 0;
    this.prescriptionsRequest.forEach(item => {
      if (this.selectedPatient) {
        item.patientId = this.selectedPatient.id;
        item.code = code.toUpperCase() + '-' + String.fromCharCode(65 + count);
        item.status = 'PENDING';
        if(item.durationUnit === 'Meses') {
          item.isCronic = true;
        }        
        this.prescriptionService.create(item).subscribe(
          (response) => {
            console.log(response);
            this.router.navigate(['/prescriptions']);
          },
          (error) => {
            console.error('this.messageRegister', error);
          }
        );
        count++;
      }
      console.log(item);
    });
    

  }

  // Function to generate the dynamicInfo (first 6 characters of a GUID)
  generateDynamicInfo(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).slice(0, 6); // Return first 10 characters
  }

  formatSelectedPatient() {
    if (this.selectedPatient) {
      // Format phone
      this.selectedPatient.phone = this.selectedPatient.phone;

      // Format birthdate
      const birthdate = new Date(this.selectedPatient.birthdate);
      const formattedDate = birthdate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const age = new Date().getFullYear() - birthdate.getFullYear();
      this.selectedPatient.birthdate = `${formattedDate} (${age} años)`;
    }
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  deselectPatient(): void {
    this.selectedPatient = null;
    this.isPatientSelected = false;
    this.prescriptionsRequest = [];
    this.filteredPatients = [this.defaultPatient]; // Restore dropdown
  }

}
