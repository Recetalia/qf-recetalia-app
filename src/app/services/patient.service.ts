import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientRequest } from '../model/request/patient-request'; 
import { PatientResponse } from '../model/response/patient-response'; 
import { environment } from '../../environments/environment';
import { ApiResponse } from '../model/response/api-response'; 
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private Url = environment.apiUrl;
  private apiUrl = `${this.Url}/patients`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<PatientResponse[]> {
    return this.http.get<ApiResponse<PatientResponse[]>>(this.apiUrl).pipe(
      map((response: ApiResponse<PatientResponse[]>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch patients'));
      })
    );
  }

  getById(id: string): Observable<PatientResponse> {
    return this.http.get<ApiResponse<PatientResponse>>(`${this.apiUrl}/${id}`).pipe(
      map((response: ApiResponse<PatientResponse>) => {
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

  create(patient: PatientRequest): Observable<PatientResponse> {
    return this.http.post<ApiResponse<PatientResponse>>(this.apiUrl, patient).pipe(
      map((response: ApiResponse<PatientResponse>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to create patient record'));
      })
    );
  }

  update(id: string, patient: PatientRequest): Observable<PatientResponse> {
    return this.http.put<ApiResponse<PatientResponse>>(`${this.apiUrl}/${id}`, patient).pipe(
      map((response: ApiResponse<PatientResponse>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to update patient record'));
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
        return throwError(() => new Error('Failed to delete patient record'));
      })
    );
  }

  getPatiensByMedicalProvider(idProvider: string): Observable<PatientResponse> {
    return this.http.get<ApiResponse<PatientResponse>>(`${this.apiUrl}/by-provider?medicalProviderId=${idProvider}`).pipe(
      map((response: ApiResponse<PatientResponse>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch patients by medical provider'));
      })
    );
  }

  getPatiensByMedic(): Observable<PatientResponse[]> {
    return this.http.get<ApiResponse<PatientResponse[]>>(`${this.apiUrl}/by-medic`).pipe(
      map((response: ApiResponse<PatientResponse[]>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch patients by medical provider'));
      })
    );
  }

  searchPatients(
    name?: string,
    lastName?: string,
    document?: string
  ): Observable<PatientResponse[]> {
    // Build query parameters
    let params: string[] = [];
    if (name) params.push(`name=${encodeURIComponent(name)}`);
    if (lastName) params.push(`lastName=${encodeURIComponent(lastName)}`);
    if (document && !isNaN(Number(document))) {
      params.push(`document=${encodeURIComponent(document)}`);
    }
    
    const queryString = params.length ? `?${params.join('&')}` : '';
  
    return this.http.get<ApiResponse<PatientResponse[]>>(`${this.apiUrl}/search${queryString}`).pipe(
      map((response: ApiResponse<PatientResponse[]>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to search patients'));
      })
    );
  }

  getByDocumentNumberAndType(documentNumber: string, documentType: string): Observable<PatientResponse> {
    return this.http.get<ApiResponse<PatientResponse>>(
      `${this.apiUrl}/document_number/${documentNumber}/document_type/${documentType}`
    ).pipe(
      map((response: ApiResponse<PatientResponse>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Patient not found');
        }
      }),
      catchError((error) => {
        console.error('Error fetching patient:', error);
        return throwError(() => new Error('Patient not found'));
      })
    );
  }  
}

