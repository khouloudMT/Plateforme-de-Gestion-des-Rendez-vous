import { Component, Input, OnInit } from '@angular/core';
import { AppointmentService } from '../../../services/appointment.service';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component'; // ajuste le chemin si besoin


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
  randomProfessionals: any[] = [];

  pagedAppointments: any[] = [];
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private appointmentService: AppointmentService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    // this.loadRandomProfessionals();
  }

  loadAppointments() {
    this.appointmentService.getClientAppointments().subscribe({
      next: (res: any[]) => {
        this.appointments = res;
        this.allAppointments = res;
  
        // Ajoute ces lignes pour gérer la pagination
        this.totalPages = Math.ceil(this.appointments.length / this.pageSize);
        this.currentPage = 1;
        this.updatePagedAppointments();
      },
      error: err => {
        console.error("Erreur chargement appointments", err);
      }
    });
  }

  // Pagination logic
  updatePagedAppointments() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedAppointments = this.appointments.slice(start, end);
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedAppointments();
    }
  }
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedAppointments();
    }
  }
  

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
    // Ici tu peux ouvrir un dialog pour éditer si besoin
    console.log('Edit', appt);
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
