// src/app/pages/application/home/profile/profile.component.ts
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as CryptoJS from 'crypto-js';

import { AuthService } from '../../../../services/auth.service';
import { PharmacyService } from '../../../../services/pharmacy.service';
import { RegionService } from '../../../../services/region.service';
import { LocalityService } from '../../../../services/localities.service';

import { RegionResponse } from '../../../../model/response/region-response';
import { LocalityResponse } from '../../../../model/response/locality-response';
import { PharmacyResponse } from '../../../../model/response/pharmacy-response';
import { PharmacyRequest } from '../../../../model/request/pharmacy-request';

import { matchFieldsValidator } from '../../../../shared/validators/match-fields.validator';
import { documentValidator } from '../../../../shared/validators/document-validator';
import { ValidateDocumentPipe } from '../../../../shared/pipes/validate-document.pipe';
import { FranchiseResponse } from '../../../../model/response/franchise-response';
import { FranchiseService } from '../../../../services/franchise.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  // Form backing field
  private _form!: FormGroup;
  // Expose the same name your template uses:
  get registerForm(): FormGroup { return this._form; }
  // Also expose as profileForm if you use it elsewhere
  get profileForm(): FormGroup { return this._form; }

  currentPharmacy!: PharmacyResponse;
  regions: RegionResponse[] = [];
  localities: LocalityResponse[] = [];

  visibleRegister = false;
  messageRegister = '';
  franchises: FranchiseResponse[] = [];
  selectedRegion: RegionResponse | null = null;
  selectedLocality: LocalityResponse | null = null;
  isEditMode: boolean = false;
  addressLocalityId: string | undefined = '';

  constructor(
    private eRef: ElementRef,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private pharmacyService: PharmacyService,
    private regionService: RegionService,
    private localityService: LocalityService,
    private franchiseService: FranchiseService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadRegions();
    this.loadfranchises();
  }

  private initForm(): void {
    this._form = this.fb.group({
      // Pharmacy (read-only)
      name: [{ value: '', disabled: true }, Validators.required],
      businessName: [{ value: '', disabled: true }, Validators.required],
      rut: [{ value: '', disabled: true }, Validators.required],
      franchise: [{ value: null, disabled: true }],

      // Email + confirmation (read-only)
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      emailConfirm: [{ value: '', disabled: true }],

      // Passwords (read-only)
      password: [{ value: '', disabled: true }, [Validators.minLength(8)]],
      passwordConfirm: [{ value: '', disabled: true }, [Validators.minLength(8)]],

      // Phone (read-only)
      phone: [{ value: '', disabled: true }, Validators.required],

      // Address (editable)
      region: [null],           // ← ENABLED
      locality: [{ value: null }], // ← ENABLED
      addressStreet: [''],             // ← ENABLED
      addressNumber: [''],             // ← ENABLED
      addressComments: [''],             // ← ENABLED

      // Manager (read-only)
      managerName: [{ value: '', disabled: true }, Validators.required],
      managerLastname: [{ value: '', disabled: true }, Validators.required],
      managerCJP: [{ value: '', disabled: true }, Validators.required],
      managerDocumentType: [{ value: 'UY', disabled: true }, Validators.required],
      managerDocumentNumber: [{ value: '', disabled: true }, Validators.required]
    }, {
      validators: [
        // Will be effectively skipped for disabled controls, harmless to keep:
        documentValidator(new ValidateDocumentPipe())
      ]
    });
  }


  /** Load regions first, then pharmacy so we can preselect region/locality objects. */
  private loadRegions(): void {
    this.regionService.getAllRegions().subscribe({
      next: (data) => {
        this.regions = data;
        this.loadPharmacyProfile();
      },
      error: (err) => {
        console.error('Error loading regions:', err);
        this.loadPharmacyProfile();
      }
    });
  }

  loadfranchises(): void {
    this.franchiseService.getAllFranchises().subscribe(
      (data: FranchiseResponse[]) => {
        this.franchises = data;
      },
      (error: any) => {
        console.error('Error loading franchise:', error);
      }
    );
  }


  /** Get pharmacyId from AuthService, then fetch full Pharmacy. */
  private loadPharmacyProfile(): void {
    this.authService.getCurrentUser().subscribe({
      next: (u) => {
        if (!u?.pharmacyId) return;
        this.pharmacyService.getById(u.pharmacyId).subscribe({
          next: (ph) => {
            this.currentPharmacy = ph;
            this.patchFormWithPharmacy(ph);
          },
          error: (err) => console.error('Failed to load pharmacy profile:', err)
        });
      },
      error: (err) => console.error('Failed to get current user:', err)
    });
  }

  private patchFormWithPharmacy(ph: PharmacyResponse): void {
    // Preselect region (addressCountryId)
    const selectedRegion = this.regions.find(r => r.id === ph.addressCountryId) || null;

    // Preselect franchise if already loaded
    const selectedFranchise =
      this.franchises?.find(f => f.id === ph.franchiseId) || null;

    this._form.patchValue({
      // Core
      name: ph.name || '',
      businessName: ph.businessName || '',
      rut: ph.rut || '',

      // Email
      email: ph.email || '',
      emailConfirm: ph.email || '',

      // Phone (angular-phone-number-input accepts string)
      phone: ph.phone?.international?.replace(/\s+/g, '') || '',

      // Address (IDs → objects)
      region: selectedRegion,
      addressStreet: ph.addressStreet || '',
      addressNumber: ph.addressNumber || '',
      addressComments: ph.addressComments || '',

      // Manager
      managerName: ph.managerName || '',
      managerLastname: ph.managerLastname || '',
      managerCJP: ph.managerCJP || '',
      managerDocumentType: ph.managerDocument?.type || 'UY',
      managerDocumentNumber: ph.managerDocument?.number || '',

      // Franchise (ID → object)
      franchise: selectedFranchise
    });

    // Load & preselect locality by id once we have the region
    this.onRegionChange(ph.addressLocalityId);
  }


  /** When region changes via UI */
  onRegionChange(preselectLocalityId?: string): void {
    const region = this._form.get('region')?.value as RegionResponse | null;
    if (region?.id) {
      this.loadLocalitiesForRegion(region.id, preselectLocalityId);
    } else {
      this.localities = [];
      this._form.patchValue({ locality: '' });
    }
  }

  /** Fetch localities and (optionally) preselect a given localityId */
  private loadLocalitiesForRegion(regionId: string, preselectLocalityId?: string): void {
    this.localityService.getLocalitiesByRegionId(regionId).subscribe({
      next: (data: LocalityResponse[]) => {
        this.localities = data;
        if (preselectLocalityId) {
          const sel = this.localities.find(l => l.id === preselectLocalityId) || null;
          this._form.patchValue({ locality: sel });
        }
      },
      error: (err) => console.error('Error loading localities:', err)
    });
  }

  /** Submit updated pharmacy profile */
  onSubmit(): void {
    if (!this._form.valid || !this.currentPharmacy) {
      console.log('Form invalid or pharmacy not loaded');
      return;
    }

    const form = this._form.getRawValue();

    // Optional password encryption if user entered a new one
    const dynamicInfo = this.generateDynamicInfo();
    let encryptedPassword: string | undefined;
    if (form.password && String(form.password).trim().length > 0) {
      encryptedPassword = this.encryptPassword(form.password, dynamicInfo);
    }

    // Normalize phone
    const parsed = parsePhoneNumberFromString(form.phone);
    if (!parsed) {
      console.error('Invalid phone number');
      return;
    }
    const phone = {
      countryCode: parsed.country || '',
      national: parsed.nationalNumber,
      international: parsed.formatInternational(),
      type: parsed.getType() || '',
      validated: true
    };

    // Build request payload (NO id/deletedAt here; path param carries id)
    // Build request payload (path param carries the id)
    const payload: Partial<PharmacyRequest> = {
      // Core pharmacy
      name: form.name,
      businessName: form.businessName,
      rut: form.rut,

      // Franchise (optional)
      ...(form.franchise?.id ? { franchiseId: form.franchise.id } : {}),

      // Contact
      email: form.email,
      phone,

      // Address
      addressCountryId: form.region?.id || '',
      addressLocalityId: form.locality?.id || '',
      addressStreet: form.addressStreet || '',
      addressNumber: form.addressNumber || '',
      addressComments: form.addressComments || '',

      // Manager
      managerName: form.managerName,
      managerLastname: form.managerLastname,
      managerCJP: form.managerCJP,
      managerDocument: {
        number: form.managerDocumentNumber,
        type: form.managerDocumentType
      },


      // Status: keep what server already has
      status: this.currentPharmacy.status,

      // Only include password when user provided a new one
      password: ""
    };

    this.pharmacyService.update(this.currentPharmacy.id, payload as PharmacyRequest).subscribe({
      next: (resp) => {
        this.messageRegister = 'Perfil de farmacia actualizado correctamente';
        this.showDialog();
        this.patchFormWithPharmacy(resp);
        this.router.navigate(['']);
      },
      error: (err) => {
        this.messageRegister = 'Error al actualizar el perfil de la farmacia';
        console.error(this.messageRegister, err);
        this.showDialog();
      }
    });
  }

  showDialog(): void {
    this.visibleRegister = true;
  }

  redirectToAdd(): void {
    this.router.navigate(['']);
  }

  // --- Helpers: password encryption (same as your medic flow) ---
  private generateDynamicInfo(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      })
      .slice(0, 10);
  }

  private encryptPassword(password: string, dynamicInfo: string): string {
    const commonKey = 'ahjsdfhjbqer56243';
    const finalKey = this.padOrTruncateKey(commonKey + dynamicInfo);
    return CryptoJS.AES.encrypt(password, CryptoJS.enc.Utf8.parse(finalKey), {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
  }

  private padOrTruncateKey(key: string): string {
    const maxLength = 32;
    return key.length > maxLength ? key.slice(0, maxLength) : key.padEnd(maxLength, '0');
  }
}
