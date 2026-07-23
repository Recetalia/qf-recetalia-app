import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegisterRoutingModule } from './register-routing.module';
import { CalendarModule } from 'primeng/calendar';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { PasswordModule } from "primeng/password";
import { AngularPhoneNumberInput } from 'angular-phone-number-input';
import { DialogModule } from 'primeng/dialog';
import { HeaderComponent } from './header/header.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { FooterComponent } from './footer/footer.component';
import { SharedMRAModule } from '../../../shared/sharedmra.module';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';

@NgModule({
  declarations: [RegisterComponent, 
    HeaderComponent, 
    TermsComponent, 
    PrivacyComponent, 
    FooterComponent,
    ],
  imports: [
    CommonModule,
    RegisterRoutingModule,
    CalendarModule,
    ReactiveFormsModule,
    DropdownModule,
    PasswordModule,
    AngularPhoneNumberInput,
    DialogModule,
    SharedMRAModule,
    SelectButtonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegistergModule { }
