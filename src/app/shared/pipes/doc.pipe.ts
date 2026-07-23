import { Pipe, PipeTransform } from '@angular/core';

type DocObj = { type?: string | null; number?: string | number | null };
type DocValue = DocObj | string | null | undefined;

@Pipe({
  name: 'document',
  pure: true
})
export class DocPipe implements PipeTransform {

  // supports unicode letters and dotted abbreviations like "C.C."
  private readonly docRegex = /^([\p{L}.]+)[\s\-:|]+(.+)$/u;

  transform(value: DocValue, part: 'type' | 'number' | 'full' = 'full'): string {
    const parsed = this.parse(value);

    if (part === 'type')   return parsed.type;
    if (part === 'number') return parsed.number;

    // full
    if (parsed.type && parsed.number) return `${parsed.type} ${parsed.number}`;
    return parsed.type || parsed.number || '';
  }

  private parse(value: DocValue): { type: string; number: string } {
    // 1) Object case
    if (value && typeof value === 'object') {
      const v = value as DocObj;
      return {
        type: String(v.type ?? '').trim(),
        number: String(v.number ?? '').trim(),
      };
    }

    // 2) String cases
    if (typeof value === 'string') {
      const s = value.trim();

      // 2a) JSON string case: {"number":"65757","type":"OTHER"}
      if (s.startsWith('{') && s.endsWith('}')) {
        try {
          const parsed = JSON.parse(s) as DocObj;
          return {
            type: String(parsed.type ?? '').trim(),
            number: String(parsed.number ?? '').trim(),
          };
        } catch {
          // fall through to regex/number-only fallback
        }
      }

      // 2b) "CC 123", "CC-123", "CC|123", etc.
      const m = this.docRegex.exec(s);
      if (m) {
        return { type: (m[1] ?? '').trim(), number: (m[2] ?? '').trim() };
      }

      // 2c) Plain number string (no delimiter)
      return { type: '', number: s };
    }

    // 3) Null/undefined/other
    return { type: '', number: '' };
  }
}
