import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../model/response/api-response';
import { MedicResponse } from '../model/response/medic-response'; // Make sure the path is correct
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MedicRequest } from '../model/request/medic-request';

@Injectable({
  providedIn: 'root'
})
export class MedicsService {
  private Url = environment.apiUrl;
  private apiUrl = `${this.Url}/medics`;  // Assuming the API endpoint is /api/medics

  constructor(private http: HttpClient) { }

  /**
   * Create a new Medic
   * @param medic The Medic to be created
   */
  create(medic: MedicRequest): Observable<MedicResponse> {
    if(medic.especialityId == null) {
       console.log(medic);
       return throwError(() => new Error('Failed to create medic'));;
    }

    return this.http.post<ApiResponse<MedicResponse>>(this.apiUrl, medic).pipe(
      map((response: ApiResponse<MedicResponse>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API: ' + response.applicationProvider);
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to create medic'));
      })
    );
  }

  /**
   * Get all Medics
   */
  getAll(): Observable<MedicResponse[]> {
    return this.http.get<ApiResponse<MedicResponse[]>>(this.apiUrl).pipe(
      map((response: ApiResponse<MedicResponse[]>) => {
        if (response.status === 'SUCCESS') {
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

  /**
   * Get Medic by ID
   * @param id Medic ID
   */
  getById(id: string): Observable<MedicResponse> {
    return this.http.get<ApiResponse<MedicResponse>>(`${this.apiUrl}/${id}`).pipe(
      map((response: ApiResponse<MedicResponse>) => {
        if (response.status === 'SUCCESS') {
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

  /**
  * validate Medic by Email
  * @param email Medic Email
  */
  validateExistByEmail(email: string): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/email-exists/${email}`).pipe(
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

  /**
  * Get Medic by Email
  * @param email Medic Email
  */
  getByEmail(email: string): Observable<MedicResponse> {
    return this.http.get<ApiResponse<MedicResponse>>(`${this.apiUrl}/email/${email}`).pipe(
      map((response: ApiResponse<MedicResponse>) => {
        if (response.status === 'SUCCESS') {
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

  /**
   * Update an existing Medic
   * @param id Medic ID
   * @param medic The updated Medic data
   */
  update(id: string, medic: MedicRequest): Observable<MedicResponse> {
    return this.http.put<ApiResponse<MedicResponse>>(`${this.apiUrl}/${id}`, medic).pipe(
      map((response: ApiResponse<MedicResponse>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API: ' + response.applicationProvider);
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to update medic'));
      })
    );
  }

  /**
   * Delete a Medic by ID
   * @param id Medic ID
   */
  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map((response: ApiResponse<void>) => {
        if (response.status === 'SUCCESS') {
          return;
        } else {
          throw new Error('Error response from the API: ' + response.applicationProvider);
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to delete medic'));
      })
    );
  }

  search(medicalProviderId: string, searchCriteria: string): Observable<MedicResponse[]> {
    const searchUrl = `${this.apiUrl}/search?medicalProviderId=${medicalProviderId}&searchCriteria=${searchCriteria}`;
    return this.http.get<ApiResponse<MedicResponse[]>>(searchUrl).pipe(
      map((response: ApiResponse<MedicResponse[]>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          // Handle the case where status is "ERROR"
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        // Handle the error accordingly, such as returning an empty array or re-throwing the error
        return throwError(() => new Error('Failed to fetch data from the API'));
      })
    );
  }
}
