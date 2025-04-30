import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { SidebarComponent } from "../../layout/sidebar/sidebar.component";



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
    SidebarComponent
],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss'
})
export class ClientDashboardComponent {
  appointments: any[] = [];
  displayedColumns: string[] = ['professional', 'date', 'time', 'status', 'actions'];

  sidebarCollapsed = false;
  currentUser = { name: 'John Doe', email: 'john@example.com' };
  
  clientNavItems = [
    { label: 'My Appointments', icon: 'event', link: '/client' },
    { label: 'Calendar', icon: 'calendar_today', link: '/client/calendar' },
    { label: 'Professionals', icon: 'people', link: '/client/professionals' }
  ];
  
  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog
  ) {
    this.loadAppointments();
  }

  loadAppointments() {
    this.appointmentService.getClientAppointments().subscribe(appointments => {
      this.appointments = appointments;
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


}
