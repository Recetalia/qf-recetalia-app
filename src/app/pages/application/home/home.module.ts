import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PharmacyListComponent } from './pharmacies/pharmacy-list/pharmacy-list.component';
import { GreenDispensationsListComponent } from './green-dispensations/green-dispensations-list/green-dispensations-list.component';
import { PerfilComponent } from './perfil/perfil.component';
import { AngularPhoneNumberInput } from 'angular-phone-number-input';

import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';

import { SharedMRAModule } from '../../../shared/sharedmra.module';

@NgModule({
  declarations: [
    HomeComponent,
    HeaderComponent,
    SidebarComponent,
    PharmacyListComponent,
    GreenDispensationsListComponent,
    PerfilComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CalendarModule,
    ButtonModule,
    // Trae el DocPipe, que parte el JSON de patient.document en tipo y número.
    SharedMRAModule,
    AngularPhoneNumberInput,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeModule { }
