import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validateDocument'
})
export class ValidateDocumentPipe implements PipeTransform {
  /**
     * Validates a document based on the country.
     * If the country is 'UY', performs Uruguay-specific validation.
     * Otherwise, skips validation.
     *
     * @param idNumber The identification number to validate.
     * @param country The country code (e.g., 'UY', 'AR', 'BR').
     * @returns A boolean indicating whether the document is valid.
     */
  transform(idNumber: string, country: string): boolean {
    if (!idNumber || !country) return false;

    if (country === 'UY') {
      return this.validateUruguayanId(idNumber);
    }

    // No validation for other countries
    return true;
  }

  /**
   * Validates a Uruguay (UY) identification number.
   * The number must be 7-8 digits long and pass a check digit calculation.
   *
   * @param idNumber The ID number to validate.
   * @returns A boolean indicating whether the ID is valid.
   */
  private validateUruguayanId(idNumber: string): boolean {
    const cleanedId = idNumber.replace(/\D/g, ''); // Remove non-numeric characters
    if (cleanedId.length < 7 || cleanedId.length > 8) return false;

    const base = cleanedId.slice(0, -1); // All digits except the last
    const checkDigit = parseInt(cleanedId.slice(-1), 10); // Last digit

    // Validate using the weighting sequence
    const weights = [2, 9, 8, 7, 6, 3, 4];
    let sum = 0;

    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * weights[i];
    }

    const calculatedCheckDigit = (10 - (sum % 10)) % 10;

    return calculatedCheckDigit === checkDigit;
  }
}
