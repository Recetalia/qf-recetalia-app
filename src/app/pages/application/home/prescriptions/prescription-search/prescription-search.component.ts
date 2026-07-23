import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { PrescriptionService } from '../../../../../services/prescription.service';
import { PrescriptionResponse } from '../../../../../model/response/prescription-response';
import { Router } from '@angular/router';
import { Stepper } from 'primeng/stepper';
import { AmppService } from '../../../../../services/ampp.service';
import { DialogService } from 'primeng/dynamicdialog';
import { MedicineListComponent } from '../../medicine/medicine-list/medicine-list.component';
import { MedicineResponse } from '../../../../../model/response/medicine-response';

import { PharmacyDispenserAddComponent } from '../../pharmacy-dispenser/pharmacy-dispenser-add/pharmacy-dispenser-add.component';
import { PharmacyDispensersService } from '../../../../../services/pharmacy-dispensers.service';
import { PharmacyDispenserRequest } from '../../../../../model/request/pharmacy-dispenser-request';
import { PharmacyDispenserResponse } from '../../../../../model/response/pharmacy-dispenser-response';
import { PrescriptionRequest } from '../../../../../model/request/prescription-request';
import { DispensationService } from '../../../../../services/dispensation.service';
import { DispensationResponse } from '../../../../../model/response/dispensation-response';
import { DispensationRequest } from '../../../../../model/request/dispensation-request';
import { AuthService } from '../../../../../services/auth.service';
import { computeDispensationCap, DispensationCapInfo } from '../../../../../shared/utils/dispensation-cap.util';

export interface Ampp {
  id: string;
  descripcion: string;
  estado: string;
  estadoValidacion: string;
  comercializado: string;
  descripciones: string;
  ampId: string;
  vmppId: string;
  laboratorioId: number;
  condvtaId: string;
  cantidad?: string; // unidades por caja (vmpp.CANTIDAD), puede faltar
}

@Component({
  selector: 'app-prescription-search',
  templateUrl: './prescription-search.component.html',
  styleUrls: ['./prescription-search.component.scss'],
  providers: [DialogService]
})

export class PrescriptionSearchComponent implements OnInit {
  @ViewChild('stepper') stepper!: Stepper;
  code: string = '';
  prescriptions: PrescriptionResponse[] = [];
  errorMessage: string = '';
  loading: boolean = false;
  groupedPrescriptions: {
    [codePrefix: string]: {
      prescriptions: PrescriptionResponse[],
      ampps?: Ampp[],
      selectAmpp?: Ampp,
      sustituteMedecine?: MedicineResponse,
      amppAmount: number,
      amppssubstitute?: Ampp[],
      sustituteSelect: boolean,
      selectAmppSustitute?: Ampp,
      amppSustituteAmount: number,
      selectedCodes?: string[],
      selectedDispenserId?: string,
      capInfo?: DispensationCapInfo | null
    }
  } = {};

  // Dispenser Logic
  selectedDispenser: PharmacyDispenserResponse | null = null;
  filteredDispensers: PharmacyDispenserResponse[] = [];
  dispensers: PharmacyDispenserResponse[] = [];
  pharmacyId: string | undefined; // can also be dynamic
  // Una farmacia INACTIVA (pendiente de validación en Gestión) no puede buscar
  // ni dispensar recetas. El backend también lo bloquea al crear la dispensación.
  pharmacyInactive: boolean = false;
  selectSubstitute: string = 'Seleccionar Sustituto';
  // View flags
  isDispenserSelected: boolean = false;
  isCollapsed: boolean = false;
  alertWarningShow: boolean = false;
  activeStepIndex: number = 0;
  // Tras dispensar un ítem de una receta múltiple se refresca la búsqueda con el
  // mismo código; este flag hace que el refresh abra el próximo ítem pendiente en
  // vez de volver al buscador vacío.
  private resumeGroupAfterRefresh: boolean = false;

  defaultDispenser: PharmacyDispenserResponse = {
    id: 'add',
    name: '+ Crear dispensador nuevo',
    lastname: '',
    document: {
      number: '',
      type: ''
    },
    createdAt: '',
    updatedAt: null,
    pharmacy: {
      id: '',
      name: '',
      businessName: '',
      rut: '',
      email: '',
      phone: {
        countryCode: '',
        national: '',
        international: '',
        type: '',
        validated: false
      },
      status: '',
      managerName: '',
      managerLastname: '',
      managerCJP: '',
      createdAt: '',
      updatedAt: '',
      managerDocument: {
        number: '',
        type: ''
      },
      addressComments: '',
      addressCountryId: '',
      addressLocalityId: '',
      addressNumber: '',
      addressStreet: ''
    },
    displayLabel: '+ Crear dispensador nuevo'
  };


  constructor(private prescriptionService: PrescriptionService,
    private amppService: AmppService,
    private router: Router,
    public dialogService: DialogService,
    private dispensersService: PharmacyDispensersService,
    private zone: NgZone,
    private dispensationService: DispensationService,
    private authService: AuthService,
  ) { }

  selectedPrescriptions: { [groupKey: string]: string[] } = {};
  currentSubstitutionCode: string | null = null;
  ampps: Ampp[] = [];


  ngOnInit(): void {
    this.filteredDispensers = [this.defaultDispenser];

    this.authService.getCurrentUser().subscribe({
      next: (data => {
        this.pharmacyId = data?.pharmacyId;
        this.pharmacyInactive = data?.role === 'ROLE_PHARMACY' && data?.status !== 'ACTIVE';
        this.filterDispensers(null);
      })
    });
  }

  search(alertWarningShow: boolean): void {
    if (this.pharmacyInactive) {
      return;
    }
    this.errorMessage = '';
    this.prescriptions = [];
    this.groupedPrescriptions = {};
    this.activeStepIndex = -1;

    if (this.code.length !== 6) {
      this.errorMessage = 'Codigo invalido (6 characters required)';
      return;
    }

    this.loading = true;
    this.prescriptionService.getByCodePrefix(this.code).subscribe({
      next: (data) => {
        this.prescriptions = data;
        if (this.prescriptions.length > 0) {
          this.alertWarningShow = false;
          this.groupPrescriptionsByCode();
          // Auto-expandir cuando hay un solo medicamento (grupo), aunque sea una
          // crónica con varias filas-mes. Las comunes single también entran acá.
          if (Object.keys(this.groupedPrescriptions).length === 1) {
            this.activeStepIndex = 0;
          }
          // Refresh post-dispensación: abrir el primer ítem aún no dispensado
          // para seguir dispensando el resto del paquete sin re-buscar.
          if (this.resumeGroupAfterRefresh) {
            this.resumeGroupAfterRefresh = false;
            const pendingIdx = this.getGroupKeys().findIndex(k => !this.isGroupFullyDispensed(k));
            if (pendingIdx >= 0) {
              this.activeStepIndex = pendingIdx;
            }
          }
        } else {
          this.alertWarningShow = alertWarningShow;
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
      }
    });
  }

  codeInput() {
    this.alertWarningShow = false;
  }

  groupPrescriptionsByCode(): void {
    this.groupedPrescriptions = {};

    for (const pres of this.prescriptions) {
      let suffix = pres.code.substring(7, 8);
      // Fallback en cadena y null-safe: si prodMsp viene vacío y vmpDsc null (AMP
      // sin PROD_MSP en el catálogo, p.ej. uroxil), usar ampDsc. Antes esto
      // crasheaba en vmpDsc.trim() y la receta no mostraba el medicamento.
      let codePrefix = (pres.prodMsp?.trim() || pres.vmpDsc?.trim() || pres.ampDsc?.trim() || 'Medicamento');
      codePrefix = suffix + "%%%" + codePrefix.toUpperCase();

      if (!this.groupedPrescriptions[codePrefix]) {
        this.groupedPrescriptions[codePrefix] = {
          prescriptions: [],
          ampps: undefined,
          selectAmpp: undefined,
          amppAmount: 1,
          sustituteSelect: pres.productType === 'VMP',
          sustituteMedecine: undefined,
          amppssubstitute: undefined,
          selectAmppSustitute: undefined,
          amppSustituteAmount: 1,
          selectedCodes: [],
          capInfo: null
        };
      }

      (pres as any).isDispensed = (pres.status === 'DISPENSED') || (pres.status === 'CANCEL' || (pres.status === 'DISPENSED_BY_PROVIDER'));
      this.groupedPrescriptions[codePrefix].prescriptions.push(pres);
    }

    for (const codePrefix in this.groupedPrescriptions) {
      const presList = this.groupedPrescriptions[codePrefix].prescriptions;
      presList.sort((a, b) => this.extractTrailingNumber(a.code) - this.extractTrailingNumber(b.code));


      // ✅ Preselect the only code if there's only one prescription
      if (presList.length === 1) {
        this.groupedPrescriptions[codePrefix].selectedCodes = [presList[0].code];
      }

      if (presList[0].productType === 'AMP') {
        const productIdAmp = presList[0].productId;
        if (productIdAmp) {
          this.amppService.getAmppsByAmpId(productIdAmp).subscribe({
            next: (data) => {
              this.groupedPrescriptions[codePrefix].ampps = data;
            },
            error: (err) => {
              console.error(`Error loading AMPPs for ${productIdAmp}:`, err.message);
            }
          });
        }
      }
    }
  }


  private extractTrailingNumber(code: string): number {
    const match = code.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }

  getGroupKeys(): string[] {
    return Object.keys(this.groupedPrescriptions);
  }

  isGroupChronic(groupKey: string): boolean {
    const prescriptions = this.groupedPrescriptions[groupKey].prescriptions;
    return prescriptions.some((p: PrescriptionResponse) => p.isCronic);
  }

  isGroupFullyDispensed(groupKey: string): boolean {
    const list = this.groupedPrescriptions[groupKey]?.prescriptions || [];
    return list.length > 0 && list.every((p: any) => p.isDispensed);
  }

  /**
   * AMP sin presentaciones comerciales: las AMPPs ya se cargaron y vinieron vacías.
   * En ese caso se dispensa por el AMP directamente (sin selector ni tope de cajas).
   * `undefined` = todavía cargando → se sigue exigiendo la selección.
   */
  groupHasNoAmpps(groupKey: string): boolean {
    const group = this.groupedPrescriptions[groupKey];
    return group?.prescriptions[0]?.productType === 'AMP'
      && Array.isArray(group.ampps) && group.ampps.length === 0;
  }

  splitGroupKey(groupKey: string): string {
    const groupKeyArry = groupKey.split("%%%");
    return groupKeyArry[1];
  }

  increment(groupKey: string): void {
    this.groupedPrescriptions[groupKey].amppAmount++;
    this.clampAmount(groupKey);
  }

  decrement(groupKey: string): void {
    if (this.groupedPrescriptions[groupKey].amppAmount > 0) {
      this.groupedPrescriptions[groupKey].amppAmount--;
    }
    this.clampAmount(groupKey);
  }

  recomputeCap(groupKey: string): void {
    const group = this.groupedPrescriptions[groupKey];
    const ampp = group.sustituteSelect ? group.selectAmppSustitute : group.selectAmpp;
    const rx = group.prescriptions[0];
    group.capInfo = ampp && rx ? computeDispensationCap(rx, ampp.cantidad) : null;
    this.clampAmount(groupKey);
  }

  clampAmount(groupKey: string): void {
    const group = this.groupedPrescriptions[groupKey];
    const max = group.capInfo?.maxBoxes;
    let amount = group.sustituteSelect ? group.amppSustituteAmount : group.amppAmount;
    if (!amount || amount < 1) amount = 1;
    if (max && amount > max) amount = max;
    if (group.sustituteSelect) {
      group.amppSustituteAmount = amount;
    } else {
      group.amppAmount = amount;
    }
  }

  onSubstituteToggle(groupKey: string, value: boolean): void {
    this.groupedPrescriptions[groupKey].sustituteSelect = value;
    this.recomputeCap(groupKey);
  }


  goToStep(index: number): void {
    this.activeStepIndex = index;
  }


  getMesLabel(prescription: PrescriptionResponse, index: number): string {
    return `mes ${index + 1}`;
  }

  openGetMedecine(prescriptionCode: string): void {
    this.currentSubstitutionCode = prescriptionCode;
    const ref = this.dialogService.open(MedicineListComponent, {
      header: 'Buscar medicamento',
      width: '70%',
      style: { 'max-width': '580px', 'min-width': '24rem', 'width': '70%' },
      contentStyle: { 'overflow': 'auto' },
      baseZIndex: 10000,
      data: {
        searchQuery: this.code // or use other relevant field
      }
    });

    ref.onClose.subscribe((medicineResponse: MedicineResponse) => {

      if (medicineResponse && this.currentSubstitutionCode) {
        for (const groupKey in this.groupedPrescriptions) {
          const group = this.groupedPrescriptions[groupKey];
          const prescriptionFound = group.prescriptions.find(p => p.code === this.currentSubstitutionCode);
          if (prescriptionFound) {
            this.groupedPrescriptions[groupKey].sustituteMedecine = medicineResponse;
            if (medicineResponse.prodMsp) {
              this.selectSubstitute = medicineResponse.name;
              this.amppService.getAmppsByAmpId(medicineResponse.id).subscribe({
                next: (data) => {
                  this.groupedPrescriptions[groupKey].amppssubstitute = data;
                },
                error: (err) => {
                  console.error(`Error loading AMPPs for ${medicineResponse.prodMsp}:`, err.message);
                }
              });
            }
            break;
          }
        }

        console.log('Group-level substitute set:', medicineResponse);
        this.currentSubstitutionCode = null;
      }
    });
  }

  dispense(groupKey: string): void {
    const group = this.groupedPrescriptions[groupKey];

    // --- Guards ---
    if (!group) {
      console.error('Group not found:', groupKey);
      return;
    }
    if (!this.selectedDispenser || !this.selectedDispenser.id || this.selectedDispenser.id === 'add') {
      alert('Seleccione un dispensador válido.');
      return;
    }

    // Ensure there is at least one selected prescription code; if not, default to the first
    const selectedCodes = (group.selectedCodes && group.selectedCodes.length > 0)
      ? group.selectedCodes
      : (group.prescriptions.length > 0 ? [group.prescriptions[0].code] : []);

    if (selectedCodes.length === 0) {
      alert('No hay prescripciones seleccionadas para dispensar.');
      return;
    }

    // Require a chosen commercial presentation (AMPP) depending on substitute toggle.
    // Excepción: AMP sin AMPPs asociadas → se dispensa por el AMP, sin presentación.
    const dispenseByAmp = !group.sustituteSelect && this.groupHasNoAmpps(groupKey);
    const chosenAmpp = group.sustituteSelect ? group.selectAmppSustitute : group.selectAmpp;
    if (!dispenseByAmp && (!chosenAmpp || !chosenAmpp.ampId)) {
      alert('Seleccione una presentación comercial (AMPP).');
      return;
    }

    // Recalcular tope con la presentación elegida y clampear la cantidad
    this.recomputeCap(groupKey);


    // Pick first selected prescription (you can loop to handle all)
    const targetCode = selectedCodes[0];
    const amountSelecdCodes = selectedCodes.length;
    const prescriptionsAvailable = group.prescriptions.filter(p => p.status == "AVAILABLE" || p.status == "CANCELLED");
    const targetRx = group.prescriptions.find(p => p.code === targetCode);

    const sortedAvailablePrescriptions = prescriptionsAvailable
      .slice() // copy to avoid mutating the original
      .sort((a, b) => {
        const suffixA = a.code.split('-')[1] || '';
        const suffixB = b.code.split('-')[1] || '';

        const [letterA, numA] = [suffixA[0], parseInt(suffixA.slice(1) || '0', 10)];
        const [letterB, numB] = [suffixB[0], parseInt(suffixB.slice(1) || '0', 10)];

        if (letterA !== letterB) {
          return letterA.localeCompare(letterB); // A < B < C...
        }
        return numA - numB; // A1 < A2 < A3...
      });

    const selectedPrescriptions = sortedAvailablePrescriptions.slice(0, amountSelecdCodes);


    if (!targetRx) {
      alert('No se encontró la prescripción seleccionada.');
      return;
    }

    // Quantity: use substitute or normal amount
    const qty = group.sustituteSelect ? group.amppSustituteAmount : group.amppAmount;

    // Patient data for "dispensedTo*"
    const dispensedToName = 'N/A';
    const dispensedToLastname = 'N/A';
    const dispensedToDocument = { number: '', type: '' };

    // Optional address fields if your PrescriptionResponse has them (otherwise leave undefined)
    const dispensedToAddressCity = (targetRx as any).patientAddressCity;
    const dispensedToAddressStreet = (targetRx as any).patientAddressStreet;
    const dispensedToAddressCountryId = (targetRx as any).patientAddressCountryId;


    var pendingDispensations = selectedPrescriptions.length;

    // Call API
    selectedPrescriptions.forEach(p => {
      // Build payload
      const dispensationRequest: DispensationRequest = {
        qty: qty ?? 1,
        prescriptionId: p.id,                 // ensure PrescriptionResponse includes id
        pharmacyId: this.pharmacyId,                 // set from your component
        status: 'DISPENSED',
        substitute: group.sustituteSelect && chosenAmpp ? chosenAmpp.ampId : 'N',
        loteNumber: '0000',
        loteExpireAt: null,
        dispensedToName,
        dispensedToLastname,
        dispensedToDocument,
        dispensedToAddressCity,
        dispensedToAddressStreet,
        dispensedToAddressCountryId,
        dispensedById: this.selectedDispenser?.id,
        // AMP sin AMPPs: se dispensa por el AMP de la receta (el backend ya
        // resuelve nombres con fallback ampp→amp). Si no, va la AMPP elegida.
        productId: dispenseByAmp ? targetRx.productId : chosenAmpp!.id,
        productType: 'AMP',
        dnmaLaboratoryId: group.sustituteSelect && chosenAmpp ? chosenAmpp.laboratorioId : 0,
        condvtaId: dispenseByAmp
          ? (targetRx.condvtaId != null ? String(targetRx.condvtaId) : null)
          : chosenAmpp!.condvtaId,
      };

      this.dispensationService.create(dispensationRequest).subscribe({
        next: (data: DispensationResponse) => {
          console.log('Dispensation created:', data);
          pendingDispensations--;
          if (pendingDispensations === 0) {
            // Receta múltiple: NO limpiar el código — se refresca la misma receta
            // (estados al día) y se abre el próximo ítem pendiente del paquete.
            this.resumeGroupAfterRefresh = true;
            this.search(false);
          }
        },
        error: (err) => {
          console.error('Error creating dispensation', err);
          pendingDispensations--;
          if (pendingDispensations === 0) {
            this.resumeGroupAfterRefresh = true;
            this.search(false);
          }
        }
      });
    });


  }


  filterDispensers(event: any, preselectId?: string): void {
    this.filteredDispensers = [];

    const applyData = (data: PharmacyDispenserResponse[]) => {
      // avoid duplicating defaultDispenser
      const mapped = data.map(d => ({
        ...d,
        displayLabel: `${d.name} ${d.lastname} ${d.document?.number ?? ''}`.trim()
      }));
      this.filteredDispensers = [this.defaultDispenser, ...mapped];

      if (preselectId) {
        const match = this.filteredDispensers.find(d => d.id === preselectId);
        if (match) {
          this.selectedDispenser = match;
          this.isDispenserSelected = true;
        }
      }
    };

    if (event == null || event.filter == "") {
      this.dispensersService.getAllPharmacyToken().subscribe({
        next: applyData,
        error: err => console.error('Error fetching dispensers', err)
      });
    } else {
      const query = event.filter;
      if (query.length > 0) {
        this.dispensersService.search(query, query, query).subscribe({
          next: applyData,
          error: err => console.error('Error fetching dispensers', err)
        });
      }
    }
  }


  onDispenserSelect(event: any): void {
    if (this.selectedDispenser?.id === 'add') {
      this.openAddDispenserModal();
    } else {
      this.selectedDispenser = event.value;
      this.isDispenserSelected = true;
    }
  }

  openAddDispenserModal(selectedDispenserId?: string): void {
    const ref = this.dialogService.open(PharmacyDispenserAddComponent, {
      header: selectedDispenserId ? 'Editar Dispensador' : 'Crear Dispensador',
      width: '70%',
      style: { 'max-width': '580px', 'min-width': '24rem', 'width': '70%' },
      contentStyle: { 'overflow': 'auto' },
      data: {
        //dispenser: selectedDispenserId ? this.dispensers.find(d => d.id === selectedDispenserId) : null,
        // pharmacyId: this.pharmacyId
        selectedDispenserId: selectedDispenserId || null
      }
    });

    ref.onClose.subscribe((newDispenser: PharmacyDispenserResponse) => {
      if (newDispenser) {
        this.filterDispensers(null, newDispenser.id);
      }
    });
  }

  editDispenser(id: string): void {
    this.openAddDispenserModal(id);
  }

  deselectDispenser(): void {
    this.selectedDispenser = null;
    this.isDispenserSelected = false;
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

}
