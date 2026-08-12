import { Component, Input, Output, EventEmitter, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { generateDynamicInfo, encryptPassword } from '../../../shared/utils/crypto.util';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  ngForm: FormGroup = new FormGroup({
    cjp: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  @Input() error: string | null = null;
  @Output() submitEM = new EventEmitter();

  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
  }

  get cjpControl() {
    return this.ngForm.get('cjp')!;
  }

  get passwordControl() {
    return this.ngForm.get('password')!;
  }

  onSubmit(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
    const cjp = (this.ngForm.get('cjp')?.value ?? '').toString().trim();
    const email = `${cjp}@${environment.qfEmailDomain}`;
    const dynamicInfo = generateDynamicInfo();
    const encryptedPassword = encryptPassword(this.ngForm.get('password')?.value, dynamicInfo);

    this.authService.login(email, encryptedPassword, dynamicInfo).subscribe({
      next: (answer) => {
        if (answer?.mustChangePassword) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('qf_email', email);
          }
          this.router.navigate(['/registro']);
        } else {
          this.router.navigate(['']);
        }
      },
      error: (error: HttpErrorResponse) => {
        let errorMessage = 'CJP o contraseña incorrectos';
        if (error.error) {
          const response = error.error;
          if (response.status === 'ERROR') {
            const serverMsg: string = response.answer;
            if (typeof serverMsg === 'string' && serverMsg.includes('User not found')) {
              errorMessage = 'El CJP es incorrecto. Intente nuevamente.';
            } else if (typeof serverMsg === 'string' && serverMsg.includes('Credencial')) {
              errorMessage = 'La contraseña es incorrecta. Intente nuevamente.';
            }
          }
        }
        this.openSnackBar(errorMessage, 'error');
        console.error('Login failed', error);
      }
    });
  }

  openSnackBar(message: string, type: string) {
    this._snackBar.open(message, 'X', {
      duration: 6000
    });
  }

}
