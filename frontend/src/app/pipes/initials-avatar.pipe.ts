import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initialsAvatar',
  standalone: true
})
export class InitialsAvatarPipe implements PipeTransform {
  transform(name: string): string {
    if (!name) return '';

    const names = name.trim().split(' ').filter(n => n);

    if (names.length === 1) {
      return names[0][0].toUpperCase();
    }

    const firstInitial = names[0][0].toUpperCase();
    const lastInitial = names[names.length - 1][0].toUpperCase();

    return `${firstInitial}${lastInitial}`;
  }
}
