import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidarFarmaciasRoutingModule } from './validar-farmacias-routing.module';
import { ValidarFarmaciasComponent } from './validar-farmacias.component';

@NgModule({
  declarations: [ValidarFarmaciasComponent],
  imports: [CommonModule, ValidarFarmaciasRoutingModule]
})
export class ValidarFarmaciasModule { }
