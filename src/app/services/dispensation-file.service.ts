// src/app/services/dispensation.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../model/response/api-response';
import { DispensationRequest } from '../model/request/dispensation-request';
import { DispensationResponse } from '../model/response/dispensation-response';
import { Page } from '../model/page';
import { DispensationSearchRow } from '../model/response/dispensation-search-row';
import { toLocalDateParam } from '../shared/date-utils';

import { HttpResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Injectable({ providedIn: 'root' })
export class DispensationFileService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  // cache the loaded pdfMake instance
  private pdfMakePromise?: Promise<any>;

  /** Lazy loader for pdfmake that works in Angular + SSR */
  // --- keep the rest of your service as-is ---
  // Only replace loadPdfMake() and add defaultStyle in the doc definition.

  private async loadPdfMake(): Promise<any> {
    if (this.pdfMakePromise) return this.pdfMakePromise;

    this.pdfMakePromise = (async () => {
      // 1) Load pdfMake first, then the VFS bundle
      const pdfMakeMod = await import('pdfmake/build/pdfmake');
      const pdfMake: any = (pdfMakeMod as any).default ?? pdfMakeMod;

      const pdfFontsMod = await import('pdfmake/build/vfs_fonts');
      const pdfFonts: any = (pdfFontsMod as any).default ?? pdfFontsMod;

      // 2) Attach font data (supports both export shapes)
      if (typeof pdfMake.addVirtualFileSystem === 'function') {
        // Recommended in 0.2.x
        pdfMake.addVirtualFileSystem(pdfFonts);
      } else {
        // Fallback: assign vfs directly if available
        const vfs =
          pdfFonts?.pdfMake?.vfs ??
          pdfFonts?.vfs ??
          (pdfMake as any)?.vfs;
        if (vfs) {
          (pdfMake as any).vfs = vfs;
        }
      }

      // 3) Register Roboto family names used by the bundled VFS
      pdfMake.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf',
        },
      };

      // 4) Cache globally so subsequent imports reuse the same instance
      (window as any).pdfMake = pdfMake;

      // 5) Dev sanity check
      if (!pdfMake.vfs || !pdfMake.vfs['Roboto-Regular.ttf']) {
        // If this ever logs, the VFS wasn’t attached; inspect keys to debug
        console.error(
          'pdfmake: Roboto-Regular.ttf not found in VFS. Keys sample:',
          Object.keys(pdfMake.vfs || {}).slice(0, 10)
        );
      }

      return pdfMake;
    })();

    return this.pdfMakePromise;
  }



  // ---------- PUBLIC API ----------
  async exportDispensationsToExcel(rows: DispensationSearchRow[]): Promise<void> {
    if (!this.ensureBrowser()) return;
    if (!rows?.length) return;

    const XLSX = await import('xlsx');

    const header = [
      ['Fecha', 'Prescripcion', 'Paciente', 'Documento', 'Medicamento', 'Principio activo', 'Estado', 'Dispensado por', 'Tipo de Receta']
    ];

    const data = rows.map(r => [
      this.formatDate(r.dispensationCreatedAt),
      r.prescriptionCode ?? '',
      `${r.patientName ?? ''} ${r.patientLastName ?? ''}`.trim(),
      this.formatDoc(r.patientDocument),
      (r as any).dispensationProductName ?? '',
      (r as any).prescriptionSubstanceName ?? '',
      this.statusText(r.dispensationStatus),
      `${r.pharmacyDispenserName ?? ''} ${r.pharmacyDispenserLastName ?? ''}`.trim(),
      this.recipeType(r.condvtaId ?? 0)
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...header, ...data]);
    (ws as any)['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 26 }, { wch: 16 }, { wch: 60 }, { wch: 30 }, { wch: 12 }, { wch: 26 }, { wch: 12 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dispensaciones');
    XLSX.writeFile(wb, `Dispensaciones_${this.yyyyMMdd_HHmm()}.xlsx`);
  }

  async exportDispensationsToPdf(rowsOrRow: DispensationSearchRow[] | DispensationSearchRow): Promise<void> {
    if (!this.ensureBrowser()) return;

    const rows = Array.isArray(rowsOrRow) ? rowsOrRow : [rowsOrRow];
    if (!rows.length) return;

    const pdfMake = await this.loadPdfMake();

    // 1) Prepare per-page values
    const dates = rows.map(r => this.formatDate(r.dispensationCreatedAt));
    const codes = rows.map(r => r.prescriptionCode ?? ''); // falls back to empty
    // If you always want "KF25UO", replace the map with: const codes = rows.map(() => 'KF25UO');

    // 2) Load your logo (place your file under src/assets/)
    // e.g., src/assets/recetalia-logo.png
    const logoDataUrl = await this.loadImageAsDataUrl('../../assets/images/logos/logo.png');

    // 3) Build page contents (one "page" per row) – remove the old top-right date block
    const pages = rows.map((r, idx) => {
      const blocks: any[] = [
        // (removed the date text here; it's now in header)
        { text: 'MEDICO', style: 'label', margin: [0, 6, 0, 0] },
        { text: `${r.medicName ?? ''} ${r.medicLastname ?? ''}`.trim(), style: 'value' },
        { text: `CPJ ${this.formatDoc(r.medicCJP)}`, color: '#666', fontSize: 9, margin: [0, 2, 0, 4] },

        { text: 'PACIENTE', style: 'label', margin: [0, 6, 0, 0] },
        { text: `${r.patientName ?? ''} ${r.patientLastName ?? ''}`.trim(), style: 'value' },
        { text: this.formatDoc(r.patientDocument), color: '#666', fontSize: 9, margin: [0, 2, 0, 4] },

        { text: 'PRESCRIPCIÓN', style: 'label', margin: [0, 6, 0, 0] },
        { text: `${r.prescriptionCode ?? ''}`, style: 'value' },

        { text: 'MEDICAMENTO', style: 'label', margin: [0, 6, 0, 0] },
        { text: (r as any).dispensationProductName ?? '', style: 'value' },

        { text: 'PRINCIPIO ACTIVO', style: 'label', margin: [0, 6, 0, 0] },
        { text: (r as any).prescriptionSubstanceName ?? '', style: 'value' },

        { text: 'ADMINISTRACION', style: 'label', margin: [0, 6, 0, 0] },
        { text: this.formatAdministration(r), style: 'value' },

        { text: 'TIPO DE RECETA', style: 'label', margin: [0, 6, 0, 0] },
        { text: this.recipeType(r.condvtaId ?? 0), color: this.recipeTypeColor(r.condvtaId ?? 0), fontSize: 14, margin: [0, 2, 0, 4] },
        
      ];
      if (idx < rows.length - 1) blocks.push({ text: '', pageBreak: 'after' });
      return blocks;
    }).flat();

    // 4) Define the doc with header + footer
    const dd: any = {
      pageSize: 'A6',
      pageMargins: [20, 35, 20, 35], // extra space for header/footer
      // HEADER: logo left, date right, per page
      header: (currentPage: number /*, pageCount: number */) => {
        const i = Math.max(0, currentPage - 1);
        return {
          columns: [
            { image: logoDataUrl, width: 60, margin: [20, 10, 0, 0] }, // left logo
            { text: dates[i] || '', alignment: 'right', color: '#888', fontSize: 8, margin: [0, 14, 20, 0] },
          ],
        };
      },
      // FOOTER: prescription code left; the two lines right
      footer: (currentPage: number, pageCount: number) => {
        const i = Math.max(0, currentPage - 1);
        const code = codes[i] || 'KF25UO'; // default if missing
        return {
          columns: [
            { text: `PRESCRIPCION: ${code}`, alignment: 'left' },
            {
              stack: [
                { text: 'Documento emitido por recetalia' },
                { text: 'www.recetalia.com' },
              ],
              alignment: 'right',
            },
          ],
          margin: [20, 0, 20, 10],
          fontSize: 8,
          color: '#666',
        };
      },
      content: pages,
      styles: {
        label: { fontSize: 8, color: '#888' },
        value: { fontSize: 11.5, color: '#000' },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    pdfMake.createPdf(dd).download(`Dispensaciones_${this.yyyyMMdd_HHmm()}.pdf`);
  }


  // ---------- HELPERS ----------
  private ensureBrowser(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Export only runs in the browser.');
      return false;
    }
    return true;
  }

  // Add this helper in the service (near the other helpers)
  private async loadImageAsDataUrl(path: string): Promise<string> {
    const res = await fetch(path);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private yyyyMMdd_HHmm(d: Date | string = new Date()): string {
    const dt = (d instanceof Date) ? d : new Date(d);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}_${pad(dt.getHours())}${pad(dt.getMinutes())}`;
  }

  private formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private statusText(status: string | null | undefined): string {
    switch ((status || '').toUpperCase()) {
      case 'AVAILABLE': return 'Disponible';
      case 'DISPENSED': return 'Dispensada';
      case 'PENDING': return 'Pendiente';
      case 'CANCEL':
      case 'CANCELLED': return 'Cancelada';
      default: return status ?? '';
    }
  }

  private readonly docRegex = /^([\p{L}.]+)[\s\-:|]+(.+)$/u;
  private formatDoc(doc: DispensationSearchRow['patientDocument']): string {
    const p = this.parseDoc(doc);
    if (p.type && p.number) return `${p.type} ${p.number}`;
    if (p.type) return p.type;
    if (p.number) return p.number;
    return '';
  }
  private parseDoc(value: any): { type: string; number: string } {
    if (value && typeof value === 'object') {
      return { type: String(value.type ?? '').trim(), number: String(value.number ?? '').trim() };
    }
    if (typeof value === 'string') {
      const s = value.trim();
      if (s.startsWith('{') && s.endsWith('}')) {
        try {
          const obj = JSON.parse(s);
          return { type: String(obj.type ?? '').trim(), number: String(obj.number ?? '').trim() };
        } catch { }
      }
      const m = this.docRegex.exec(s);
      if (m) return { type: (m[1] ?? '').trim(), number: (m[2] ?? '').trim() };
      return { type: '', number: s };
    }
    return { type: '', number: '' };
  }

  private translateUnit(u?: string | null): string {
    switch ((u || '').toUpperCase()) {
      case 'HOUR': return 'hora(s)';
      case 'DAY': return 'día(s)';
      case 'WEEK': return 'semana(s)';
      case 'MONTH': return 'mes(es)';
      case 'UNIT': return 'unidad(es)';
      // dosage units you may see:
      case 'ML': return 'ml';
      case 'MG': return 'mg';
      case 'G': return 'g';
      default: return u || '';
    }
  }

  private recipeType(u?: number | null): string {
    switch (u?.toString()) {
      case '11': return 'Verde';
      case '12': return 'Naranja';
      default: return 'Blanca';
    }
  }

  private recipeTypeColor(u?: number | null): string {
    debugger
    switch (u?.toString()) {
      case '11': return '#267926';
      case '12': return '#8c5e0b';
      default: return '#000000';
    }
  }

  /** Builds: "<dose> <doseUnit> cada <frecuency> <frecuencyUnit> durante <duration> <durationUnit>" */
  private formatAdministration(r: DispensationSearchRow): string {
    // These may not be in your TS interface, so read them defensively:
    const dose = (r as any).prescriptionDose as number | null | undefined;
    const duration = (r as any).prescriptionDuration as number | null | undefined;
    const durationUnit = (r as any).prescriptionDurationUnit as string | null | undefined;

    // Dose part: "<dose> <doseUnit>" or just "<doseUnit>" or fallback "unidad(es)"
    const doseUnitTxt = r.prescriptionDoseUnit || 'unidad(es)';
    const doseTxt = (dose ?? '') !== ''
      ? `${dose} ${doseUnitTxt}`.trim()
      : `${doseUnitTxt}`.trim();

    // Frequency part: "cada <frecuency> <frecuencyUnit>"
    const freqTxt = (r.prescriptionFrecuency != null && r.prescriptionFrecuencyUnit)
      ? `cada ${r.prescriptionFrecuency} ${this.translateUnit(r.prescriptionFrecuencyUnit)}`
      : '';

    // Duration part: "durante <duration> <durationUnit>"
    const durTxt = (duration != null && durationUnit)
      ? `durante ${duration} ${this.translateUnit(durationUnit).toLowerCase()}`
      : '';

    // Join only non-empty parts
    return [doseTxt, freqTxt, durTxt].filter(Boolean).join(' ');
  }

}
