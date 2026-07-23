import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../model/response/api-response';
import { FranchiseResponse } from '../model/response/franchise-response'; 

@Injectable({
  providedIn: 'root'
})
export class FranchiseService {

  private apiUrl = `${environment.apiUrl}/franchises`;

  constructor(private http: HttpClient) {}

  /**
   * Retrieves all franchises from the backend.
   *
   * @returns an observable with a list of FranchiseResponse
   */
  getAllFranchises(): Observable<FranchiseResponse[]> {
    return this.http.get<ApiResponse<FranchiseResponse[]>>(this.apiUrl).pipe(
      map((response: ApiResponse<FranchiseResponse[]>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('API responded with an error');
        }
      }),
      catchError(error => {
        console.error('Error fetching franchises:', error);
        return throwError(() => new Error('Failed to fetch franchises'));
      })
    );
  }

  getByAdminEmail(email: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/by-admin-email/${email}`).pipe(
      map(r => { if (r.status === 'SUCCESS') return r.answer; throw new Error('API error'); }),
      catchError(err => { console.error('getByAdminEmail failed', err); return throwError(() => new Error('Failed')); })
    );
  }
}
