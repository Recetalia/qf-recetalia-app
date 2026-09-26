import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularPhoneNumberInput } from 'angular-phone-number-input';
import { of } from 'rxjs';

import { RegistroComponent } from './registro.component';
import { PharmaceuticalDirectorService } from '../../../services/pharmaceutical-director.service';
import { AuthService } from '../../../services/auth.service';
import { PharmaceuticalDirectorMeResponse } from '../../../model/response/pharmaceutical-director-me-response';

/**
 * El celular que declaró la farmacia tiene que llegar prellenado a esta pantalla.
 *
 * El dato viaja como `international` con espacios — así lo arma `toPhonePayload` y así queda
 * guardado: verificado en PROD el 2026-09-02 sobre el CJP 0129836, `+598 94 462 626`.
 */
const ME: PharmaceuticalDirectorMeResponse = {
  id: 'x',
  cjp: '0129836',
  name: 'Carba',
  lastname: 'Sionista',
  document: { number: '34563939', type: 'UY' },
  email: 'hello@recetalia.com',
  phone: {
    countryCode: 'UY',
    national: '94462626',
    international: '+598 94 462 626',
    type: 'mobile',
    validated: true,
  },
  status: 'ACTIVE',
  registeredAt: null,
  pharmacies: [],
} as unknown as PharmaceuticalDirectorMeResponse;

describe('RegistroComponent — prellenado del celular', () => {
  let fixture: ComponentFixture<RegistroComponent>;

  /**
   * DOS pasadas de detección de cambios, no una.
   *
   * El widget de celular escribe al DOM con `[(ngModel)]`, que difiere el `setValue` a un
   * microtask; con una sola pasada el input queda vacío **aunque el valor sea correcto**, y
   * eso hace que el test falle por el motivo equivocado. Medido el 2026-09-02: con el número
   * ya normalizado, 1 pasada da "" y 2 pasadas dan "94462626".
   */
  function renderCompleto(): void {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroComponent],
      imports: [CommonModule, ReactiveFormsModule, AngularPhoneNumberInput],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: PharmaceuticalDirectorService, useValue: { getMe: () => of(ME) } },
        { provide: AuthService, useValue: { mustChangePassword: () => false, clearToken: () => {} } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroComponent);
  });

  /** Control positivo: si el email tampoco llegara, lo roto sería el stub y no el celular. */
  it('prellena el email que declaró la farmacia', fakeAsync(() => {
    renderCompleto();

    const email: HTMLInputElement =
      fixture.nativeElement.querySelector('input[formControlName="email"]');
    expect(email.value).toBe('hello@recetalia.com');
  }));

  it('prellena el celular que declaró la farmacia', fakeAsync(() => {
    renderCompleto();

    // El input de texto del widget: el único que no es del formulario de arriba.
    const inputs: HTMLInputElement[] =
      Array.from(fixture.nativeElement.querySelectorAll('angular-phone-number-input input'));
    expect(inputs.length).withContext('el widget de celular se renderizó').toBe(1);

    const digitos = (inputs[0].value || '').replace(/\D/g, '');
    expect(digitos).withContext(`el input mostró "${inputs[0].value}"`).toBe('94462626');
  }));
});
