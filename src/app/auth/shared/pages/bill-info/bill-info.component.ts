import { Component, OnInit } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { OrdersDTO, BillUserDTO } from 'src/app/auth/admin/interfaces/bill.interface';
import { imageLogo } from 'src/assets/logo';
import Swal from 'sweetalert2';
import { CompanyElement } from '../../interfaces/company.interface';
import { UserInfo } from '../../interfaces/tokenUser.interface';
import { CheckoutService } from '../../services/checkout.service';
import { CompanyService } from '../../services/company.service';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-bill-info',
  templateUrl: './bill-info.component.html',
  styles: [],
})
export class BillInfoComponent implements OnInit {
  constructor(
    private loginService: LoginService,
    private companyService: CompanyService,
    private checkoutService: CheckoutService
  ) {}
  user!: UserInfo;
  billInformation!: BillUserDTO;
  billOrder!: OrdersDTO[];
  companyInfo!: CompanyElement;

  totalValueTaxes: number = 0;
  taxes: number = 0;
  payMode: string = '';

  image: string = imageLogo.image;

  print() {
    html2canvas(document.querySelector('#capture')!).then((canvas) => {
      const imageData = canvas.toDataURL('image/jpeg');
      const pdf = new jsPDF();
      const imageProps = pdf.getImageProperties(imageData);
      const pdfw = pdf.internal.pageSize.getWidth() / 2;
      const pdfh = (imageProps.height * pdfw) / imageProps.width;
      pdf.addImage(imageData, 'PNG', 0, 0, pdfw, pdfh);
      pdf.save('factura' + this.billInformation.idBill + '.pdf');
    });
  }

  async ngOnInit() {
    this.checkoutService.getTaxes().subscribe((resp) => {
      resp.data.tax.forEach((element) => {
        this.taxes = element.value;
      });
    });
    if (localStorage.getItem('token') != null) {
      this.loginService.getUser().subscribe((resp) => {
        this.user = resp.data?.user.user!;
      });
    }
    if (localStorage.getItem('bill') != null) {
      this.checkoutService.getBill().subscribe((resp) => {
        this.billInformation = resp.data.bill.billUserDTO;
        this.payMode = resp.data.bill.billUserDTO.payMode.name;
        this.billOrder = resp.data.bill.ordersDTO;
        this.totalValueTaxes = this.billInformation.totalPrice * this.taxes;
      });
      this.companyService.getCompany().subscribe((companyInfo) => {
        companyInfo.data.company.forEach((element) => {
          this.companyInfo = element;
        });
      });
    }
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));

    Swal.fire({
      title: 'Do you want to download your invoice?',
      text: 'You can print a copy at store',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ok, Download',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.print();
        Swal.fire('Ok', 'Check your invoice in your downloads folder', 'success');
      }
    });
  }
}
