import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiResponse } from '../model/response/api-response';
import { LocalityResponse } from '../model/response/locality-response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalityService {

  private apiUrl = `${environment.apiUrl}/localities`;

  constructor(private http: HttpClient) { }

  /**
   * Retrieves all localities for a specific region.
   *
   * @param regionId The ID of the region.
   * @returns an observable containing a list of LocalityResponse
   */
  getLocalitiesByRegionId(regionId: string): Observable<LocalityResponse[]> {
    return this.http.get<ApiResponse<LocalityResponse[]>>(`${this.apiUrl}/region/${regionId}`).pipe(
      map((response: ApiResponse<LocalityResponse[]>) => {
        if (response.status === 'SUCCESS') {
          return response.answer;
        } else {
          throw new Error('Error response from the API');
        }
      }),
      catchError(error => {
        console.error('Failed to fetch localities:', error);
        return throwError(() => new Error('Failed to fetch localities'));
      })
    );
  }
}
