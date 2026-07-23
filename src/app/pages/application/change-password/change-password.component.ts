import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { generateDynamicInfo, encryptPassword } from '../../../shared/utils/crypto.util';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  form: FormGroup = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirm: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  error: string | null = null;

  constructor(private authService: AuthService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  get passwordControl() {
    return this.form.get('password')!;
  }

  get confirmControl() {
    return this.form.get('confirm')!;
  }

  onSubmit(): void {
    this.error = null;
    if (this.form.invalid || this.form.value.password !== this.form.value.confirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    const email = (isPlatformBrowser(this.platformId) ? localStorage.getItem('qf_email') : null) ?? '';
    const info = generateDynamicInfo();
    const enc = encryptPassword(this.form.value.password, info);
    this.authService.renewPassword(email, enc, info).subscribe({
      next: () => {
        this.authService.clearToken();
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('qf_email');
        }
        this.router.navigate(['/login'], { queryParams: { changed: 1 } });
      },
      error: () => { this.error = 'No se pudo cambiar la contraseña'; }
    });
  }
}
