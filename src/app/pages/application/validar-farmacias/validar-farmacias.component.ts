import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PharmaceuticalDirectorService } from '../../../services/pharmaceutical-director.service';
import { QfPharmacyReviewRow } from '../../../model/response/qf-pharmacy-review-row';

/**
 * El Químico Farmacéutico confirma o rechaza las farmacias que lo declaran como responsable.
 *
 * El vínculo lo escribe la farmacia al darse de alta, poniendo un CJP en su formulario; el
 * químico nunca interviene. Puede terminar figurando como director técnico de una farmacia
 * que no conoce, y el cargo tiene consecuencias legales — por eso la primera vez es
 * bloqueante (ver `pharmaciesReviewedGuard`).
 */
@Component({
  selector: 'app-validar-farmacias',
  templateUrl: './validar-farmacias.component.html',
  styleUrls: ['./validar-farmacias.component.scss']
})
export class ValidarFarmaciasComponent implements OnInit {

  rows: QfPharmacyReviewRow[] = [];
  loading = true;
  saving = false;
  error: string | null = null;

  /** Lo elegido en pantalla, por farmacia. Se manda todo junto al confirmar. */
  choices = new Map<string, 'ACCEPTED' | 'REJECTED'>();

  constructor(private pd: PharmaceuticalDirectorService, private router: Router) {}

  ngOnInit(): void {
    this.pd.getMyPharmaciesToReview().subscribe({
      next: (rows) => {
        this.rows = rows;
        // Las ya decididas arrancan con su valor: si vuelve a entrar, ve lo que dijo antes.
        rows.forEach(r => { if (r.decision) { this.choices.set(r.pharmacyId, r.decision); } });
        this.loading = false;
      },
      error: () => {
        this.error = 'No pudimos cargar tus farmacias. Probá de nuevo en un rato.';
        this.loading = false;
      }
    });
  }

  choose(pharmacyId: string, decision: 'ACCEPTED' | 'REJECTED'): void {
    this.choices.set(pharmacyId, decision);
  }

  chosen(pharmacyId: string): 'ACCEPTED' | 'REJECTED' | undefined {
    return this.choices.get(pharmacyId);
  }

  get pendientes(): number {
    return this.rows.filter(r => !this.choices.has(r.pharmacyId)).length;
  }

  get rechazadas(): number {
    return this.rows.filter(r => this.choices.get(r.pharmacyId) === 'REJECTED').length;
  }

  onConfirm(): void {
    // No se puede confirmar a medias: es un control legal, y una farmacia sin responder
    // quedaría igual que una aceptada sin que nadie lo haya dicho.
    if (this.pendientes > 0 || this.saving) { return; }
    this.error = null;
    this.saving = true;

    const payload = this.rows.map(r => ({
      pharmacyId: r.pharmacyId,
      decision: this.choices.get(r.pharmacyId)!,
    }));

    this.pd.decidePharmacies(payload).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.saving = false;
        this.error = 'No pudimos guardar tu respuesta. Probá de nuevo.';
      }
    });
  }
}
