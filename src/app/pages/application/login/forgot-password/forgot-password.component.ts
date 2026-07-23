import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, Renderer2, ViewEncapsulation, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import * as CryptoJS from 'crypto-js';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  ngForm: FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
  });

  sendRequestReset: boolean = false;
  hasCode: boolean = false;
  resetToken: string = '';
  registerForm!: FormGroup; // separate form for resetting password


  @Input() error: string | null = null;
  @Output() submitEM = new EventEmitter();

  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar, private route: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }

    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.hasCode = true;
        this.resetToken = code; // optionally save token for the reset password submission
        this.initResetForm();
      }
    });
  }

  initResetForm() {
    this.registerForm = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      passwordConfirm: new FormControl('', Validators.required)
    }, null, null); // validators are not passed here

    // Apply validator separately
    this.registerForm.setValidators(this.passwordMatchValidator);
  }

  passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('passwordConfirm')?.value;
    return password === confirm ? null : { mismatch: true };
  }
  onResetSubmit(): void {
    if (!this.registerForm.valid || !this.resetToken) {
      return;
    }

    const password = this.registerForm.get('password')?.value;

    this.authService.resetPassword(this.resetToken, password).subscribe(
      res => {
        this._snackBar.open('La contraseña fue restablecida con éxito', 'X', { duration: 6000 });
        this.router.navigate(['/login']);
      },
      (error: HttpErrorResponse) => {
        let msg = 'No se pudo cambiar la contraseña. Intente de nuevo.';
        if (error.error?.answer) {
          msg = error.error.answer;
        }
        this._snackBar.open(msg, 'X', { duration: 6000 });
      }
    );
  }

  get usernameControl() {
    return this.ngForm.get('username')!;
  }

  onSubmit(): void {

    // Call the login service with the encrypted password and dynamicInfo
    this.authService.requestReset(this.ngForm.get('username')?.value, window.location.href).subscribe(
      (response) => {
        this.sendRequestReset = true;
      },
      (error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred. Please contact technical support.';
        // Check the error response and set the message accordingly
        if (error.error) {
          const response = error.error;
          if (response.status === 'ERROR') {
            errorMessage = response.answer; // Use the error message from the server
            if (errorMessage.includes('User not found')) {
              errorMessage = 'The username is incorrect. Please try again.';
            }
          }
        }

        this.openSnackBar(errorMessage, 'error');
        console.error('Login failed', error);
      }
    );
  }

  // Function to ensure the key is 32 bytes (padding or truncating if needed)
  padOrTruncateKey(key: string): string {
    const maxLength = 32; // AES key must be 16, 24, or 32 bytes
    if (key.length > maxLength) {
      return key.slice(0, maxLength);  // Truncate if too long
    } else {
      return key.padEnd(maxLength, '0');  // Pad with '0' if too short
    }
  }

  openSnackBar(message: string, type: string) {
    this._snackBar.open(message, 'X', {
      duration: 6000
    });
  }

  cancel() {
    this.router.navigate(['']);
  }

}
