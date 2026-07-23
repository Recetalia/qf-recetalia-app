import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';
import { ProfileComponent } from './profile/profile.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PrescriptionListComponent } from './prescriptions/prescription-list/prescription-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LandingRedirectComponent } from './landing-redirect/landing-redirect.component';

import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { CalendarModule } from 'primeng/calendar';
import { PrescriptionAddComponent } from './prescriptions/prescription-add/prescription-add.component';
import { PatientComponent } from './patient/patient.component';
import { PatientAddComponent } from './patient/patient-add/patient-add.component';
import { MedicineComponent } from './medicine/medicine.component';
import { MedicineListComponent } from './medicine/medicine-list/medicine-list.component';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { AccordionModule } from 'primeng/accordion';
import { AngularPhoneNumberInput } from 'angular-phone-number-input';
import { PrescriptionsInfoComponent } from './prescriptions/prescriptions-info/prescriptions-info.component';
import { SharedMRAModule } from '../../../shared/sharedmra.module';
import { PasswordModule } from 'primeng/password';
import { PrescriptionSearchComponent } from './prescriptions/prescription-search/prescription-search.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { StepperModule } from 'primeng/stepper';
import { PharmacyDispenserAddComponent } from './pharmacy-dispenser/pharmacy-dispenser-add/pharmacy-dispenser-add.component';
import { DispensationsComponent } from './dispensations/dispensations.component';
import { DispensationListComponent } from './dispensations/dispensation-list/dispensation-list.component';
import { DispensationAddComponent } from './dispensations/dispensation-add/dispensation-add.component';
import { DispensationSearchComponent } from './dispensations/dispensation-search/dispensation-search.component';
import { DispensationsInfoComponent } from './dispensations/dispensations-info/dispensations-info.component';
import { DocPipe } from '../../../shared/pipes/doc.pipe';


@NgModule({
  declarations: [
    HomeComponent,
    PrescriptionsComponent,
    ProfileComponent,
    HeaderComponent,
    SidebarComponent,
    PrescriptionListComponent,
    PrescriptionAddComponent,
    PatientComponent,
    PatientAddComponent,
    MedicineComponent,
    MedicineListComponent,
    PrescriptionsInfoComponent,
    PrescriptionSearchComponent,
    PharmacyDispenserAddComponent,
    DispensationsComponent,
    DispensationListComponent,
    DispensationAddComponent,
    DispensationSearchComponent,
    DispensationsInfoComponent,
    DashboardComponent,
    LandingRedirectComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    DropdownModule,
    InputNumberModule,
    FormsModule,
    DynamicDialogModule,
    TableModule,
    PaginatorModule,
    CalendarModule,
    AccordionModule,
    AngularPhoneNumberInput,
    SharedMRAModule,
    PasswordModule,
    SelectButtonModule,
    StepperModule,
    ChartModule
  ],
  providers: [DialogService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeModule { }
