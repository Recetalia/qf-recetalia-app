import { Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() isSidebarHidden = false;
  @Output() sidebarToggle = new EventEmitter<boolean>();
  deferredPrompt: any;
  displayName = 'Químico Farmacéutico';

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      this.deferredPrompt = event;
    });

    const user = this.authService.getCurrentUser();
    if (user?.cjp) {
      this.displayName = user.cjp;
    }
  }

  // Se quitó el @HostListener('document:click') que auto-cerraba el sidebar en
  // cualquier click: peleaba con el toggle del header y lo dejaba trabado sin
  // poder reabrir. Ahora abre/cierra solo con el botón del header.

  closeSidebar() {
    this.sidebarToggle.emit(true);
  }

  logout() {
    this.authService.logout();
  }

  promptInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        this.deferredPrompt = null;
      });
    }
  }
}
