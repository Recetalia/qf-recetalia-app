import { Component } from '@angular/core';
import { AmpService } from '../../../../services/amp.service';
import { MedicineResponse } from '../../../../model/response/medicine-response';

@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  styleUrl: './medicine.component.scss'
})
export class MedicineComponent {


  constructor(private ampService: AmpService) {

    this.ampService.getSearchByprodMspLike('PERIFAR').subscribe(
      (data: MedicineResponse[]) => {
        console.log('MedicineResponse[] => ', data);
      },
      error => {
        console.error('Error fetching medicine', error);
      });
  }


}

