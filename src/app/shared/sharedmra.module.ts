import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidateDocumentPipe } from './pipes/validate-document.pipe';
import { TranslateUnitPipe } from './pipes/translate-unit.pipe';
import { DocPipe } from './pipes/doc.pipe';

@NgModule({
  declarations: [ValidateDocumentPipe, TranslateUnitPipe, DocPipe],
  exports: [ValidateDocumentPipe, TranslateUnitPipe, DocPipe], // ⬅ exportas para otros módulos
  imports: [CommonModule]
})
export class SharedMRAModule {}
