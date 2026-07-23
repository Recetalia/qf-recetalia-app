import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { LaboratorioResponse } from '../model/response/laboratorio-response';
import { AnswerMap, AnswerMapLaboratorio, ApiResponse } from '../model/response/api-response';

@Injectable({
  providedIn: 'root'
})
export class LaboratorioService {

  private apiUrl = `${environment.apiUrl}/laboratorios`;
  
    constructor(private http: HttpClient) { }
  
    getAllLaboratory(): Observable<LaboratorioResponse[]> {
      return this.http.get<ApiResponse<AnswerMapLaboratorio>>(`${this.apiUrl}`).pipe(
        map((response: ApiResponse<AnswerMapLaboratorio>) => {
          if (response.status === 'SUCCESS') {
            // Extract the `answer` object values as an array of `LaboratorioResponse`
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
