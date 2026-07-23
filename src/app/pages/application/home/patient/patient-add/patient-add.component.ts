import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { PatientResponse } from '../../../../../model/response/patient-response';
import { PatientRequest } from '../../../../../model/request/patient-request';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import { emailExistsValidator } from '../../../../../shared/validators/email-exists-validator';
import { DialogModule } from 'primeng/dialog';
import { matchFieldsValidator } from '../../../../../shared/validators/match-fields.validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { PatientService } from '../../../../../services/patient.service';
import { RegionResponse } from '../../../../../model/response/region-response';
import { LocalityResponse } from '../../../../../model/response/locality-response';
import { LocalityService } from '../../../../../services/localities.service';
import { RegionService } from '../../../../../services/region.service';
import { response } from 'express';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { documentValidator } from '../../../../../shared/validators/document-validator';
import { ValidateDocumentPipe } from '../../../../../shared/pipes/validate-document.pipe';


@Component({
  selector: 'app-patient-add',
  templateUrl: './patient-add.component.html',
  styleUrls: ['./patient-add.component.scss']
})
export class PatientAddComponent implements OnInit {
  registerForm!: FormGroup;
  validPatient!: PatientResponse;
  actionFrom: String = 'Crear Paciente';
  patient: PatientRequest = {
    name: '',
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
    sex: '',
    avatarId: '',
    documentType: '',
  };

  departments: string[] = [
    'Artigas',
    'Canelones',
    'Cerro Largo',
    'Colonia',
    'Durazno',
    'Flores',
    'Florida',
    'Lavalleja',
    'Maldonado',
    'Montevideo',
    'Paysandú',
    'Río Negro',
    'Rivera',
    'Rocha',
    'Salto',
    'San José',
    'Soriano',
    'Tacuarembó',
    'Treinta y Tres'
  ];

  regions: RegionResponse[] = [];
  localities: LocalityResponse[] = [];
  selectedRegion: RegionResponse | null = null;
  selectedLocality: LocalityResponse | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private ref: DynamicDialogRef,
    private regionService: RegionService,
    private localityService: LocalityService,
    public config: DynamicDialogConfig // Add this to access input data

  ) { }


  ngOnInit(): void {
    this.loadRegions();
    this.isEditMode = !!this.config.data?.selectedPatientId; // Edit mode if selectedPatientId exists
    if (this.isEditMode) {
      this.actionFrom = 'Editar Paciente';
    }
    this.initializeForm();
  }

  initializeForm(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      idNumber: [
        { value: '', disabled: this.isEditMode }, // Disable in edit mode
        this.isEditMode ? [] : [Validators.required] // Apply validator only in create mode
      ],
      idType: [
        { value: 'UY', disabled: this.isEditMode }, // Disable in edit mode
        this.isEditMode ? [] : [Validators.required] // Apply validator only in create mode
      ],
      phone: ['', Validators.required],
      email: [
        '',
        [Validators.email],
      ],
      sex: [''],
      birthDate: [''],
      region: [''],
      locality: [''],
      addres: [''],
      numberAddres: [''],
      infoAditional: [''],
      regions: [''],
      localities: ['']

    }, {
      validator: [
        matchFieldsValidator('email', 'emailConfirm'),
        this.isEditMode ? null : documentValidator(new ValidateDocumentPipe()) // Apply only in create mode
      ].filter(Boolean) // Filter out null validators
    });

    // Add value changes subscription only in create mode
    if (!this.isEditMode) {
      this.registerForm.get('idNumber')?.valueChanges.subscribe(() => this.validatePatientExists());
      this.registerForm.get('idType')?.valueChanges.subscribe(() => this.validatePatientExists());
    }
  }


  patchValue() {
    const selectedPatientId = this.config.data?.selectedPatientId;

    if (selectedPatientId) {
      this.patientService.getById(selectedPatientId).subscribe(
        (patient: PatientResponse) => {
          console.log('Get Patient: ', patient);
          // Find the matching region object by id
          const selectedRegion = this.regions.find(region => region.id === patient.addressCountryId);
          console.log(selectedRegion)
          // Format phone for the input component
          const phone = patient.phone?.international.replace(/\s+/g, '') || '';

          // Parse birthdate to a JavaScript Date object
          const birthdate = patient.birthdate
            ? new Date(patient.birthdate)
            : null;

          // Patch form values
          this.registerForm.patchValue({
            name: patient.name,
            lastname: patient.lastname,
            idNumber: patient.document.number.replace(/\s+/g, ''),
            idType: patient.document.type,
            phone: phone.replace(/\s+/g, ''),
            email: patient.email,
            sex: patient.sex,
            birthDate: birthdate,
            region: selectedRegion, // Patch the full region object
            locality: null, // Clear locality for now; it will be patched later
            addres: patient.addressStreet,
            numberAddres: patient.addressNumber,
            infoAditional: patient.addressComments,
          });

          // After region is patched, load localities
          if (selectedRegion) {
            this.loadLocalitiesForRegion(selectedRegion.id, patient.addressLocalityId);
          }
        },
        (error) => {
          console.error('Error fetching patient:', error);
          this.registerForm.setErrors(null); // Clear form-level errors
        }
      );
    }
  }

  loadLocalitiesForRegion(regionId: string, localityId?: string): void {
    this.localityService.getLocalitiesByRegionId(regionId).subscribe(
      (data: LocalityResponse[]) => {
        this.localities = data;

        console.log('Localities loaded:', this.localities);

        // If a localityId is provided, find the corresponding locality and patch it
        if (localityId) {
          const selectedLocality = this.localities.find(locality => locality.id === localityId);
          this.registerForm.patchValue({
            locality: selectedLocality // Patch the full locality object
          });
        }
      },
      (error) => {
        console.error('Error loading localities:', error);
      }
    );
  }

  onCancel(): void {
    this.ref.close(null);
  }

  validatePatientExists(): void {
    if (this.isEditMode) return; // Skip in edit mode
    const documentNumber = this.registerForm.get('idNumber')?.value?.trim();
    const documentType = this.registerForm.get('idType')?.value;
    if (documentNumber && documentType) {
      this.patientService.getByDocumentNumberAndType(documentNumber, documentType).subscribe(
        (response) => {
          if (response) {
            this.validPatient = response;
            this.registerForm.setErrors({ patientExists: true }); // Mark the form as invalid
          }
        },
        (error) => {
          console.log('Patient does not exist:', error); // No action needed; patient does not exist
          this.registerForm.setErrors(null); // Clear form-level errors
        }
      );
    }
  }

  selectUser() {
    this.ref.close(this.validPatient);
  }

  onSubmit(): void {
    this.validatePatientExists();
    if (this.registerForm.valid) {
      const selectedRegion = this.registerForm.get('region')?.value;
      const selectedLocality = this.registerForm.get('locality')?.value;

      const formValue = this.registerForm.value;
      // The formValue.phone will have the phone data structured by the angular-phone-number-input component
      const phoneData = formValue.phone; // This will already have countryCode, national, etc.
      console.log("phoneData: " + phoneData)

      const parsedPhone = parsePhoneNumberFromString(phoneData);
      if (parsedPhone) {
        const phone = {
          countryCode: parsedPhone.country, // e.g., 'CO'
          national: parsedPhone.nationalNumber, // e.g., '3183692532'
          international: parsedPhone.formatInternational(), // e.g., '+57 318 369 2532'
          type: parsedPhone.getType() || '' // e.g., 'MOBILE' (empty string if not detectable)
        };

        console.log("phoneData: ", phone);
        const patientData: PatientRequest = {
          name: this.registerForm.value.name,
          lastname: this.registerForm.value.lastname,

          phone: {
            countryCode: phone.countryCode ? phone.countryCode : '',
            national: phone.national,
            international: phone.international,
            type: "mobile",
            validated: true
          },
          document: {
            number: this.registerForm.value.idNumber,
            type: this.registerForm.value.idType
          },

          // Optional fields — use undefined if not present
          email: this.registerForm.value.email || undefined,
          addressCountryId: selectedRegion?.id || undefined,
          addressLocalityId: selectedLocality?.id || undefined,
          addressStreet: this.registerForm.value.addres || undefined,
          addressNumber: this.registerForm.value.numberAddres || undefined,
          addressComments: this.registerForm.value.infoAditional || undefined,
          user: this.registerForm.value.email || undefined,
          password: 'hashedPassword123',
          birthdate: this.registerForm.value.birthDate || undefined,
          sex: this.registerForm.value.sex || undefined,
          avatarId: undefined,
          documentType: this.registerForm.value.idType,
        };

        if(this.isEditMode) {
          this.patientService.update(this.config.data?.selectedPatientId, patientData).subscribe(
            (response) => {
              console.log('Patient update successfully:', response);
              this.ref.close(response);
              // Handle successful update, maybe close dialog
            },
            (error) => {
              console.error('Error update patient:', error);
            }
          );

        } else {
          this.patientService.create(patientData).subscribe(
            (response) => {
              console.log('Patient created successfully:', response);
              this.ref.close(response);
              // Handle successful creation, maybe close dialog
            },
            (error) => {
              console.error('Error creating patient:', error);
            }
          );
        }
        
      } else {
        console.error('Form is invalid');
      }
    }

  }

  // Load all regions
  loadRegions(): void {
    this.regionService.getAllRegions().subscribe(
      (data) => {
        this.regions = data;
        console.log('this.regions: ', this.regions);
        this.patchValue();
      },
      (error) => {
        console.error('Error loading regions:', error);
      }
    );
  }

  // Load localities for the selected region
  onRegionChange(): void {
    const selectedRegion = this.registerForm.get('region')?.value;
    console.log('Selected Region:', selectedRegion);

    if (selectedRegion) {
      this.localityService.getLocalitiesByRegionId(selectedRegion.id).subscribe(
        (data) => {
          this.localities = data;
          console.log('Localities loaded:', this.localities);
        },
        (error) => {
          console.error('Error loading localities:', error);
        }
      );
    } else {
      this.localities = [];
    }
  }

}
