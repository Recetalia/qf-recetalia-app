import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValidarFarmaciasComponent } from './validar-farmacias.component';

const routes: Routes = [{ path: '', component: ValidarFarmaciasComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidarFarmaciasRoutingModule { }
