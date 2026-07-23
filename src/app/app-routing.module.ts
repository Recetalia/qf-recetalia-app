import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './interceptors/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/application/home/home.module').then(h => h.HomeModule),
    canActivate: [authGuard], // Ensure the user is authenticated
    data: { roles: ['ROLE_PHARMACY', 'ROLE_PHARMACY_ADMIN'] }
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/application/register/register.module').then(m => m.RegistergModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/application/login/login.module').then(l => l.LoginModule)
  },
  { path: '**', redirectTo: 'login' } // Redirect any unknown path to the login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
