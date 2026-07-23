import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translateUnit'
})
export class TranslateUnitPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const key = value.toLowerCase();
    switch (key) {
      case 'hour':
      case 'hours':
        return 'horas';
      case 'day':
      case 'days':
        return 'días';
      case 'week':
      case 'weeks':
        return 'semanas';
      case 'month':
      case 'months':
        return 'meses';
      default:
        return value;
    }
  }
}