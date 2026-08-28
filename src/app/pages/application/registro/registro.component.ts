import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { PharmaceuticalDirectorService } from '../../../services/pharmaceutical-director.service';
import { PharmaceuticalDirectorMeResponse } from '../../../model/response/pharmaceutical-director-me-response';
import { PharmacyResponse } from '../../../model/response/pharmacy-response';
import { generateDynamicInfo, encryptPassword } from '../../../shared/utils/crypto.util';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {

  form!: FormGroup;
  me: PharmaceuticalDirectorMeResponse | null = null;
  pharmacies: PharmacyResponse[] = [];
  loading = true;
  saving = false;
  error: string | null = null;

  /** El CJP figura con más de un titular: no es una identidad y no puede registrarse. */
  enRevision = false;

  /**
   * Si hay que pedirle la contraseña acá.
   *
   * Hay dos formas de llegar a esta pantalla: con una clave que le asignó Gestión (y este es
   * el momento de cambiarla), o desde el link de invitación, donde YA la definió en
   * /definir-clave. En el segundo caso pedírsela otra vez lo mandaba a definir la que acababa
   * de definir — visto en producción el 2026-08-27.
   */
  pideClave = true;

  constructor(
    private fb: FormBuilder,
    private pd: PharmaceuticalDirectorService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      documentType: ['UY'],
      documentNumber: [''],
      email: ['', Validators.email],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.pideClave = this.authService.mustChangePassword();
    if (!this.pideClave) {
      // Sacar los validadores además de ocultar los campos: un `required` sobre un input que
      // no se muestra deja el botón muerto sin nada visible que lo explique.
      ['password', 'confirm'].forEach(c => {
        this.form.get(c)?.clearValidators();
        this.form.get(c)?.updateValueAndValidity();
      });
    }

    this.pd.getMe().subscribe({
      next: (me) => {
        this.me = me;
        this.pharmacies = me.pharmacies ?? [];
        this.enRevision = me.status === 'NEEDS_REVIEW';

        // Los datos vienen de lo que cargó la farmacia; el QF los verifica y corrige.
        this.form.patchValue({
          name: me.name ?? '',
          lastname: me.lastname ?? '',
          documentType: me.document?.type ?? 'UY',
          documentNumber: me.document?.number ?? '',
          email: me.email ?? '',
        });

        if (this.enRevision) { this.form.disable(); }
        this.loading = false;
      },
      error: () => {
        this.error = 'No pudimos cargar tus datos. Volvé a entrar.';
        this.loading = false;
      }
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.error = null;
    if (this.enRevision) { return; }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    if (this.pideClave && v.password !== v.confirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.saving = true;
    const info = generateDynamicInfo();
    this.pd.register({
      name: v.name,
      lastname: v.lastname,
      document: v.documentNumber ? { number: v.documentNumber, type: v.documentType } : null,
      email: v.email || null,
      phone: null,
      // Sin clave cuando ya la definió por el link: mandarla vacía se la pisaría.
      password: this.pideClave ? encryptPassword(v.password, info) : null,
      info: this.pideClave ? info : null,
    }).subscribe({
      next: () => {
        // La clave cambió: el token viejo ya no sirve, hay que volver a entrar.
        this.authService.clearToken();
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('qf_email');
        }
        this.router.navigate(['/login'], { queryParams: { registrado: 1 } });
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.answer || 'No se pudo completar el registro.';
      }
    });
  }
}
