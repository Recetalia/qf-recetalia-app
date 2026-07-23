import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from "jwt-decode";
import { environment } from '../../environments/environment';
import { AuthResponse, Answer } from '../model/response/Auth-response';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private securityApiRecetaliaUrl = environment.securityApiRecetaliaUrl;
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  login(email: string, password: string, info: string): Observable<Answer> {

    return this.http.post<AuthResponse>(this.securityApiRecetaliaUrl + '/login', { email, password, info }).pipe(
      tap((response: AuthResponse) => {
        this.setToken(response.answer.token);
        this.setRole(response.answer.role);
      }),
      map((response: AuthResponse) => response.answer)
    );
  }

  renewPassword(email: string, encryptedPassword: string, info: string): Observable<any> {
    // El endpoint valida @NotBlank sobre TODO el UserRequest (username/role/applicationApiKey),
    // aunque el servicio solo use email+password. Se completan para pasar la validación (si no, 500).
    return this.http.post(`${this.securityApiRecetaliaUrl}/renew-password`,
      { username: email, email, password: encryptedPassword,
        role: 'ROLE_PHARMACEUTICAL_DIRECTOR', applicationApiKey: 'qf-recetalia-app', info });
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

  getCurrentUser(): { email: string; role: string; cjp: string } | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      const mail: string = decoded?.mail ?? '';
      const cjp = mail.includes('@') ? mail.substring(0, mail.indexOf('@')) : mail;
      return { email: mail, role: decoded?.role ?? '', cjp };
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }

}
