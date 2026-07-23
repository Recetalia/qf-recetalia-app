import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiResponse } from '../model/response/api-response';
import { RegionResponse } from '../model/response/region-response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegionService {

  private apiUrl = `${environment.apiUrl}/regions`;

  constructor(private http: HttpClient) { }

  /**
   * Retrieves all regions.
   *
   * @returns an observable containing a list of RegionResponse
   */
  getAllRegions(): Observable<RegionResponse[]> {
    return this.http.get<ApiResponse<RegionResponse[]>>(this.apiUrl).pipe(
      map((response: ApiResponse<RegionResponse[]>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('Failed to fetch regions:', error);
        return throwError(() => new Error('Failed to fetch regions'));
      })
    );
  }
}
