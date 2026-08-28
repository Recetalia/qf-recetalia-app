import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PharmaceuticalDirectorService } from '../../../../services/pharmaceutical-director.service';

/**
 * «Olvidé mi contraseña» del Químico Farmacéutico.
 *
 * Pide el CJP y no el email: el químico entra con una dirección sintética derivada de su
 * matrícula (`{cjp}@qf.recetalia.com`) que nunca vio, así que pedírsela sería pedirle un dato
 * que no conoce. El link se le manda al correo que tiene declarado.
 */
@Component({
  selector: 'app-recuperar-clave',
  templateUrl: './recuperar-clave.component.html',
  styleUrls: ['./recuperar-clave.component.scss']
})
export class RecuperarClaveComponent {

  form: FormGroup;
  saving = false;
  /** Mensaje final. Es el mismo pase lo que pase, a propósito. */
  mensaje: string | null = null;

  constructor(fb: FormBuilder, private pd: PharmaceuticalDirectorService) {
    this.form = fb.group({ cjp: ['', Validators.required] });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const cjp = (this.form.get('cjp')?.value ?? '').toString().trim();

    this.pd.forgotPassword(cjp).subscribe({
      next: (msg) => {
        this.saving = false;
        this.mensaje = msg;
      },
      // Mismo mensaje ante un error de red: si mostrara algo distinto cuando el CJP no
      // existe, esta pantalla diría quién está registrado y quién no.
      error: () => {
        this.saving = false;
        this.mensaje = 'Si el CJP está registrado y tiene un correo declarado, te enviamos el '
                     + 'link para definir tu clave. Revisá tu casilla.';
      }
    });
  }
}
