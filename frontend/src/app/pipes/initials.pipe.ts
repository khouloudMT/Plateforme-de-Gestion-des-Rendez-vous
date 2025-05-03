import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {

  transform(name: string): string {
    if (!name) return '';

    const names = name.trim().split(' ').filter(n => n); // Remove extra spaces

    if (names.length === 1) {
      // Capitalize only the first letter, lowercase the rest
      return this.capitalize(names[0]);
    }

    const firstName = this.capitalize(names[0]);
    const secondInitial = names[1][0].toUpperCase();

    return `${firstName} ${secondInitial}.`;
  }

  private capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}
