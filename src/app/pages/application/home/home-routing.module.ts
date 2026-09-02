import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { PharmacyListComponent } from './pharmacies/pharmacy-list/pharmacy-list.component';
import { GreenDispensationsListComponent } from './green-dispensations/green-dispensations-list/green-dispensations-list.component';
import { PerfilComponent } from './perfil/perfil.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: PharmacyListComponent
      },
      {
        path: 'farmacias/:pharmacyId/recetas-verdes',
        component: GreenDispensationsListComponent
      },
      {
        path: 'perfil',
        component: PerfilComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
