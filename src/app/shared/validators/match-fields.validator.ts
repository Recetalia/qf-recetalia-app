/**
 * Custom validator for matching two form fields, typically used for confirming passwords or emails.
 * 
 * @param controlName The name of the control to match (e.g., 'password').
 * @param matchingControlName The name of the control to check against (e.g., 'passwordConfirm').
 * @returns A validator function that will return an error if the values do not match, or null if they do.
 */

import { AbstractControl, ValidationErrors } from '@angular/forms';

// Custom validator for matching fields
export function matchFieldsValidator(controlName: string, matchingControlName: string) {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (matchingControl?.errors && !matchingControl.errors['mustMatch']) {
      // Return if another validator has already found an error on the matchingControl
      return null;
    }

    // Set error on matchingControl if validation fails
    if (control?.value !== matchingControl?.value) {
      matchingControl?.setErrors({ mustMatch: true });
    } else {
      matchingControl?.setErrors(null);
    }

    return null;
  };
}