import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-appointment-details-modal',
  imports: [CommonModule],
  templateUrl: './appointment-details-modal.component.html',
  styleUrl: './appointment-details-modal.component.scss'
})
export class AppointmentDetailsModalComponent {
  constructor(public authService: AuthService) {}
  @Input() visible = false;
  @Input() data: any = {};

  ngOnChanges() {
    console.log('Modal input data:', this.data);
    console.log('User is professional:', this.isProfessional());
  }

  close() {
    this.visible = false;
  }
  isProfessional(): boolean {
    return this.authService.getUserRole() === 'professional';
  }

}
