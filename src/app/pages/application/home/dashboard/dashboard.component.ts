import { Component, OnInit } from '@angular/core';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../../../../services/auth.service';
import { DashboardService } from '../../../../services/dashboard.service';
import { PharmacySummaryResponse } from '../../../../model/response/pharmacy-summary-response';

type Preset = 'today' | '7d' | '30d' | 'month' | 'custom';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  loading = true;
  error = false;
  data?: PharmacySummaryResponse;
  isAdmin = false;
  private scope: { pharmacyId?: string; franchiseId?: string } = {};

  preset: Preset = '30d';
  startDate!: Date;
  endDate!: Date;

  trendChart: any; trendOpts: any;
  topMedsChart: any; barHOpts: any;
  branchChart: any; pieOpts: any;
  private palette = ['#3b82f6', '#22a06b', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899', '#64748b'];

  constructor(private authService: AuthService, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().pipe(filter(u => !!u), take(1)).subscribe({
      next: (user: any) => {
        this.isAdmin = user.role === 'ROLE_PHARMACY_ADMIN';
        this.scope = this.isAdmin ? { franchiseId: user.franchiseId } : { pharmacyId: user.pharmacyId };
        if (this.isAdmin && !user.franchiseId) { this.error = true; this.loading = false; return; }
        this.applyPreset('30d');
      },
      error: () => { this.error = true; this.loading = false; },
    });
  }

  applyPreset(p: Preset): void {
    this.preset = p;
    const end = new Date(); const start = new Date();
    if (p === '7d') start.setDate(end.getDate() - 6);
    else if (p === '30d') start.setDate(end.getDate() - 29);
    else if (p === 'month') start.setDate(1);
    if (p !== 'custom') { this.startDate = start; this.endDate = end; this.load(); }
  }
  onCustomChange(): void { if (this.startDate && this.endDate) { this.preset = 'custom'; this.load(); } }

  private iso(d: Date): string {
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  get deltaPct(): number | null {
    if (!this.data) return null;
    const prev = this.data.previousDispensations;
    if (prev === 0) return this.data.dispensations === 0 ? 0 : null;
    return Math.round(((this.data.dispensations - prev) / prev) * 1000) / 10;
  }
  get deltaLabel(): string { const d = this.deltaPct; return d == null ? '' : (d > 0 ? '+' : '') + d + '%'; }
  get deltaClass(): string { const d = this.deltaPct; if (d == null || d === 0) return 'flat'; return d > 0 ? 'up' : 'down'; }

  load(): void {
    this.loading = true; this.error = false;
    this.dashboardService.getPharmacySummary(this.scope, this.iso(this.startDate), this.iso(this.endDate)).subscribe({
      next: data => { this.data = data; this.buildCharts(data); this.loading = false; },
      error: () => { this.error = true; this.loading = false; },
    });
  }

  private buildCharts(d: PharmacySummaryResponse): void {
    this.trendChart = {
      labels: d.trend.map(r => r.date),
      datasets: [{ label: 'Dispensaciones', data: d.trend.map(r => r.dispensations), borderColor: '#22a06b', tension: .3 }],
    };
    this.trendOpts = { maintainAspectRatio: false, plugins: { legend: { display: false } } };

    this.topMedsChart = {
      labels: d.topMedicines.map(m => m.medicineName),
      datasets: [{ label: 'Dispensaciones', data: d.topMedicines.map(m => m.count), backgroundColor: '#3b82f6' }],
    };
    this.barHOpts = { maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } };

    this.branchChart = {
      labels: d.byBranch.map(b => b.pharmacyName),
      datasets: [{ data: d.byBranch.map(b => b.count), backgroundColor: this.palette }],
    };
    this.pieOpts = { maintainAspectRatio: false, plugins: { legend: { position: 'right' } } };
  }
}
