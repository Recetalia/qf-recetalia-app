import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PharmacyListComponent } from './pharmacies/pharmacy-list/pharmacy-list.component';
import { GreenDispensationsListComponent } from './green-dispensations/green-dispensations-list/green-dispensations-list.component';

import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [
    HomeComponent,
    HeaderComponent,
    SidebarComponent,
    PharmacyListComponent,
    GreenDispensationsListComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CalendarModule,
    ButtonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeModule { }
