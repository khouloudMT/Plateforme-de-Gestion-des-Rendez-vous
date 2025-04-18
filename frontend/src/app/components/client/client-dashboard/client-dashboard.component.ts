import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentFormComponent } from '../../appointment/appointment-form/appointment-form.component';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';



@Component({
  selector: 'app-client-dashboard',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    RouterModule,
    RouterOutlet,
    RouterLink
],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss'
})
export class ClientDashboardComponent {
  appointments: any[] = [];
  professionals: any[] = [];
  displayedColumns: string[] = ['professional', 'date', 'time', 'status', 'actions'];
  
  constructor(
    private appointmentService: AppointmentService,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.loadAppointments();
    this.loadProfessionals();
  }

  loadAppointments() {
    this.appointmentService.getClientAppointments().subscribe(appointments => {
      this.appointments = appointments;
    });
  }

  loadProfessionals() {
    this.userService.getProfessionals().subscribe(professionals => {
      this.professionals = professionals;
    });
  }

  openAppointmentForm() {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '600px',
      data: { professionals: this.professionals }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
      }
    });
  }

  cancelAppointment(appointmentId: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to cancel this appointment?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.deleteAppointment(appointmentId).subscribe(() => {
          this.loadAppointments();
        });
      }
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
