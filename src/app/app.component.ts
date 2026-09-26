import { Component, inject } from '@angular/core';
import { AppUpdateService } from './services/app-update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'qf-recetalia-app';

  constructor() {
    // Sin esto el service worker seguía sirviendo la versión anterior después
    // de cada deploy. Ver AppUpdateService.
    inject(AppUpdateService).iniciar();
  }
}
