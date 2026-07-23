import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../model/response/api-response';
import { Page } from '../model/page';
import { PharmacyResponse } from '../model/response/pharmacy-response';
import { DispensationSearchRow } from '../model/response/dispensation-search-row';

@Injectable({ providedIn: 'root' })
export class PharmaceuticalDirectorService {
  private base = `${environment.apiUrl}/pharmaceutical-director`;

  constructor(private http: HttpClient) {}

  getMyPharmacies(): Observable<PharmacyResponse[]> {
    return this.http.get<ApiResponse<PharmacyResponse[]>>(`${this.base}/pharmacies`)
      .pipe(map(r => r.answer));
  }

  getGreenDispensations(pharmacyId: string, opts: { startDate?: string; endDate?: string; page?: number; size?: number; sort?: string }):
      Observable<Page<DispensationSearchRow>> {
    let params = new HttpParams().set('pharmacyId', pharmacyId)
      .set('page', String(opts.page ?? 0)).set('size', String(opts.size ?? 10));
    if (opts.sort) params = params.set('sort', opts.sort);
    if (opts.startDate) params = params.set('startDate', opts.startDate);
    if (opts.endDate) params = params.set('endDate', opts.endDate);
    return this.http.get<ApiResponse<Page<DispensationSearchRow>>>(`${this.base}/green-dispensations`, { params })
      .pipe(map(r => r.answer));
  }

  control(dispensationId: string): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/dispensations/${dispensationId}/control`, {})
      .pipe(map(r => r.answer));
  }
}
