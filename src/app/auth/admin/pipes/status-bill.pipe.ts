import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBill',
})
export class StatusBillPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'DELETED':
        value = 'DELETED';
        break;
      case 'PENDING':
        value = 'PENDING';
        break;
      case 'PAID':
        value = 'PAID';
        break;
    }
    return value;
  }
}
