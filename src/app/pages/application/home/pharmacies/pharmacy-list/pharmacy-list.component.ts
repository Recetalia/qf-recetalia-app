import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PharmaceuticalDirectorService } from '../../../../../services/pharmaceutical-director.service';
import { PharmacyResponse } from '../../../../../model/response/pharmacy-response';

@Component({
  selector: 'app-pharmacy-list',
  templateUrl: './pharmacy-list.component.html'
})
export class PharmacyListComponent implements OnInit {
  pharmacies: PharmacyResponse[] = [];
  loading = true;

  constructor(private pd: PharmaceuticalDirectorService, private router: Router) {}

  ngOnInit(): void {
    this.pd.getMyPharmacies().subscribe({
      next: (list) => { this.pharmacies = list ?? []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  open(p: PharmacyResponse) {
    this.router.navigate(['/farmacias', p.id, 'recetas-verdes']);
  }
}
