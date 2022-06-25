import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { BillInterface, OrdersDTO } from '../../interfaces/bill.interface';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-order-side',
  templateUrl: './order-side.component.html',
  styles: [],
})
export class OrderSideComponent implements OnInit {
  @Output() homeProductsDetails = new EventEmitter<OrdersDTO[]>();

  isClicked: number = 0;
  constructor(private homeService: HomeService) {}
  enable: boolean = false;
  orders: BillInterface = null!;
  statusOrder: string = 'NEW';
  ngOnInit(): void {
    this.getOrders('NEW');
  }

  getOrders(statusOrder: string) {
    this.statusOrder = statusOrder;
    this.homeService.getOrders(statusOrder).subscribe((order) => {
      this.orders = order;
      if(order.data?.bill.length > 0) {
        this.sortByIdBill();

        //the first item is called to show in the detailsOrder
        const elemetData = this.orders.data.bill[0];
        this.showDetails(elemetData.ordersDTO, elemetData.billUserDTO.idBill);  
        this.enable = true;
      } else {
        this.homeProductsDetails.emit();
      }
    });
  }

  showDetails(productsDetails: OrdersDTO[], idBill: number) {
    this.homeProductsDetails.emit(productsDetails);
    this.isClicked = idBill;
  }

  sortByIdBill() {
    this.orders.data.bill.sort((a, b) => a.billUserDTO.idBill - b.billUserDTO.idBill);
  }

  changeStatusOrder(idBill: number) {
    switch (this.statusOrder) {
      case 'NEW':
        Swal.fire({
          title: 'Do you want to change the status of the order?',
          text: 'The status will be changed to "Cooking"',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'OK',
          cancelButtonText: 'CANCEL',
        }).then((result) => {
          if (result.isConfirmed) {
            this.homeService.setStatusOrder(idBill, 'COOKING').subscribe(() => {
              this.getOrders('NEW');
            });
            Swal.fire('Success!', 'Look into the Cooking section for the order #' + idBill, 'success');
          }
        });

        break;
      case 'COOKING':
        Swal.fire({
          title: 'Do you want to change the status of the order?',
          text: 'The status will be changed to "Delivered"',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'OK',
          cancelButtonText: 'CANCEL',
        }).then((result) => {
          if (result.isConfirmed) {
            this.homeService.setStatusOrder(idBill, 'DELIVERED').subscribe(() => {
              this.getOrders('COOKING');
            });
            Swal.fire('Success!', 'Look into the Delivered section for the order #' + idBill, 'success');
          }
        });
        break;
    }
  }
}
