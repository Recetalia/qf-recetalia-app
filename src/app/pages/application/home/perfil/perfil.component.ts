import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PharmaceuticalDirectorService } from '../../../../services/pharmaceutical-director.service';
import { PharmaceuticalDirectorMeResponse } from '../../../../model/response/pharmaceutical-director-me-response';
import { toPhonePayload } from '../../../../shared/utils/phone-payload.util';
import { toPhoneInput } from '../../../../shared/utils/phone-input.util';

/**
 * «Mi Perfil»: el QF corrige su celular y su mail.
 *
 * Sólo esos dos. El CJP, el nombre, el apellido y el documento son identidad contrastada
 * contra el padrón —y contra lo que declararon sus farmacias—, así que se muestran pero no se
 * editan: cambiarlos acá desincronizaría la ficha del que firma las recetas verdes.
 */
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html'
})
export class PerfilComponent implements OnInit {

  form!: FormGroup;
  me: PharmaceuticalDirectorMeResponse | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private pd: PharmaceuticalDirectorService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
    });

    this.pd.getMe().subscribe({
      next: (me) => {
        this.me = me;
        this.form.patchValue({
          email: me.email ?? '',
          // Por `toPhoneInput`, nunca crudo: el widget lo mete en un `<input type="number">`
          // que descarta el formato con espacios y deja el campo vacío.
          phone: toPhoneInput(me.phone),
        });
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
    this.success = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    this.saving = true;
    this.pd.updateMyContact(v.email, toPhonePayload(v.phone)).subscribe({
      next: (me) => {
        this.me = me;
        // Se repatcha con lo que devolvió el backend y no con lo tipeado: el celular vuelve
        // normalizado y así la pantalla muestra lo que quedó guardado, no lo que se escribió.
        this.form.patchValue({ email: me.email ?? '', phone: toPhoneInput(me.phone) });
        this.form.markAsPristine();
        this.saving = false;
        this.success = 'Listo, guardamos tus datos.';
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.answer || 'No se pudieron guardar tus datos.';
      }
    });
  }
}
