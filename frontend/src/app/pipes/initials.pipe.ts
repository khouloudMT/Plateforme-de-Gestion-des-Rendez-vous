import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {

  transform(name: string): string {
    // no name return empty string
    if (!name) return '';
    // split name (fatma rabai) to 'fatma' 'rabai'
    const names = name.split(' ');
    if (names.length > 1) {
      // if 2 names or more return (fatma rabai) to 'FR'
      const firstInitial = names[0][0]; 
      const lastInitial = names[names.length - 1][0]; 
      return `${firstInitial}${lastInitial}`.toUpperCase();
    } else {
      // one name (fatma) return 'F'
      return names[0][0].toUpperCase();
    }
  }
}
