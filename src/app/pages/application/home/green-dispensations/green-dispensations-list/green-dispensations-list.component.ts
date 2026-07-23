import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PharmaceuticalDirectorService } from '../../../../../services/pharmaceutical-director.service';
import { DispensationSearchRow } from '../../../../../model/response/dispensation-search-row';

@Component({
  selector: 'app-green-dispensations-list',
  templateUrl: './green-dispensations-list.component.html'
})
export class GreenDispensationsListComponent implements OnInit {
  pharmacyId!: string;
  pharmacyName = '';
  rows: DispensationSearchRow[] = [];
  totalRecords = 0;
  loading = false;
  pageSize = 10;
  rangeDates: Date[] | null = null;
  controllingId: string | null = null;

  constructor(private route: ActivatedRoute, private pd: PharmaceuticalDirectorService) {}

  ngOnInit(): void {
    this.pharmacyId = this.route.snapshot.paramMap.get('pharmacyId')!;
    this.pharmacyName = this.route.snapshot.queryParamMap.get('name') ?? '';
  }

  load(event: any) {
    this.loading = true;
    const page = event ? Math.floor(event.first / event.rows) : 0;
    const size = event?.rows ?? this.pageSize;
    const startDate = this.rangeDates?.[0] ? this.toIso(this.rangeDates[0]) : undefined;
    const endDate = this.rangeDates?.[1] ? this.toIso(this.rangeDates[1]) : undefined;
    this.pd.getGreenDispensations(this.pharmacyId, { page, size, sort: 'dispensationCreatedAt,desc', startDate, endDate })
      .subscribe({
        next: (p) => { this.rows = p.content; this.totalRecords = p.totalElements; this.loading = false; },
        error: () => { this.loading = false; }
      });
  }

  control(row: DispensationSearchRow) {
    if (row.dtControlAt) return;
    this.controllingId = row.dispensationId;
    this.pd.control(row.dispensationId).subscribe({
      next: () => { row.dtControlAt = new Date().toISOString(); this.controllingId = null; },
      error: () => { this.controllingId = null; }
    });
  }

  applyFilter() { this.load({ first: 0, rows: this.pageSize }); }

  private toIso(d: Date): string { return d.toISOString().substring(0, 10); }
}
