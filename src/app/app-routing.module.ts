import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './interceptors/auth.guard';
import { registeredGuard } from './interceptors/registered.guard';
import { pharmaciesReviewedGuard } from './interceptors/pharmacies-reviewed.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/application/home/home.module').then(h => h.HomeModule),
    canActivate: [authGuard, registeredGuard, pharmaciesReviewedGuard],
    data: { roles: ['ROLE_PHARMACEUTICAL_DIRECTOR'] }
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/application/login/login.module').then(l => l.LoginModule)
  },
  {
    // Con sesión, pero fuera del guard de farmacias: es justamente la pantalla a la que ese
    // guard redirige. Adentro se autoencerraría en un ciclo de redirects.
    path: 'validar-farmacias',
    loadChildren: () => import('./pages/application/validar-farmacias/validar-farmacias.module').then(m => m.ValidarFarmaciasModule),
    canActivate: [authGuard],
    data: { roles: ['ROLE_PHARMACEUTICAL_DIRECTOR'] }
  },
  {
    // Fuera del authGuard a propósito: el QF llega acá SIN sesión, desde el link del mail.
    // Lo que lo autoriza es el token de un solo uso del query param.
    path: 'definir-clave',
    loadChildren: () => import('./pages/application/definir-clave/definir-clave.module').then(m => m.DefinirClaveModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/application/registro/registro.module').then(m => m.RegistroModule)
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
