import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../model/response/api-response';
import { Especialities } from '../model/response/especialities-response';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EspecialitiesService {
  private Url = environment.apiUrl;
  private apiUrl = `${this.Url}/especialities`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Especialities[]> {
    return this.http.get<ApiResponse<Especialities[]>>(this.apiUrl).pipe(
      map((response: ApiResponse<Especialities[]>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API: ' +  response.applicationProvider);
        }
      }),
      catchError(error => {
        console.error('API request failed:', error);
        return throwError(() => new Error('Failed to fetch data from the API'));
      })
    );
  }

}
