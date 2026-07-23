import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { matchFieldsValidator } from '../../../shared/validators/match-fields.validator';
import { EspecialitiesService } from '../../../services/especialities.service';
import { PharmacyRequest } from '../../../model/request/pharmacy-request';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as CryptoJS from 'crypto-js';
import { documentValidator } from '../../../shared/validators/document-validator';
import { ValidateDocumentPipe } from '../../../shared/pipes/validate-document.pipe';
import { RegionResponse } from '../../../model/response/region-response';
import { LocalityResponse } from '../../../model/response/locality-response';
import { RegionService } from '../../../services/region.service';
import { LocalityService } from '../../../services/localities.service';
import { PharmacyService } from '../../../services/pharmacy.service';
import { FranchiseResponse } from '../../../model/response/franchise-response';
import { FranchiseService } from '../../../services/franchise.service';




@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  // list

  visibleRegister: boolean = false;
  messageRegister: string = '';

  franchises: FranchiseResponse[] = [];
  regions: RegionResponse[] = [];
  localities: LocalityResponse[] = [];
  selectedRegion: RegionResponse | null = null;
  selectedLocality: LocalityResponse | null = null;
  isEditMode: boolean = false;


  constructor(private fb: FormBuilder,
    private especialitiesService: EspecialitiesService,
    private pharmacyService: PharmacyService,
    private regionService: RegionService,
    private localityService: LocalityService,
    private franchiseService: FranchiseService
  ) { }

  ngOnInit(): void {
    this.loadRegions();
    this.loadfranchises();
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      businessName: ['', Validators.required],
      rut: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      emailConfirm: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
      phone: ['', Validators.required],
      managerName: ['', Validators.required],
      managerLastname: ['', Validators.required],
      managerCJP: ['', Validators.required],
      managerDocumentNumber: ['', Validators.required],
      managerDocumentType: ['UY', Validators.required],
      franchise: [null],
      region: [null],
      locality: [null],
      addressStreet: [''],
      addressNumber: [''],
      addressComments: [''],
      terms: [false, Validators.requiredTrue]
    }, {
      validators: [
        matchFieldsValidator('email', 'emailConfirm'),
        matchFieldsValidator('password', 'passwordConfirm'),
        documentValidator(new ValidateDocumentPipe())
      ]
    });
    

    // Clear emailConfirm when email changes
    this.registerForm.get('email')?.valueChanges.subscribe(() => {
      this.registerForm.get('emailConfirm')?.reset();
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const dynamicInfo = this.generateDynamicInfo();  // Generate dynamicInfo
      const encryptedPassword = this.encryptPassword(formValue.password, dynamicInfo);

      // The formValue.phone will have the phone data structured by the angular-phone-number-input component
      const phoneData = formValue.phone; // This will already have countryCode, national, etc.

      const parsedPhone = parsePhoneNumberFromString(phoneData);
      if (parsedPhone) {
        const phone = {
          countryCode: parsedPhone?.country || '',
          national: parsedPhone?.nationalNumber || '',
          international: parsedPhone?.formatInternational() || '',
          type: 'mobile',
          validated: true// e.g., 'MOBILE' (empty string if not detectable)
        };

        debugger;

        // Prepare the pharmacy object for registration
        const newPharmacy: PharmacyRequest = {
          name: this.registerForm.value.name,
          businessName: this.registerForm.value.businessName,
          rut: this.registerForm.value.rut,
          email: this.registerForm.value.email,
          password: encryptedPassword,
          phone: phone,
          managerName: this.registerForm.value.managerName,
          managerLastname: this.registerForm.value.managerLastname,
          managerCJP: this.registerForm.value.managerCJP,
          managerDocument: {
            number: this.registerForm.value.managerDocumentNumber,
            type: this.registerForm.value.managerDocumentType
          },
          addressCountryId: this.registerForm.value.region?.id,
          addressLocalityId: this.registerForm.value.locality?.id,
          addressStreet: this.registerForm.value.addressStreet,
          addressNumber: this.registerForm.value.addressNumber,
          addressComments: this.registerForm.value.addressComments,
          status: 'INACTIVE',
          info: dynamicInfo,
          franchiseId: this.registerForm.value.franchise?.id,
        };

        // Call the pharmacyService to create a new medic
        this.pharmacyService.create(newPharmacy).subscribe(
          (response) => {
            this.messageRegister = 'Farmacia creada con éxito.';
            
            this.showDialog()
            this.registerForm.reset();
            // Optionally navigate or display a success message
          },
          (error) => {
            this.messageRegister = error?.message || 'No se pudo completar el registro. Intentá nuevamente.';
            console.error('this.messageRegister', error);
            this.showDialog();
          }
        );
      } else {
        console.error('Invalid phone number');
      }

    } else {
      
    }
  }

  patchValue() {
    //const selectedPatientId = this.config.data?.selectedPatientId;
  }

  showDialog() {
    this.visibleRegister = true;
    messagesibleReg: String;
  }


  // Function to generate the dynamicInfo (first 10 characters of a GUID)
  generateDynamicInfo(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).slice(0, 10); // Return first 10 characters
  }

  encryptPassword(password: string, dynamicInfo: string): string {

    const commonKey = 'ahjsdfhjbqer56243';  // Your common decryption key
    let finalKey = commonKey + dynamicInfo;
    // Ensure finalKey is exactly 32 bytes long
    finalKey = this.padOrTruncateKey(finalKey);

    // Encrypt the password using AES
    const encrypted = CryptoJS.AES.encrypt(password, CryptoJS.enc.Utf8.parse(finalKey), {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }).toString();

    return encrypted;
  }

  // Function to ensure the key is 32 bytes (padding or truncating if needed)
  padOrTruncateKey(key: string): string {
    const maxLength = 32; // AES key must be 16, 24, or 32 bytes
    if (key.length > maxLength) {
      return key.slice(0, maxLength);  // Truncate if too long
    } else {
      return key.padEnd(maxLength, '0');  // Pad with '0' if too short
    }
  }

  // Load all regions
  loadRegions(): void {
    this.regionService.getAllRegions().subscribe(
      (data) => {
        this.regions = data;
        
        this.patchValue();
      },
      (error) => {
        console.error('Error loading regions:', error);
      }
    );
  }

  loadfranchises(): void {
    this.franchiseService.getAllFranchises().subscribe(
      (data: FranchiseResponse[]) => {
        this.franchises = data;
        
        this.patchValue();
      },
      (error: any) => {
        console.error('Error loading franchise:', error);
      }
    );
  }

  // Load localities for the selected region
  onRegionChange(): void {
    const selectedRegion = this.registerForm.get('region')?.value;
    

    if (selectedRegion) {
      this.localityService.getLocalitiesByRegionId(selectedRegion.id).subscribe(
        (data) => {
          this.localities = data;
          
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
