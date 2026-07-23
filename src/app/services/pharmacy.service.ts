import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PharmacyRequest } from '../model/request/pharmacy-request';
import { PharmacyResponse } from '../model/response/pharmacy-response';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../model/response/api-response';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {
  private baseUrl = `${environment.apiUrl}/pharmacies`;

  constructor(private http: HttpClient) { }

  create(pharmacy: PharmacyRequest): Observable<PharmacyResponse> {
    return this.http.post<ApiResponse<PharmacyResponse>>(this.baseUrl, pharmacy).pipe(
      map(response => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        }
        throw new Error('API responded with error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to create pharmacy:', error);
        // Propagar el mensaje específico del backend (GenericResponse.answer), p. ej.
        // "El email ya está registrado.", en vez de un genérico.
        const msg = error?.error?.answer || error?.message || 'No se pudo completar el registro. Intentá nuevamente.';
        return throwError(() => new Error(msg));
      })
    );
  }

  getAll(): Observable<PharmacyResponse[]> {
    return this.http.get<ApiResponse<PharmacyResponse[]>>(this.baseUrl).pipe(
      map(response => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        }
        throw new Error('API responded with error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to fetch pharmacies:', error);
        return throwError(() => new Error('Failed to fetch pharmacies'));
      })
    );
  }

  getById(id: string): Observable<PharmacyResponse> {
    return this.http.get<ApiResponse<PharmacyResponse>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        }
        throw new Error('API responded with error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to fetch pharmacy:', error);
        return throwError(() => new Error('Failed to fetch pharmacy'));
      })
    );
  }

  getByEmail(email: string): Observable<PharmacyResponse> {
    return this.http.get<ApiResponse<PharmacyResponse>>(`${this.baseUrl}/email/${email}`).pipe(
      map(response => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        }
        throw new Error('API responded with error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to fetch pharmacy:', error);
        return throwError(() => new Error('Failed to fetch pharmacy'));
      })
    );
  }


  update(id: string, pharmacy: PharmacyRequest): Observable<PharmacyResponse> {
    return this.http.put<ApiResponse<PharmacyResponse>>(`${this.baseUrl}/${id}`, pharmacy).pipe(
      map(response => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        }
        throw new Error('API responded with error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to update pharmacy:', error);
        return throwError(() => new Error('Failed to update pharmacy'));
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (response.status === 'SUCCESS') {
          return;
        }
        throw new Error('API responded with error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to delete pharmacy:', error);
        return throwError(() => new Error('Failed to delete pharmacy'));
      })
    );
  }

  getByFranchise(franchiseId: string): Observable<PharmacyResponse[]> {
    return this.http.get<ApiResponse<PharmacyResponse[]>>(`${this.baseUrl}/by-franchise/${franchiseId}`).pipe(
      map(response => {
        if (response.status === 'SUCCESS') { return response.answer; }
        throw new Error('API responded with error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to fetch pharmacies by franchise:', error);
        return throwError(() => new Error('Failed to fetch pharmacies by franchise'));
      })
    );
  }

  /**
  * validate Pharmacy by Email
  * @param email Pharmacy Email
  */
  validateExistByEmail(email: string): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/email-exists/${email}`).pipe(
      map((response: ApiResponse<boolean>) => {
        if (response.status === 'SUCCESS') {
          console.log(response.answer);
          return response.answer;
        } else {
          throw new Error('Error response from the API: ' + response.applicationProvider);
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch data from the API'));
      })
    );
  }
}
