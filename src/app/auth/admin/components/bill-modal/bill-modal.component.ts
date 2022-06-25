import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';

import { Bill } from '../../interfaces/bill.interface';
import { BillComponent } from '../../pages/bill/bill.component';
import { BillService } from '../../services/bill.service';

@Component({
  selector: 'app-bill-modal',
  templateUrl: './bill-modal.component.html',
  styles: [],
})
export class BillModalComponent implements OnInit {
  @Input() bill!: Bill;
  constructor(private billService: BillService, private billPage: BillComponent) {}

  @Output() close: EventEmitter<boolean> = new EventEmitter();

  ngOnInit(): void {}

  closeModal() {
    this.close.emit(false);
  }

  statusBill(idBill: number, statusBill: string) {
    let status = '';
    if (statusBill == 'DELETED') {
      status = 'deleted';
    }
    if (statusBill == 'PAID') {
      status = 'paid';
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Change the status of the order',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ok',
    }).then((result) => {
      if (result.isConfirmed) {
        this.billService.updateStatusBill(idBill, statusBill).subscribe(() => {
          this.billPage.ngOnInit();
        });
        this.close.emit(false);
        Swal.fire('Invoice ' + status, 'Invoice status changed ' + idBill, 'success');
      }
    });
  }
}
