import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';
import { ProfileComponent } from './profile/profile.component';
import { PrescriptionSearchComponent } from './prescriptions/prescription-search/prescription-search.component';
import { DispensationListComponent } from './dispensations/dispensation-list/dispensation-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LandingRedirectComponent } from './landing-redirect/landing-redirect.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent, // HomeComponent acts as the parent
    children: [
      {
        path: '',
        component: LandingRedirectComponent,
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'prescriptions/search',
        component: PrescriptionSearchComponent,
      },
      {
        path: 'prescriptions',
        component: PrescriptionsComponent,
      },
      {
        path: 'dispensations',
        component: DispensationListComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }