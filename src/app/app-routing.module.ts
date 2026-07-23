import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './interceptors/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/application/home/home.module').then(h => h.HomeModule),
    canActivate: [authGuard],
    data: { roles: ['ROLE_PHARMACEUTICAL_DIRECTOR'] }
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/application/login/login.module').then(l => l.LoginModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./pages/application/change-password/change-password.module').then(m => m.ChangePasswordModule)
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
