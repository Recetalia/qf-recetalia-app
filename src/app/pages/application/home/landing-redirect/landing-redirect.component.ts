import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../../../../services/auth.service';

@Component({ selector: 'app-landing-redirect', template: '' })
export class LandingRedirectComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}
  ngOnInit(): void {
    this.authService.getCurrentUser().pipe(filter(u => !!u), take(1)).subscribe({
      next: (user: any) => {
        const target = user.role === 'ROLE_PHARMACY_ADMIN' ? ['dashboard'] : ['prescriptions/search'];
        this.router.navigate(target);
      },
      error: () => this.router.navigate(['prescriptions/search']),
    });
  }
}
