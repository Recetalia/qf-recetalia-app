import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistroComponent } from './registro.component';
import { RegistroRoutingModule } from './registro-routing.module';
import { AngularPhoneNumberInput } from 'angular-phone-number-input';

@NgModule({
  declarations: [RegistroComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RegistroRoutingModule,
    AngularPhoneNumberInput
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegistroModule { }
