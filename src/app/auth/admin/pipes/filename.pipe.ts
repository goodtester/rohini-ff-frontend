import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filename',
})
export class FilenamePipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (value == null) {
      value = 'Choose an image';
    }
    return value;
  }
}
