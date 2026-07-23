import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Los endpoints de auth (login, renew-password, etc.) NO deben llevar el Bearer:
    // security-api tiene oauth2ResourceServer y rechaza (401) cualquier token en su
    // resource-server, aunque el endpoint sea permitAll. Con el header, el cambio de
    // contraseña (renew-password) fallaba con 401 solo desde el browser.
    const isAuthEndpoint = req.url.includes('/security-api-recetalia/api/auth/');

    const token = this.authService.getToken();
    const requestToHandle = (token && !isAuthEndpoint)
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

    return next.handle(requestToHandle).pipe(
      catchError((error: HttpErrorResponse) => {
        // No desloguear ante un 401 de los propios endpoints de auth (login/renew):
        // ahí el 401 es "credenciales inválidas", no una sesión vencida.
        if (error.status === 401 && !isAuthEndpoint) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
