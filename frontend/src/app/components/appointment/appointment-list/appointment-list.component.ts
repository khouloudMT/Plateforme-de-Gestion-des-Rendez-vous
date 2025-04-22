import { Component, Input, OnInit } from '@angular/core';
import { AppointmentService } from '../../../services/appointment.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component'; // ajuste le chemin si besoin
import { RescheduleAppointmentComponent } from '../reschedule-appointment/reschedule-appointment.component';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { UserService } from '../../../services/user.service';
import { AppointmentStatsComponent } from '../appointment-stats/appointment-stats.component';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  imports: [
    FormsModule,
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    AppointmentStatsComponent
  ],

  styleUrls: ['./appointment-list.component.scss']
})

export class AppointmentListComponent implements OnInit {
  allAppointments: any[] = [];
  displayedColumns: string[] = ['professional', 'date', 'time', 'status', 'actions'];
  statusOptions: string[] = ['confirmed', 'pending', 'canceled'];
  fromDate: string = '';
  toDate: string = '';
  selectedStatus: string = '';
  @Input() appointments: any[] = [];
  @Input() professionals: any[] = [];

  currentPage: number = 0;
  pageSize: number = 7; // Nombre d'éléments par page
  totalItems = this.appointments.length;
  pagedAppointments: any[] = []; // Liste paginée des rendez-vous
  

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadProfessionals();
    // this.loadRandomProfessionals();
  }

  


  loadAppointments() {
    this.appointmentService.getClientAppointments().subscribe({
      next: (res: any[]) => {
        this.appointments = res;
  
      },
      error: err => {
        console.error("Erreur chargement appointments", err);
      }
    });
  }

  // Appointment form logic
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
  loadProfessionals() {
    this.userService.getProfessionals().subscribe(professionals => {
      this.professionals = professionals;
    });
  }

 
  
  // Filter logic
  applyFilters() {
    this.appointments = this.allAppointments.filter(appt => {
      const apptDate = new Date(appt.date).toISOString().slice(0, 10);
      const from = this.fromDate || '0000-01-01';
      const to = this.toDate || '9999-12-31';

      const dateMatch = apptDate >= from && apptDate <= to;
      const statusMatch = this.selectedStatus ? appt.status?.toLowerCase() === this.selectedStatus.toLowerCase() : true;

      return dateMatch && statusMatch;
    });
  }

  editAppointment(appt: any) {
    const dialogRef = this.dialog.open(RescheduleAppointmentComponent, {
      width: '400px',
      data: appt
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadAppointments();
      }
    });
  }
  
  

  deleteAppointment(appt: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to cancel this appointment?' }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.deleteAppointment(appt._id).subscribe(() => {
          this.appointments = this.appointments.filter(a => a._id !== appt._id);
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
    case 'completed': return 'green';
    default: return '';
  }
}


}
