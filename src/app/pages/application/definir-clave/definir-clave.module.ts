import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DefinirClaveRoutingModule } from './definir-clave-routing.module';
import { DefinirClaveComponent } from './definir-clave.component';

@NgModule({
  declarations: [DefinirClaveComponent],
  imports: [CommonModule, ReactiveFormsModule, DefinirClaveRoutingModule]
})
export class DefinirClaveModule { }
