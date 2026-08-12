import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, of, catchError } from 'rxjs';
import { PharmaceuticalDirectorService } from '../services/pharmaceutical-director.service';

/**
 * Un QF que no completó su registro no puede usar la app: se lo manda a /registro.
 * Consulta /me porque `registeredAt` no viaja en el token — el token solo trae
 * `mustChangePassword`, que se apaga al renovar la clave, y eso no alcanza para saber
 * si además verificó sus datos.
 */
export const registeredGuard: CanActivateFn = () => {
  const pd = inject(PharmaceuticalDirectorService);
  const router = inject(Router);

  return pd.getMe().pipe(
    map(me => me.registeredAt ? true : router.createUrlTree(['/registro'])),
    // Si /me falla no hay forma de saberlo: se deja pasar y que falle donde corresponda,
    // en vez de encerrar al usuario en un redirect por un error de red.
    catchError(() => of(true))
  );
};
