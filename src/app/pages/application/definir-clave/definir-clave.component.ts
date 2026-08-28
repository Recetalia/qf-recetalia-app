import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

/**
 * Pantalla a la que llega el Químico Farmacéutico desde el link del mail de invitación.
 *
 * Es el único camino de alta para el padrón: esos QF fueron cargados por SQL y quedaron
 * marcados como habilitados sin usuario de login, así que no tienen ninguna clave que usar
 * en el login normal.
 *
 * Entra SIN sesión — lo que lo autoriza es el token de un solo uso del query param, no un
 * JWT. Por eso la ruta va fuera del `authGuard`.
 */
@Component({
  selector: 'app-definir-clave',
  templateUrl: './definir-clave.component.html',
  styleUrls: ['./definir-clave.component.scss']
})
export class DefinirClaveComponent implements OnInit {

  form!: FormGroup;
  saving = false;
  error: string | null = null;

  /** El token del link. Sin esto no hay nada que hacer acá. */
  private token = '';
  /** Se muestra al final: el QF nunca vio su usuario, es derivado de su CJP. */
  username: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.token = this.route.snapshot.queryParamMap.get('code') ?? '';
    if (!this.token) {
      this.error = 'El link no es válido. Pedile a Recetalia que te lo reenvíe.';
    }
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.error = null;
    if (!this.token) { return; }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { password, confirm } = this.form.value;
    if (password !== confirm) {
      this.error = 'Las dos claves no coinciden.';
      return;
    }

    this.saving = true;
    this.auth.resetPasswordWithToken(this.token, password).subscribe({
      next: (res) => {
        this.username = res.username;
        // Al LOGIN, no al registro.
        //
        // Antes esto hacía login automático y encadenaba a /registro, que sirve para el que
        // entra por primera vez pero es un error para el que sólo recuperó su clave: a un QF
        // ya registrado le aparecía "Completá tu registro — Es tu primer ingreso".
        //
        // Mandarlo al login sirve para los dos casos, porque la bifurcación ya la resuelve
        // `registeredGuard` al entrar: si nunca completó el registro lo lleva ahí, y si ya lo
        // hizo va directo a la app. Se le pasa el usuario para que no tenga que adivinarlo:
        // es {cjp}@qf.recetalia.com, derivado de su matrícula, y nunca lo vio.
        this.router.navigate(['/login'], {
          queryParams: { usuario: res.username, clave: 'definida' },
        });
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.answer
          || 'El link no es válido o ya venció (dura 7 días). Pedile a Recetalia que te lo reenvíe.';
      }
    });
  }
}
