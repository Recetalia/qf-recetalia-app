import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiResponse, AnswerMap } from '../model/response/api-response';
import { MedicineResponse } from '../model/response/medicine-response';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AmpService {
  private apiUrl = `${environment.apiUrl}/amp/`;

  constructor(private http: HttpClient) { }

  getSearchByprodMspLike(prod: string): Observable<MedicineResponse[]> {
    return this.http.get<ApiResponse<AnswerMap>>(`${this.apiUrl}search?prodMspLike=${prod}`).pipe(
      map((response: ApiResponse<AnswerMap>) => {
        if (response.status === 'SUCCESS') {
          // Extract the `answer` object values as an array of `MedicineResponse`
          return Object.values(response.answer);
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
