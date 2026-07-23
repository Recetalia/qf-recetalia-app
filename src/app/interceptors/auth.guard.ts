import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser();
  const allowed = (route.data?.['roles'] as string[]) ?? ['ROLE_PHARMACEUTICAL_DIRECTOR'];
  if (user && allowed.includes(user.role)) {
    return true;
  }
  console.warn('Access denied - Redirecting to login');
  router.navigate(['/login']);
  return false;
};
