import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../model/response/api-response';
import { Page } from '../model/page';
import { PharmacyResponse } from '../model/response/pharmacy-response';
import { DispensationSearchRow } from '../model/response/dispensation-search-row';
import { PharmaceuticalDirectorMeResponse } from '../model/response/pharmaceutical-director-me-response';
import { QfPharmacyReviewRow } from '../model/response/qf-pharmacy-review-row';

@Injectable({ providedIn: 'root' })
export class PharmaceuticalDirectorService {
  private base = `${environment.apiUrl}/pharmaceutical-director`;

  constructor(private http: HttpClient) {}

  getMyPharmacies(): Observable<PharmacyResponse[]> {
    return this.http.get<ApiResponse<PharmacyResponse[]>>(`${this.base}/pharmacies`)
      .pipe(map(r => r.answer));
  }

  getGreenDispensations(pharmacyId: string, opts: { startDate?: string; endDate?: string; page?: number; size?: number; sort?: string }):
      Observable<Page<DispensationSearchRow>> {
    let params = new HttpParams().set('pharmacyId', pharmacyId)
      .set('page', String(opts.page ?? 0)).set('size', String(opts.size ?? 10));
    if (opts.sort) params = params.set('sort', opts.sort);
    if (opts.startDate) params = params.set('startDate', opts.startDate);
    if (opts.endDate) params = params.set('endDate', opts.endDate);
    return this.http.get<ApiResponse<Page<DispensationSearchRow>>>(`${this.base}/green-dispensations`, { params })
      .pipe(map(r => r.answer));
  }

  /**
   * «Olvidé mi contraseña»: pide que le manden el link a su correo declarado.
   *
   * Público, sin token. El backend responde lo mismo exista o no el CJP —si contestara
   * distinto sería un enumerador del padrón—, así que acá no hay nada que distinguir: se
   * muestra siempre el mismo mensaje.
   */
  forgotPassword(cjp: string): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.base}/forgot-password`, { cjp })
      .pipe(map(r => r.answer));
  }

  getMe(): Observable<PharmaceuticalDirectorMeResponse> {
    return this.http.get<ApiResponse<PharmaceuticalDirectorMeResponse>>(`${this.base}/me`)
      .pipe(map(r => r.answer));
  }

  register(body: {
    name: string; lastname: string;
    document: { number: string; type: string } | null;
    email: string | null; phone: any | null;
    // null cuando el QF ya definió su clave por el link de invitación: el backend, si no
    // viene, no la toca.
    password: string | null; info: string | null;
  }): Observable<PharmaceuticalDirectorMeResponse> {
    return this.http.post<ApiResponse<PharmaceuticalDirectorMeResponse>>(`${this.base}/register`, body)
      .pipe(map(r => r.answer));
  }

  /**
   * Las farmacias que declaran a este QF, con su decisión. `decision === null` = pendiente.
   * Es lo que mira el guard para saber si tiene que bloquearlo en la pantalla de validación.
   */
  getMyPharmaciesToReview(): Observable<QfPharmacyReviewRow[]> {
    return this.http.get<ApiResponse<QfPharmacyReviewRow[]>>(`${this.base}/my-pharmacies`)
      .pipe(map(r => r.answer));
  }

  /**
   * Manda la tanda entera de decisiones. Una sola llamada y no una por farmacia: las
   * rechazadas se avisan a Recetalia con UN mail que las lista, y eso se arma del lado del
   * backend con la tanda completa.
   */
  decidePharmacies(decisions: { pharmacyId: string; decision: 'ACCEPTED' | 'REJECTED' }[]): Observable<number> {
    return this.http.post<ApiResponse<number>>(`${this.base}/my-pharmacies/decisions`, decisions)
      .pipe(map(r => r.answer));
  }

  control(dispensationId: string): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/dispensations/${dispensationId}/control`, {})
      .pipe(map(r => r.answer));
  }
}
