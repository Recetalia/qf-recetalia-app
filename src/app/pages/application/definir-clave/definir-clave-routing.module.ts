import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefinirClaveComponent } from './definir-clave.component';

const routes: Routes = [{ path: '', component: DefinirClaveComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DefinirClaveRoutingModule { }
