import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-professional-dashboard',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './professional-dashboard.component.html',
  styleUrl: './professional-dashboard.component.scss'
})
export class ProfessionalDashboardComponent {
  appointments: any[] = [];
  displayedColumns: string[] = ['client', 'date', 'time', 'status', 'actions'];

  constructor(private appointmentService: AppointmentService) {
    this.loadAppointments();
  }

  loadAppointments() {
    this.appointmentService.getProfessionalAppointments().subscribe(appointments => {
      this.appointments = appointments;
    });
  }

  updateAppointmentStatus(appointmentId: string, status: string) {
    this.appointmentService.updateAppointment(appointmentId, { status }).subscribe(() => {
      this.loadAppointments();
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'primary';
      case 'pending': return 'accent';
      case 'cancelled': return 'warn';
      default: return '';
    }
  }

}
