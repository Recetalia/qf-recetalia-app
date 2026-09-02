import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularPhoneNumberInput } from 'angular-phone-number-input';
import { of, throwError } from 'rxjs';

import { PerfilComponent } from './perfil.component';
import { PharmaceuticalDirectorService } from '../../../../services/pharmaceutical-director.service';
import { PharmaceuticalDirectorMeResponse } from '../../../../model/response/pharmaceutical-director-me-response';

const ME = {
  id: 'x',
  cjp: '0129836',
  name: 'Carba',
  lastname: 'Sionista',
  document: { number: '34563939', type: 'UY' },
  email: 'hello@recetalia.com',
  phone: {
    countryCode: 'UY', national: '94462626',
    international: '+598 94 462 626', type: 'mobile', validated: true,
  },
  status: 'ACTIVE',
  registeredAt: '2026-08-01T10:00:00Z',
  pharmacies: [],
} as unknown as PharmaceuticalDirectorMeResponse;

describe('PerfilComponent', () => {
  let fixture: ComponentFixture<PerfilComponent>;
  let pd: { getMe: jasmine.Spy; updateMyContact: jasmine.Spy };

  /** Dos pasadas: ver el porqué en `registro.component.spec.ts`. */
  function renderCompleto(): void {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    pd = {
      getMe: jasmine.createSpy('getMe').and.returnValue(of(ME)),
      updateMyContact: jasmine.createSpy('updateMyContact').and.returnValue(of(ME)),
    };

    await TestBed.configureTestingModule({
      declarations: [PerfilComponent],
      imports: [CommonModule, ReactiveFormsModule, AngularPhoneNumberInput],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: PharmaceuticalDirectorService, useValue: pd }],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
  });

  it('prellena el mail y el celular guardados', fakeAsync(() => {
    renderCompleto();

    const email: HTMLInputElement =
      fixture.nativeElement.querySelector('input[formControlName="email"]');
    expect(email.value).toBe('hello@recetalia.com');

    // La misma trampa que rompía /registro: el widget usa un `<input type="number">` y el
    // número formateado con espacios se pierde entero.
    const tel: HTMLInputElement =
      fixture.nativeElement.querySelector('angular-phone-number-input input');
    expect((tel.value || '').replace(/\D/g, ''))
      .withContext(`el input mostró "${tel.value}"`).toBe('94462626');
  }));

  it('muestra la identidad sin dejar editarla', fakeAsync(() => {
    renderCompleto();

    const texto: string = fixture.nativeElement.textContent;
    expect(texto).toContain('0129836');
    expect(texto).toContain('Carba');
    // Los únicos campos editables son los dos de contacto.
    expect(Object.keys(fixture.componentInstance.form.controls).sort())
      .toEqual(['email', 'phone']);
  }));

  it('manda el contacto como objeto Phone, no como string', fakeAsync(() => {
    renderCompleto();
    fixture.componentInstance.onSubmit();
    tick();

    const [email, phone] = pd.updateMyContact.calls.mostRecent().args;
    expect(email).toBe('hello@recetalia.com');
    expect(phone.international).toBe('+598 94 462 626');
    expect(phone.national).toBe('94462626');
  }));

  it('no manda nada si el mail queda vacío', fakeAsync(() => {
    renderCompleto();
    fixture.componentInstance.form.patchValue({ email: '' });

    fixture.componentInstance.onSubmit();
    tick();

    expect(pd.updateMyContact).not.toHaveBeenCalled();
  }));

  it('muestra el motivo que devuelve el backend', fakeAsync(() => {
    pd.updateMyContact.and.returnValue(
      throwError(() => ({ error: { answer: 'El email es obligatorio' } })));
    renderCompleto();

    fixture.componentInstance.onSubmit();
    tick();

    expect(fixture.componentInstance.error).toBe('El email es obligatorio');
    expect(fixture.componentInstance.saving).toBeFalse();
  }));
});
