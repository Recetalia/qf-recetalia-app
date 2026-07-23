import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { PrescriptionService } from '../../../../../services/prescription.service';
import { PrescriptionResponse } from '../../../../../model/response/prescription-response';
import { MedicsService } from '../../../../../services/medics.service';
import { MedicResponse } from '../../../../../model/response/medic-response';
import { DropdownFilterOptions } from 'primeng/dropdown';
// import { PatientService } from 
import { PatientResponse } from '../../../../../model/response/patient-response';
import { PatientService } from '../../../../../services/patient.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { PrescriptionsInfoComponent } from '../prescriptions-info/prescriptions-info.component';
// import { DateTimeFormatPipe } from 
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';


@Component({
  selector: 'app-prescription-list',
  templateUrl: './prescription-list.component.html',
  styleUrl: './prescription-list.component.scss',
  providers: [DialogService]
})
export class PrescriptionListComponent {

  page!: number;
  size!: number;
  isMobileFilterVisible: boolean = false;
  dateRangeFilter: String = 'Rango de fecha';
  exportExcel: string = 'Exportar xls';


  currentFirstRow: number = 0;
  prescriptions: PrescriptionResponse[] = [];
  medics: MedicResponse[] = [];
  patients: PatientResponse[] = [];
  filteredMedics: MedicResponse[] = [];
  filteredPatients: PatientResponse[] = [];
  totalRecords!: number;
  loading: boolean = true;
  medicalProviderId: string = '';
  filterValueMedic: string | undefined = '';
  filterValuePatien: string | undefined = '';
  selectedDoctor!: MedicResponse;
  selectedPatient!: PatientResponse;
  medicId: string = '';
  patientId: string = '';
  rangeDates: Date[] | undefined;
  downloadBy: string = '';
  pageable: any;
  numberOfElements!: number;
  statuses: any[] = [
    { name: '', key: 'ALL' },
    { name: 'Disponible', key: 'AVAILABLE' },
    { name: 'Dispensada', key: 'DISPENSED' },
    { name: 'Pendiente', key: 'PENDING' },
  ];
  selectedStatus: any = this.statuses[0]; // Inicialmente seleccionado "Todos"
  selectStatuses: string[] = this.statuses.map(status => status.key).filter(key => key !== 'ALL'); // Inicialmente todos los estados
  defaultMedic: MedicResponse = {
    id: 'all',
    name: 'Médico',
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
    birthdate: '',
    createdAt: '',
    updatedAt: '',
    cjp: '',
    status: '',
    deletedAt: undefined,
    especialityId: '',
    medicalProviderId: undefined,
    medicalProviderName: '',
    especialityName: ''
  };

  defaultPatient: PatientResponse = {
    id: 'all',
    name: 'Paciente',
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
  };

  constructor(
    private prescriptionService: PrescriptionService,
    private medicService: MedicsService,
    private patientService: PatientService,
    private zone: NgZone,
    private cd: ChangeDetectorRef,
    public dialogService: DialogService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) { }


  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobileFilterVisible = result.matches;
        if(this.isMobileFilterVisible) {
          this.dateRangeFilter = 'Fecha';
          this.exportExcel = 'xls';
        } else {
          this.dateRangeFilter = 'Rango de fecha';
          this.exportExcel = 'Exportar xls';
        }
      });
    this.size = 25; // default rows per page
    this.getPatientsByMedic();
    this.resetState();

    // Subscribe to the user observable to get the email

  }

  searchMedics(medicalProviderId: string, searchCriteria: string): void {
    this.medicService.search(medicalProviderId, searchCriteria).subscribe(
      (data: MedicResponse[]) => {
        this.zone.run(() => {
          this.medics = [this.defaultMedic, ...data];
          this.filteredMedics = this.medics;
        });
      },
      error => {
        console.error('Error fetching medics', error);
      }
    );
  }

  getPatientsByMedic(): void {
    this.patientService.getPatiensByMedic().subscribe(
      (data: PatientResponse[]) => {
        this.zone.run(() => {
          this.patients = [this.defaultPatient, ...data];
          this.filteredPatients = this.patients;
        });
      },
      error => {
        console.error('Error fetching patients', error);
      }
    );
  }

  loadPrescriptions(event: any): void {
    this.loading = true;

    this.page = event.first / event.rows;
    this.size = event.rows;

    console.log("this.page: " + this.page + "  --  " + "this.size: " + this.size);

    // Check if rangeDates is defined and has two dates
    const startDate = this.rangeDates && this.rangeDates.length === 2 ? this.formatDate(this.rangeDates[0]) : undefined;
    const endDate = this.rangeDates && this.rangeDates.length === 2 ? this.formatDate(this.rangeDates[1]) : undefined;

    var medicId = this.medicId
    if (this.medicId == '' || this.medicId == 'all') {
      medicId = '';
    }
    var patientId = this.patientId
    if (this.patientId == '' || this.patientId == 'all') {
      patientId = '';
    }

    this.prescriptionService.getPrescriptionsByFilters(this.selectStatuses, medicId, patientId, startDate, endDate, this.page, this.size)
      .subscribe(data => {
        this.prescriptions = data.content.map((prescription: any) => ({
          ...prescription,
          patientDocument: prescription.patientDocument ? prescription.patientDocument : null,
        }));
        this.totalRecords = data.totalElements;
        this.pageable = data.pageable;
        this.numberOfElements = data.numberOfElements;
        this.loading = false;
      }, error => {
        console.error('Error fetching prescriptions by patient', error);
        this.loading = false;
      });

  }

  updateSelectedStatuses(event: any): void {
    if (this.selectedStatus.key === 'ALL') {
      this.selectStatuses = this.statuses.map(status => status.key).filter(key => key !== 'ALL');
    } else {
      this.selectStatuses = [this.selectedStatus.key];
    }
    this.refreshTable();
  }

  onDoctorSelect(event: any): void {
    const selectedDoctor = event.value != null ? event.value : 'all';
    this.medicId = selectedDoctor.id !== 'all' ? selectedDoctor.id : '';
    //  this.selectedPatient = this.defaultPatient;
    //  this.filterValuePatien = '';
    //  this.rangeDates = [];
    this.prescriptions = [];
    //  this.patientId = 'all';
    this.currentFirstRow = 0;
    this.loading = false;
    this.loadPrescriptions({ first: 0, rows: this.size });
  }

  onPatienSelect(event: any): void {
    const selectedPatient = event.value != null ? event.value : 'all';
    this.patientId = selectedPatient.id !== 'all' ? selectedPatient.id : '';
    //  this.selectedDoctor = this.defaultMedic;
    //  this.filterValueMedic = '';
    //  this.rangeDates = [];
    this.prescriptions = [];
    //  this.medicId = 'all';
    this.currentFirstRow = 0;
    this.loading = false;
    this.loadPrescriptions({ first: 0, rows: this.size });
  }

  onDateSelect() {
    if (this.rangeDates && this.rangeDates.length === 2 && this.rangeDates[0] && this.rangeDates[1]) {
      const startDate = this.formatDate(this.rangeDates[0]);
      const endDate = this.formatDate(this.rangeDates[1]);
      this.prescriptions = [];
      this.currentFirstRow = 0;
      this.loading = false;
      this.loadPrescriptions({ first: 0, rows: this.size });
    }
  }

  resetFunctionRangeDates() {
    this.rangeDates = [];
    this.prescriptions = [];
    this.currentFirstRow = 0;
    this.loading = false;
    this.loadPrescriptions({ first: 0, rows: this.size });
  }

  resetState() {
    this.selectedStatus = this.statuses[0]; // Reset to 'ALL'
    this.selectStatuses = this.statuses.map(status => status.key).filter(key => key !== 'ALL');
    this.prescriptions = [];
    this.currentFirstRow = 0;
    this.loading = false;
    this.loadPrescriptions({ first: 0, rows: this.size });
  }

  onFilterMedic(event: any): void {
    const searchCriteria = event.filter;
    this.searchMedics(this.medicalProviderId, searchCriteria);
  }

  onFilterPatien(event: any): void {
    const searchCriteria = event.filter;
    this.getPatientsByMedic();
  }


  resetFunctionMedic(options: DropdownFilterOptions): void {
    if (options && options.reset) {
      options.reset();
      this.filterValueMedic = '';
    }
    this.currentFirstRow = 0;
    this.loading = false;
  }

  resetFunctionPatien(options: DropdownFilterOptions): void {
    if (options && options.reset) {
      options.reset();
      this.filterValuePatien = '';
    }
    this.currentFirstRow = 0;
    this.loading = false;
  }

  customFilterMedic(event: KeyboardEvent, options: DropdownFilterOptions): void {
    const target = event.target as HTMLInputElement;
    const filterValueMedic = target.value;
    if (options && options.filter) {
      options.filter(event);
    }
  }

  customFilterPatien(event: KeyboardEvent, options: DropdownFilterOptions): void {
    const target = event.target as HTMLInputElement;
    const filterValuePatien = target.value;

    if (options && options.filter) {
      options.filter(event);
    }
  }

  fetchPrescriptionsByDateRange(medicalProviderId: string, startDate: string, endDate: string, selectStatuses: string[], page: number, size: number): void {
    this.prescriptionService.getPrescriptionsByMedicalProviderAndDateRange(medicalProviderId, startDate, endDate, selectStatuses, page, size)
      .subscribe(
        data => {
          this.downloadBy = "DATE_RANGE";
          this.prescriptions = data.content;
          this.totalRecords = data.totalElements;
          this.loading = false;
        },
        error => {
          console.error('Error fetching prescriptions', error);
          this.loading = false;
        }
      );
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
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

  refreshTable(): void {
    this.currentFirstRow = 0;
    this.loading = false;
    this.loadPrescriptions({ first: 0, rows: this.size });
  }

  downloadExcel(): void {
    // Check if rangeDates is defined and has two dates
    const startDate = this.rangeDates && this.rangeDates.length === 2 ? this.formatDate(this.rangeDates[0]) : undefined;
    const endDate = this.rangeDates && this.rangeDates.length === 2 ? this.formatDate(this.rangeDates[1]) : undefined;

    var medicId = this.medicId
    if (this.medicId == '' || this.medicId == 'all') {
      medicId = '';
    }
    var patientId = this.patientId
    if (this.patientId == '' || this.patientId == 'all') {
      patientId = '';
    }

    this.prescriptionService
      .downloadExcel(this.selectStatuses, medicId, patientId, startDate, endDate)
      .subscribe((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prescriptions.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  openPrescription(prescription: any) {
    console.log(prescription);

    const ref = this.dialogService.open(PrescriptionsInfoComponent, {
      width: '97%',
      style: { 'max-width': '980px', 'width': '70%' },
      contentStyle: { 'overflow': 'auto' },
      data: {
        // Pass data if needed
        prescription: prescription
      }
    });

  }
}
