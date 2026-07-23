import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../model/response/api-response';
import { AmppResponse } from '../model/response/ampp-response';

@Injectable({
  providedIn: 'root'
})
export class AmppService {
  private apiUrl = `${environment.apiUrl}/ampp`;

  constructor(private http: HttpClient) {}

  getAmppsByProdMspLike(prodMspLike: string): Observable<AmppResponse[]> {
    const url = `${this.apiUrl}/search?prodMspLike=${encodeURIComponent(prodMspLike)}`;
    return this.http.get<ApiResponse<AmppResponse[]>>(url).pipe(
      map((response) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('API error: ' + response.status);
        }
      }),
      catchError((error) => {
        console.error('AMPP API request failed:', error);
        return throwError(() => new Error('Failed to fetch AMPPs'));
      })
    );
  }

    getAmppsByAmpId(ampId: string): Observable<AmppResponse[]> {
    const url = `${this.apiUrl}/search/amp?ampId=${encodeURIComponent(ampId)}`;
    return this.http.get<ApiResponse<AmppResponse[]>>(url).pipe(
      map((response) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('API error: ' + response.status);
        }
      }),
      catchError((error) => {
        console.error('AMPP API request failed:', error);
        return throwError(() => new Error('Failed to fetch AMPPs'));
      })
    );
  }
}
