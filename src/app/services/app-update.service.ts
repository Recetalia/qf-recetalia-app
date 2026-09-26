import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';

/**
 * Mantiene al día la app servida por el service worker.
 *
 * El service worker de Angular sirve la versión en caché y baja la nueva en
 * segundo plano, pero sin este servicio nadie la activaba: después de un deploy
 * se seguía viendo la versión anterior hasta recargar dos veces o cerrar todas
 * las pestañas. Mismo fix que en medics-recetalia-app (commit 4dc4216).
 *
 * Al detectar una versión nueva la activa y recarga. Revisa al arrancar y cada
 * 10 minutos, para las pestañas que quedan abiertas todo el día.
 */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly platformId = inject(PLATFORM_ID);

  static readonly INTERVALO_MS = 10 * 60 * 1000;

  iniciar(recargar: () => void = () => document.location.reload()): void {
    if (!isPlatformBrowser(this.platformId) || !this.swUpdate.isEnabled) {
      return;
    }
    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        this.swUpdate.activateUpdate().then(() => recargar());
      });
    this.revisar();
    interval(AppUpdateService.INTERVALO_MS).subscribe(() => this.revisar());
  }

  private revisar(): void {
    this.swUpdate.checkForUpdate().catch(() => {
      /* sin red o sin service worker: se reintenta en el próximo intervalo */
    });
  }
}
