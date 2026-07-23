import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ValidateDocumentPipe } from '../pipes/validate-document.pipe'; // Adjust the path as needed

export function documentValidator(pipe: ValidateDocumentPipe): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    
    const idNumber = control.get('idNumber')?.value;
    const idType = control.get('idType')?.value;

    if (!idNumber || !idType) return null; // Skip validation if either value is missing
    const isValid = pipe.transform(idNumber, idType);
    return isValid ? null : { invalidDocument: true };
  };
}
