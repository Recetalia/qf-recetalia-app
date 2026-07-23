import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { PharmacyService } from '../../services/pharmacy.service';

export function emailExistsValidator(pharmacyService: PharmacyService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return pharmacyService.validateExistByEmail(control.value).pipe(
      map((emailExists) => (emailExists ? { emailExists: true } : null)),
      catchError(() => of(null))  // Ignore errors, return no error if the API fails
    );
  };
}
