import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../model/response/api-response';
import { PharmacySummaryResponse } from '../model/response/pharmacy-summary-response';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;
  constructor(private http: HttpClient) {}

  getPharmacySummary(scope: { pharmacyId?: string; franchiseId?: string }, startDate: string, endDate: string): Observable<PharmacySummaryResponse> {
    let params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    if (scope.pharmacyId) params = params.set('pharmacyId', scope.pharmacyId);
    if (scope.franchiseId) params = params.set('franchiseId', scope.franchiseId);
    return this.http.get<ApiResponse<PharmacySummaryResponse>>(`${this.apiUrl}/pharmacy-summary`, { params }).pipe(
      map(r => { if (r.status === 'SUCCESS') return r.answer; throw new Error('API error: ' + r.applicationProvider); }),
      catchError(err => { console.error('dashboard failed', err); return throwError(() => new Error('Failed to fetch dashboard')); })
    );
  }
}
