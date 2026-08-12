import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './interceptors/auth.guard';
import { registeredGuard } from './interceptors/registered.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/application/home/home.module').then(h => h.HomeModule),
    canActivate: [authGuard, registeredGuard],
    data: { roles: ['ROLE_PHARMACEUTICAL_DIRECTOR'] }
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/application/login/login.module').then(l => l.LoginModule)
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
