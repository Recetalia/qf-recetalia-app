// src/app/services/dispensation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../model/response/api-response';
import { DispensationRequest } from '../model/request/dispensation-request';
import { DispensationResponse } from '../model/response/dispensation-response';
import { Page } from '../model/page';
import { DispensationSearchRow } from '../model/response/dispensation-search-row';
import { toLocalDateParam } from '../shared/date-utils';

@Injectable({ providedIn: 'root' })
export class DispensationService {
  private Url = environment.apiUrl;
  private apiUrl = `${this.Url}/dispensations`; // Controller base: /api/dispensations

  constructor(private http: HttpClient) { }

  /** Create a new Dispensation */
  create(payload: DispensationRequest): Observable<DispensationResponse> {
    return this.http.post<ApiResponse<DispensationResponse>>(this.apiUrl, payload).pipe(
      map(res => this.unwrap(res)),
      catchError(err => this.fail<DispensationResponse>('Failed to create dispensation', err))
    );
  }

  /** Update a Dispensation by ID */
  update(id: string, payload: DispensationRequest): Observable<DispensationResponse> {
    return this.http.put<ApiResponse<DispensationResponse>>(`${this.apiUrl}/${id}`, payload).pipe(
      map(res => this.unwrap(res)),
      catchError(err => this.fail<DispensationResponse>('Failed to update dispensation', err))
    );
  }

  /** Get a Dispensation by ID */
  getById(id: string): Observable<DispensationResponse> {
    return this.http.get<ApiResponse<DispensationResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.unwrap(res)),
      catchError(err => this.fail<DispensationResponse>('Failed to fetch dispensation', err))
    );
  }

  /** Get a Dispensation by Prescription ID (1:1) */
  getByPrescriptionId(prescriptionId: string): Observable<DispensationResponse> {
    return this.http
      .get<ApiResponse<DispensationResponse>>(`${this.apiUrl}/by-prescription/${prescriptionId}`)
      .pipe(
        map(res => this.unwrap(res)),
        catchError(err => this.fail<DispensationResponse>('Failed to fetch dispensation by prescription', err))
      );
  }

  /** List (paginated) by Pharmacy ID */
  listByPharmacy(
    pharmacyId: string,
    options: { page?: number; size?: number; sort?: string } = {}
  ): Observable<Page<DispensationResponse>> {
    let params = new HttpParams();
    if (options.page != null) params = params.set('page', options.page);
    if (options.size != null) params = params.set('size', options.size);
    if (options.sort) params = params.set('sort', options.sort);

    return this.http
      .get<ApiResponse<Page<DispensationResponse>>>(`${this.apiUrl}/pharmacy/${pharmacyId}`, { params })
      .pipe(
        map(res => this.unwrap(res)),
        catchError(err => this.fail<Page<DispensationResponse>>('Failed to fetch dispensations by pharmacy', err))
      );
  }

  /** Soft delete (marks deletedAt) */
  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        if (res.status === 'SUCCESS') return;
        throw new Error('Error response from the API: ' + res.applicationProvider);
      }),
      catchError(err => this.fail<void>('Failed to delete dispensation', err))
    );
  }

  /** Cancel a dispensation (status=CANCELLED) */
  cancel(id: string, cancelledByDispenserId: string): Observable<DispensationResponse> {
    const params = new HttpParams().set('cancelledByDispenserId', cancelledByDispenserId);
    return this.http
      .patch<ApiResponse<DispensationResponse>>(`${this.apiUrl}/${id}/cancel`, {}, { params })
      .pipe(
        map(res => this.unwrap(res)),
        catchError(err => this.fail<DispensationResponse>('Failed to cancel dispensation', err))
      );
  }

  // ---- helpers ----
  private unwrap<T>(res: ApiResponse<T>): T {
    if (res.status === 'SUCCESS') return res.answer;
    throw new Error('Error response from the API: ' + res.applicationProvider);
  }

  private fail<T>(msg: string, err: any): Observable<T> {
    console.error(msg, err);
    return throwError(() => new Error(msg));
  }


  /**
   * Search dispensations (paged) using /api/dispensations/search
   *
   * @param pharmacyId required
   * @param options optional filters and pagination/sort
   *   - dispensedById?: string
   *   - contains?: string
   *   - startDate?: Date | string (converted to LocalDate 'YYYY-MM-DD')
   *   - endDate?: Date | string   (converted to LocalDate 'YYYY-MM-DD')
   *   - page?: number (0-based)
   *   - size?: number
   *   - sort?: string (e.g. 'dispensationCreatedAt,desc')
   */
  search(
    pharmacyId: string,
    options: {
      franchiseId?: string;
      dispensedById?: string;
      laboratoryId?: number;
      contains?: string;
      condvtaId?: string;
      startDate?: Date | string;
      endDate?: Date | string;
      page?: number;
      size?: number;
      sort?: string;
    } = {}
  ): Observable<Page<DispensationSearchRow>> {
    let params = new HttpParams().set('pharmacyId', pharmacyId);

    if (options.franchiseId) params = params.set('franchiseId', options.franchiseId);
    if (options.laboratoryId) params = params.set('laboratoryId', options.laboratoryId);
    if (options.dispensedById) params = params.set('dispensedById', options.dispensedById);
    if (options.contains) params = params.set('contains', options.contains);
    if (options.condvtaId) params = params.set('condvtaId', options.condvtaId);

    const start = toLocalDateParam(options.startDate);
    const end = toLocalDateParam(options.endDate);
    if (start) params = params.set('startDate', start);
    if (end) params = params.set('endDate', end);

    if (options.page != null) params = params.set('page', options.page);
    if (options.size != null) params = params.set('size', options.size);
    if (options.sort) params = params.set('sort', options.sort);

    return this.http
      .get<ApiResponse<Page<DispensationSearchRow>>>(`${this.apiUrl}/search`, { params })
      .pipe(
        map(res => this.unwrap(res)),
        catchError(err => this.fail<Page<DispensationSearchRow>>('Failed to search dispensations', err))
      );
  }

}

