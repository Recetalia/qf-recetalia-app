import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { catchError, map } from 'rxjs';

@Component({
  selector: 'app-header-home',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  active: boolean = true;
  isSearchPage: boolean = false;
  isChainAdmin: boolean = false;

  constructor(private router: Router, private authService: AuthService) {
    this.router.navigate(['']);  // Redirect to add
  }

  ngOnInit() { // Correct lifecycle hook name
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.active = user.status !== 'INACTIVE';
        // El admin de cadena ve recetas pero no dispensa: ocultamos "Buscar Prescripción" para evitar confusión.
        this.isChainAdmin = user.role === 'ROLE_PHARMACY_ADMIN';
      }
    });
    this.isSearchPage = this.router.url.includes('/prescriptions/search');
    this.router.events.subscribe(() => {
      this.isSearchPage = this.router.url.includes('/prescriptions/search');
    });
  }

  onToggleSidebar() {
    this.toggleSidebar.emit(); // Emit the event to the parent component
  }

  redirectToAdd() {
    this.router.navigate(['/prescriptions/search']);
  }
}
