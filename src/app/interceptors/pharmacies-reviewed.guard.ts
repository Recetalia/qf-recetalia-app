import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, of, catchError } from 'rxjs';
import { PharmaceuticalDirectorService } from '../services/pharmaceutical-director.service';

/**
 * La primera vez, el QF no puede usar la app hasta confirmar qué farmacias son suyas.
 *
 * Bloquea sólo mientras NO se haya pronunciado sobre ninguna. Después, una farmacia nueva
 * que lo declare aparece pendiente en la pantalla pero no lo vuelve a encerrar: ya cumplió
 * el control, y trabarle la app por un alta de un tercero sería castigarlo por algo que no
 * hizo.
 *
 * Mismo molde que `registeredGuard`, incluido el criterio ante un error: si la consulta
 * falla se deja pasar. Encerrar a alguien en un redirect por un problema de red es peor que
 * dejarlo entrar sin haber confirmado.
 */
export const pharmaciesReviewedGuard: CanActivateFn = () => {
  const pd = inject(PharmaceuticalDirectorService);
  const router = inject(Router);

  return pd.getMyPharmaciesToReview().pipe(
    map(rows => {
      if (rows.length === 0) { return true; }
      const nuncaDecidio = rows.every(r => !r.decision);
      return nuncaDecidio ? router.createUrlTree(['/validar-farmacias']) : true;
    }),
    catchError(() => of(true))
  );
};
