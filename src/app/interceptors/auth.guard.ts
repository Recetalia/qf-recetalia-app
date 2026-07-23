import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router); // Inject the Router to enable redirection
  const user = authService.getCurrentUser();
  const roles = route.data['roles'] as Array<string>;

  return authService.getCurrentUser().pipe(
    map(user => {
      if (user && roles.includes(user.role)) {
        if(user.status === 'INACTIVE') {
          console.warn('User ' + user.status);
         // router.navigate(['/login']); // Redirect to login
         // return false;
        }

        return true; // User is authenticated and has the correct role
      }

      console.warn('Access denied - Redirecting to login');
      router.navigate(['/login']); // Redirect to login
      return false;
    }),
    catchError(error => {
      console.error('Error in auth guard:', error);
      router.navigate(['/login']); // Redirect to login on error
      return of(false); // Ensure the guard returns a value
    })
  );
};
