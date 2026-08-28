import { Component, Input, Output, EventEmitter, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  /** Mensaje de éxito (no de error) — p. ej. al volver de definir la clave. */
  aviso: string | null = null;

  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar,
              private route: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      // La sesión anterior quedó con la clave vieja: al volver de definir una nueva hay que
      // limpiar también este flag, o el registro decidiría con el dato del login anterior.
      localStorage.removeItem("mustChangePassword");
    }

    // Vuelve de definir su clave por el link. Se le prellena el CJP y se le avisa, en vez de
    // dejarlo frente a un formulario vacío sin saber si la operación funcionó.
    const params = this.route.snapshot.queryParamMap;
    if (params.get('clave') === 'definida') {
      const cjp = params.get('cjp');
      if (cjp) { this.ngForm.get('cjp')?.setValue(cjp); }
      this.aviso = 'Tu clave quedó definida. Ingresá con ella para entrar.';
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
