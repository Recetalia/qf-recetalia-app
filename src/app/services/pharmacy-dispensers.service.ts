import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../model/response/api-response';
import { PharmacyDispenserResponse } from '../model/response/pharmacy-dispenser-response'; 
import { PharmacyDispenserRequest } from '../model/request/pharmacy-dispenser-request'; 

@Injectable({
  providedIn: 'root'
})
export class PharmacyDispensersService {
  private baseUrl = `${environment.apiUrl}/pharmacy-dispensers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PharmacyDispenserResponse[]> {
    return this.http.get<ApiResponse<PharmacyDispenserResponse[]>>(this.baseUrl).pipe(
      map(response => {
        if (response.status === 'SUCCESS') return response.answer;
        throw new Error('API error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to get dispensers:', error);
        return throwError(() => new Error('Failed to get dispensers'));
      })
    );
  }

    getAllPharmacyToken(): Observable<PharmacyDispenserResponse[]> {
    return this.http.get<ApiResponse<PharmacyDispenserResponse[]>>(this.baseUrl + '/pharmacy').pipe(
      map(response => {
        if (response.status === 'SUCCESS') return response.answer;
        throw new Error('API error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to get dispensers:', error);
        return throwError(() => new Error('Failed to get dispensers'));
      })
    );
  }

  create(data: PharmacyDispenserRequest): Observable<PharmacyDispenserResponse> {
    return this.http.post<ApiResponse<PharmacyDispenserResponse>>(this.baseUrl, data).pipe(
      map(response => {
        if (response.status === 'SUCCESS') return response.answer;
        throw new Error('API error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to create dispenser:', error);
        return throwError(() => new Error('Failed to create dispenser'));
      })
    );
  }

  update(id: string, data: PharmacyDispenserRequest): Observable<PharmacyDispenserResponse> {
    return this.http.put<ApiResponse<PharmacyDispenserResponse>>(`${this.baseUrl}/${id}`, data).pipe(
      map(response => {
        if (response.status === 'SUCCESS') return response.answer;
        throw new Error('API error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to update dispenser:', error);
        return throwError(() => new Error('Failed to update dispenser'));
      })
    );
  }

  search(name: string, lastName: string, document: string): Observable<PharmacyDispenserResponse[]> {
    const query = `?name=${encodeURIComponent(name)}&lastName=${encodeURIComponent(lastName)}&document=${encodeURIComponent(document)}`;
    return this.http.get<ApiResponse<PharmacyDispenserResponse[]>>(`${this.baseUrl}/search${query}`).pipe(
      map(response => {
        if (response.status === 'SUCCESS') return response.answer;
        throw new Error('API error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to search dispensers:', error);
        return throwError(() => new Error('Failed to search dispensers'));
      })
    );
  }

  getByPharmacy(data: PharmacyDispenserRequest): Observable<PharmacyDispenserResponse[]> {
    return this.http.post<ApiResponse<PharmacyDispenserResponse[]>>(`${this.baseUrl}/pharmacy`, data).pipe(
      map(response => {
        if (response.status === 'SUCCESS') return response.answer;
        throw new Error('API error: ' + response.applicationProvider);
      }),
      catchError(error => {
        console.error('Failed to get by pharmacy:', error);
        return throwError(() => new Error('Failed to get by pharmacy'));
      })
    );
  }

    getById(id: string): Observable<PharmacyDispenserResponse> {
    return this.http.get<ApiResponse<PharmacyDispenserResponse>>(`${this.baseUrl}/${id}`).pipe(
      map((response: ApiResponse<PharmacyDispenserResponse>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch patient details'));
      })
    );
  }
}
