import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from "jwt-decode";
import { environment } from '../../environments/environment';
import { AuthResponse } from '../model/response/Auth-response';
import { isPlatformBrowser } from '@angular/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyResponse } from '../model/response/pharmacy-response';
import { FranchiseService } from './franchise.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private securityApiRecetaliaUrl = environment.securityApiRecetaliaUrl;
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object, private pharmacyService: PharmacyService, private franchiseService: FranchiseService) { }

  login(email: string, password: string, info: string): Observable<any> {

    return this.http.post<any>(this.securityApiRecetaliaUrl + '/login', { email, password, info }).pipe(
      tap((response: AuthResponse) => {

        this.setToken(response.answer.token);
        this.setRole(response.answer.role);
      })
    );
  }

  requestReset(email: string, url: string): Observable<any> {

    return this.http.post<any>(this.securityApiRecetaliaUrl + '/request-reset', { email, url }).pipe(
      tap((response: AuthResponse) => {
        console.log(response.answer.token);
      })
    );
  }


  resetPassword(token: string, newPassword: string) {
    return this.http.post<any>(this.securityApiRecetaliaUrl +'/reset-password', {
      token,
      newPassword
    });
  }


  logout(): void {
    this.clearToken();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null; // or handle it appropriately
  }

  getRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('role');
    }
    return null; // or handle it appropriately
  }

  setToken(token: string): void {

    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  setRole(role: string): void {
    localStorage.setItem('role', role);
  }

  clearToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getEmailFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token); // Use the named import here
      return decodedToken.mail; // Extract the email from the token
    }
    return null;
  }

  getCurrentUser(): Observable<{ email: string; role: string; status: string; pharmacyId: string; franchiseId?: string } | null> {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken.role === 'ROLE_PHARMACY_ADMIN') {
          return this.franchiseService.getByAdminEmail(decodedToken.mail).pipe(
            map((f: any) => ({
              email: decodedToken.mail, role: decodedToken.role, status: 'ACTIVE',
              pharmacyId: '', franchiseId: f?.id,
            })),
            catchError(() => new Observable<null>(o => o.next(null))),
          );
        }
        return this.pharmacyService.getByEmail(decodedToken.mail).pipe(
          map((data: PharmacyResponse) => ({
            email: decodedToken.mail,
            role: decodedToken.role,
            status: data.status,
            pharmacyId: data.id,
            franchiseId: data.franchiseId,
          }))
        );
      } catch (error) {
        console.error('Error decoding token', error);
        return new Observable(observer => observer.next(null));
      }
    }
    return new Observable(observer => observer.next(null));
  }

}

