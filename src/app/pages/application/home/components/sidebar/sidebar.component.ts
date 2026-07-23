import { Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../../../services/auth.service';
import { PharmacyService } from '../../../../../services/pharmacy.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() isSidebarHidden = false;
  @Output() sidebarToggle = new EventEmitter<boolean>(); // Notify parent to hide
  deferredPrompt: any;
  pharmacyName = '';
  userRole: string | null = null;

  constructor(
    private eRef: ElementRef,
    private router: Router,
    private authService: AuthService,
    private pharmacyService: PharmacyService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault(); // Prevent automatic prompt
      this.deferredPrompt = event;
    });

    const token = localStorage.getItem('token');
    if (!token) return;

    let payload: any;
    try {
      payload = JSON.parse(atob(token.split('.')[1]));
    } catch {
      return;
    }
    const email = payload?.mail ?? payload?.sub;
    if (!email) return;

    this.pharmacyService.getByEmail(email).subscribe({
      next: (pharmacy: any) => {
        this.pharmacyName = (pharmacy?.name ?? '').trim() || (pharmacy?.businessName ?? '').trim() || '';
      },
      error: () => { /* swallow */ }
    });

    this.authService.getCurrentUser().subscribe({
      next: (user: any) => { if (user) this.userRole = user.role; },
      error: () => { /* ignore */ },
    });
  }

  // Detect click outside the sidebar
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target) && !this.isSidebarHidden) {
      this.sidebarToggle.emit(true); // emit true to hide
    }
  }

  closeSidebar() {
    this.sidebarToggle.emit(true); // emit true to hide
  }

  promptInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        this.deferredPrompt = null;
      });
    }
  }
}
