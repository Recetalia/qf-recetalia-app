import { Component, OnInit, OnDestroy } from '@angular/core';
import { DispensationService } from '../../../../../services/dispensation.service';
import { DispensationSearchRow } from '../../../../../model/response/dispensation-search-row';
import { Page } from '../../../../../model/page';
import { debounceTime, Subject, distinctUntilChanged, filter, take, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../../../../../services/auth.service';
import { LaboratorioService } from '../../../../../services/laboratorio.service';
import { LaboratorioResponse } from '../../../../../model/response/laboratorio-response';
import { PharmacyDispensersService } from '../../../../../services/pharmacy-dispensers.service';
import { PharmacyDispenserResponse } from '../../../../../model/response/pharmacy-dispenser-response';
import { DispensationsInfoComponent } from '../dispensations-info/dispensations-info.component';
import { DispensationFileService } from '../../../../../services/dispensation-file.service';
import { FranchiseResponse } from '../../../../../model/response/franchise-response';
import { FranchiseService } from '../../../../../services/franchise.service';
import { LocalityService } from '../../../../../services/localities.service';
import { RegionService } from '../../../../../services/region.service';
import { PharmacyService } from '../../../../../services/pharmacy.service';

@Component({
  selector: 'app-dispensation-list',
  templateUrl: './dispensation-list.component.html',
  styleUrls: ['./dispensation-list.component.scss'], // <-- fix: styleUrls (array)
  providers: [DialogService]
})
export class DispensationListComponent implements OnInit, OnDestroy {

  laboratorys: LaboratorioResponse[] = [];
  dispenser: PharmacyDispenserResponse[] = [];
  franchises: FranchiseResponse[] = [];

  selectedDispenserId: string | null = null;
  selectedLaboratoryId: number | null = null;


  /** Required by the backend */
  pharmacyId = '';

  /** Optional: filter by a specific dispenser (pharmacy_dispenser.id) */
  dispensedById = '';

  /** Text search across code/patient fields */
  contains = '';
  private contains$ = new Subject<string>();

  /** Date range (PrimeNG Calendar with range) */
  rangeDates: Date[] | undefined;

  /** Table / pagination state */
  rows: DispensationSearchRow[] = [];
  totalRecords = 0;
  loading = true;
  errorMessage: string | null = null;
  pageIndex = 0;   // 0-based
  pageSize = 25;   // default
  sort = 'dispensationCreatedAt,desc'; // matches ORDER BY

  selectedCondvtaId: string | null = null; // 'GREEN' | 'ORANGE' | 'WHITE' | null

  isAdmin = false;
  franchiseId: string | null = null;
  branchOptions: { label: string; value: string | null }[] = [{ label: 'Todas las sucursales', value: null }];
  selectedBranchId: string | null = null;

  /** El filtro/columna de Sucursal solo tiene sentido para un admin de cadena con
   *  más de una sucursal. branchOptions incluye "Todas las sucursales" (índice 0),
   *  por eso > 2 significa 2+ sucursales reales. */
  get hasMultipleBranches(): boolean {
    return this.isAdmin && this.branchOptions.length > 2;
  }

  get condvtaOptions() {
    return [
      { label: 'Todas', value: null },
      { label: 'Blanca', value: 'WHITE' },
      { label: 'Verde', value: 'GREEN' },
      { label: 'Naranja', value: 'ORANGE' },      
    ];
  }

  private destroy$ = new Subject<void>();

  constructor(
    private dispensationService: DispensationService,
    private router: Router,
    private authService: AuthService,
    private laboratorioService: LaboratorioService,
    private pharmacyDispensersService: PharmacyDispensersService,
    public dialogService: DialogService,
    private fileService: DispensationFileService,
    private franchiseService: FranchiseService,
    private localityService: LocalityService,
    private regionService: RegionService,
    private pharmacyService: PharmacyService

  ) {

    this.laboratorioService.getAllLaboratory()
      .subscribe({
        next: (data: LaboratorioResponse[]) => {
          this.laboratorys = data;
        },
        error: (err) => {
          console.error('Failed to search laboratory', err);
          this.rows = [];
          this.totalRecords = 0;
          this.loading = false;
        }
      });

    this.pharmacyDispensersService.getAllPharmacyToken().subscribe({
      next: (data: PharmacyDispenserResponse[]) => {
        console.log("PharmacyDispenserResponse: " + data);
        this.dispenser = data;
      },
      error: (err) => {
        console.error('Failed to get all PharmacyDispenser', err);
        this.rows = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  }

  ngOnInit(): void {
    // 1) Wait for pharmacyId once, then load the first page
    this.authService.getCurrentUser()
      .pipe(
        filter((u: any) => u !== null && u !== undefined),
        take(1)
      )
      .subscribe({
        next: (user: any) => {
          this.isAdmin = user?.role === 'ROLE_PHARMACY_ADMIN';
          if (this.isAdmin) {
            if (!user?.franchiseId) {
              this.loading = false;
              this.errorMessage = 'No se pudo identificar la cadena del administrador.';
              return;
            }
            this.franchiseId = user.franchiseId;
            this.pharmacyService.getByFranchise(user.franchiseId).subscribe({
              next: (list: any[]) => {
                this.branchOptions = [{ label: 'Todas las sucursales', value: null },
                  ...list.map(p => ({ label: p.name, value: p.id }))];
              },
              error: () => { /* deja solo 'Todas' */ },
            });
            this.refreshTable();
          } else {
            if (!user?.pharmacyId) {
              this.loading = false;
              this.errorMessage = 'No se pudo identificar la farmacia del usuario actual.';
              return;
            }
            this.pharmacyId = user.pharmacyId;
            this.refreshTable();
          }
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Error al obtener datos del usuario.';
        }
      });

    // 2) debounce “contains” text input
    this.contains$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(val => {
        this.contains = val;
        this.refreshTable();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Hooked from p-table (onLazyLoad) */
  loadDispensations(event: any): void {
    if (!this.isAdmin && !this.pharmacyId) {
      this.loading = false;
      return;
    }

    const exporting = !!event.__exporting;
    const exportKind: 'excel' | 'pdf' | undefined = event.__exportKind;

    // Only mutate component table state when this is the table calling us
    if (!exporting) {
      this.loading = true;
      this.pageIndex = event.first / event.rows;
      this.pageSize = event.rows;
      if (event.sortField) {
        const dir = event.sortOrder === 1 ? 'asc' : 'desc';
        this.sort = `${event.sortField},${dir}`;
      }
    } else {
      // still show a small loader during the export fetch
      this.loading = true;
    }

    const startDate = this.rangeDates?.length === 2 ? this.rangeDates[0] : undefined;
    const endDate = this.rangeDates?.length === 2 ? this.rangeDates[1] : undefined;

    // Build request options (use the event’s rows for page size, but don’t touch table state if exporting)
    const opts = {
      franchiseId: this.isAdmin ? (this.franchiseId || undefined) : undefined,
      dispensedById: this.selectedDispenserId || undefined,
      laboratoryId: this.selectedLaboratoryId ?? undefined,
      contains: this.contains || undefined,
      startDate,
      endDate,
      condvtaId: this.selectedCondvtaId || undefined,
      page: 0,                                     // always first page for both table + export (your table passes first anyway)
      size: event.rows ?? this.pageSize,           // for export = 10000
      sort: this.sort
    };

    this.dispensationService.search(this.isAdmin ? (this.selectedBranchId ?? '') : this.pharmacyId, opts)
      .subscribe({
        next: (page: Page<DispensationSearchRow>) => {
          if (exporting) {
            const toExport = page.content as DispensationSearchRow[];
            this.loading = false;
            // fire and forget (no UI state changes)
            if (exportKind === 'excel') {
              void this.fileService.exportDispensationsToExcel(toExport);
            } else {
              void this.fileService.exportDispensationsToPdf(toExport);
            }
            return;
          }

          // normal table flow
          this.rows = page.content as DispensationSearchRow[];
          this.totalRecords = page.totalElements;
          this.loading = false;

          // keep your preview behavior for the table only
          // this.openDispensation(this.rows[0]);
        },
        error: (err) => {
          console.error('Failed to search dispensations', err);
          if (!exporting) {
            this.rows = [];
            this.totalRecords = 0;
          }
          this.loading = false;
        }
      });
  }

  /** Called when user picks 2 dates */
  onDateSelect(): void {
    if (this.rangeDates && this.rangeDates.length === 2 && this.rangeDates[0] && this.rangeDates[1]) {
      this.refreshTable();
    }
  }

  /** Clear date range filter */
  clearDateRange(): void {
    this.rangeDates = [];
    this.refreshTable();
  }

  /** Update “contains” with debounce */
  onContainsInput(value: string): void {
    this.contains$.next(value);
  }

  /** When changing dispenser filter */
  onDispenserSelect(dispenserId: string | null): void {
    this.selectedDispenserId = dispenserId;
    this.refreshTable();
  }

  onLaboratorySelect(labId: number | null): void {
    this.selectedLaboratoryId = labId;
    this.refreshTable();
  }

  onCondvtaSelect(value: string | null): void {
    this.selectedCondvtaId = value;
    this.refreshTable();
  }

  onBranchChange(): void { this.refreshTable(); }

  /** Reset pagination and reload */
  refreshTable(): void {
    this.pageIndex = 0;
    // trigger p-table lazy load; if you don’t have a table ref, call loadDispensations with first/rows:
    this.loadDispensations({ first: 0, rows: this.pageSize, sortField: null, sortOrder: 0 });
  }

  // Build dropdown options (label/value) once data arrives
  get dispenserOptions() {
    // Show "Name Lastname (DocType DocNumber)" if available
    return (this.dispenser ?? []).map(d => ({
      label: `${d.name ?? ''} ${d.lastname ?? ''} (${d.document?.type ?? ''} ${d.document?.number ?? ''})`.trim(),
      value: d.id
    }));
  }

  get laboratoryOptions() {
    // Use nombreAbr if present, else nombre; value must be a number (server expects Integer)
    return (this.laboratorys ?? [])
      .filter(l => l?.id != null)
      .map(l => ({
        label: l.nombreAbr?.trim() || l.nombre?.trim() || `LAB ${l.id}`,
        value: Number(l.id)  // <- ensure numeric id
      }));
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'Disponible';
      case 'DISPENSED':
        return 'Dispensada';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCEL':
        return 'Cancelada';
      default:
        return status;
    }
  }

  openDispensation(row: DispensationSearchRow) {
    const ref: DynamicDialogRef = this.dialogService.open(DispensationsInfoComponent, {
      header: `Dispensación # ${row.prescriptionCode}`,
      style: { width: '70%', 'max-width': '980px' },
      contentStyle: { 'max-height': '80vh', overflow: 'auto' },
      dismissableMask: true,
      data: {
        dispensationPreview: row,            // quick preview
        dispensationId: row.dispensationId   // for fetching full detail
      }
    });
  }

  /** Export handlers (do NOT change table state) */
  onExportExcel(): void {
    // call loadDispensations but mark it as an export request and ask for 10k rows
    this.loadDispensations({
      first: 0,
      rows: 10000,
      sortField: null,
      sortOrder: 0,
      __exporting: true,
      __exportKind: 'excel'
    });
  }

  onExportPdf(): void {
    this.loadDispensations({
      first: 0,
      rows: 10000,
      sortField: null,
      sortOrder: 0,
      __exporting: true,
      __exportKind: 'pdf'
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


}
