import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrescriptionRequest } from '../model/request/prescription-request';
import { PrescriptionResponse } from '../model/response/prescription-response';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiResponse } from '../model/response/api-response';
import { Pagination } from '../model/response/pagination-response';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  private Url = environment.apiUrl;
  private apiUrl = `${this.Url}/prescriptions`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<PrescriptionResponse[]> {
    return this.http.get<ApiResponse<PrescriptionResponse[]>>(this.apiUrl).pipe(
      map((response: ApiResponse<PrescriptionResponse[]>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch prescriptions'));
      })
    );
  }

  getById(id: string): Observable<PrescriptionResponse> {
    return this.http.get<ApiResponse<PrescriptionResponse>>(`${this.apiUrl}/${id}`).pipe(
      map((response: ApiResponse<PrescriptionResponse>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch prescription details'));
      })
    );
  }

  create(prescription: PrescriptionRequest): Observable<PrescriptionResponse> {
    return this.http.post<ApiResponse<PrescriptionResponse>>(this.apiUrl, prescription).pipe(
      map((response: ApiResponse<PrescriptionResponse>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to create prescription'));
      })
    );
  }

  update(id: string, prescription: PrescriptionRequest): Observable<PrescriptionResponse> {
    return this.http.put<ApiResponse<PrescriptionResponse>>(`${this.apiUrl}/${id}`, prescription).pipe(
      map((response: ApiResponse<PrescriptionResponse>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to update prescription'));
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map((response: ApiResponse<void>) => {
        if (response.status === 'SUCCESS') {
          return;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to delete prescription'));
      })
    );
  }

  getPrescriptionsByMedicalProviderId(medicalProviderId: string, statuses: string[], page: number, size: number): Observable<Pagination<PrescriptionResponse>> {
    let params = new HttpParams()
      .set('medicalProviderId', medicalProviderId)
      .set('statuses', statuses.join(','))
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<Pagination<PrescriptionResponse>>>(`${this.apiUrl}/by-medical-provider-paginated`, { params }).pipe(
      map((response: ApiResponse<Pagination<PrescriptionResponse>>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch paginated prescriptions'));
      })
    );
  }

  getPrescriptionsByMedicIdAndMedicalProviderId(medicId: string, medicalProviderId: string, statuses: string[], page: number, size: number): Observable<Pagination<PrescriptionResponse>> {
    let params = new HttpParams()
      .set('medicId', medicId)
      .set('medicalProviderId', medicalProviderId)
      .set('statuses', statuses.join(','))
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<Pagination<PrescriptionResponse>>>(`${this.apiUrl}/by-medic-and-medical-provider-paginated`, { params }).pipe(
      map((response: ApiResponse<Pagination<PrescriptionResponse>>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch paginated prescriptions'));
      })
    );
  }

  getPrescriptionsByPatientIdAndMedicalProviderId(patientId: string, medicalProviderId: string, statuses: string[], page: number, size: number): Observable<Pagination<PrescriptionResponse>> {
    let params = new HttpParams()
      .set('patientId', patientId)
      .set('medicalProviderId', medicalProviderId)
      .set('statuses', statuses.join(','))
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<Pagination<PrescriptionResponse>>>(`${this.apiUrl}/by-patient-and-medical-provider-paginated`, { params }).pipe(
      map((response: ApiResponse<Pagination<PrescriptionResponse>>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch paginated prescriptions'));
      })
    );
  }

  getPrescriptionsByMedicalProviderAndDateRange(medicalProviderId: string, startDate: string, endDate: string, statuses: string[], page: number, size: number): Observable<Pagination<PrescriptionResponse>> {
    let params = new HttpParams()
      .set('medicalProviderId', medicalProviderId)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('statuses', statuses.join(','))
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<Pagination<PrescriptionResponse>>>(`${this.apiUrl}/by-medical-provider-and-date-range`, { params }).pipe(
      map((response: ApiResponse<Pagination<PrescriptionResponse>>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch paginated prescriptions'));
      })
    );
  }

  getPrescriptionsByMedicIdAndDateRange(medicId: string, startDate: string, endDate: string, statuses: string[]): Observable<PrescriptionResponse[]> {
    let params = new HttpParams()
      .set('medicId', medicId)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('statuses', statuses.join(','));

    return this.http.get<ApiResponse<PrescriptionResponse[]>>(`${this.apiUrl}/by-medic-and-date-range`, { params }).pipe(
      map((response: ApiResponse<PrescriptionResponse[]>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch prescriptions by medic and date range'));
      })
    );
  }


  downloadExcel(
    statuses: string[],
    medicId?: string,
    patientId?: string,
    startDate?: string,
    endDate?: string,
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('statuses', statuses.join(','));

    if (medicId) {
      params = params.set('medicId', medicId);
    }

    if (patientId) {
      params = params.set('patientId', patientId);
    }

    if (startDate && endDate) {
      params = params.set('startDate', startDate);
      params = params.set('endDate', endDate);
    }

    return this.http.get(`${this.apiUrl}/download/excel`, {
      params: params,
      responseType: 'blob'
    });
  }


  getPrescriptionsByFilters(
    statuses: string[],
    medicId: string,
    patientId: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    size?: number
  ): Observable<Pagination<PrescriptionResponse>> {
    let params = new HttpParams().set('statuses', statuses.join(','));

    if (page) {
      params = params.set('page', page.toString());
    }
    if (size) {
      params = params.set('size', size.toString());
    }
    if (medicId) {
      params = params.set('medicId', medicId);
    }
    if (patientId) {
      params = params.set('patientId', patientId);
    }
    if (startDate && endDate) {
      params = params.set('startDate', startDate);
      params = params.set('endDate', endDate);
    }

    return this.http.get<ApiResponse<Pagination<PrescriptionResponse>>>(`${this.apiUrl}/get-prescriptions-by-filters`, { params }).pipe(
    // return this.http.get<ApiResponse<Pagination<PrescriptionResponse>>>(`http://localhost:8094/api/prescriptions/get-prescriptions-by-filters`, { params }).pipe(
      map((response: ApiResponse<Pagination<PrescriptionResponse>>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API: ' + response.applicationProvider);
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch prescriptions'));
      })
    );
  }

  getByCode(code: string): Observable<PrescriptionResponse> {
    return this.http.get<ApiResponse<PrescriptionResponse>>(`${this.apiUrl}/by-code/${code}`).pipe(
      map((response: ApiResponse<PrescriptionResponse>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch prescription by code'));
      })
    );
  }

  getByCodePrefix(code: string): Observable<PrescriptionResponse[]> {
    const params = new HttpParams().set('code', code);
    return this.http.get<ApiResponse<PrescriptionResponse[]>>(`${this.apiUrl}/search-available-Prescriptions-by-code`, { params }).pipe(
      map((response: ApiResponse<PrescriptionResponse[]>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('API error: ' + response.status);
        }
      }),
      catchError(error => {
        console.error('Search by code failed:', error);
        return throwError(() => new Error('Failed to search prescriptions by code'));
      })
    );
  }
  
}
