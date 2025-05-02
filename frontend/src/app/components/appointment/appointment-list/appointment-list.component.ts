import { Component, Input, OnInit } from '@angular/core';
import { AppointmentService } from '../../../services/appointment.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { AuthService } from '../../../services/auth.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  imports: [
    ReactiveFormsModule,
    CommonModule,

    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatPaginatorModule,
  

    AppointmentStatsComponent

  ],

  styleUrls: ['./appointment-list.component.scss']
})

export class AppointmentListComponent implements OnInit {
  allAppointments: any[] = [];
  filteredAppointments: any[] = [];
  pagedAppointments: any[] = [];

  displayedColumns: string[] = [];

  filterForm = new FormGroup({
    fromDate: new FormControl(''),
    toDate: new FormControl(''),
    selectedStatus: new FormControl('')
  });

  @Input() appointments: any[] = [];
  @Input() professionals: any[] = [];

  userRole: string | null = null;


  // Pagination variables
  pageSize = 7; 
  currentPage = 1;
 
  
  private notificationSubscription!: Subscription;


  constructor(
    private appointmentService: AppointmentService,
    private fb: FormBuilder,
    
    private dialog: MatDialog,
    private userService: UserService,
    private authService: AuthService,
  ) {
    this.filterForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      selectedStatus: ['']
    });
  }

 

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();  // Récupérer le rôle de l'utilisateur
    this.loadAppointments();
    this.loadProfessionals();
    this.setDisplayedColumns();
    // this.loadRandomProfessionals();
  }

  setDisplayedColumns() {
    if (this.userRole === 'client') {
      this.displayedColumns = ['date', 'time', 'professional', 'profession', 'status', 'edit', 'cancel'];
    } else if (this.userRole === 'professional') {
      this.displayedColumns = ['date', 'time', 'client', 'phone', 'email', 'status', 'edit', 'cancel'];
    }
  }

  loadAppointments() {
    this.appointmentService.getClientAppointments().subscribe({
      next: (res: any[]) => {
        this.appointments = res;
        this.allAppointments = res; // Stocker tous les rendez-vous pour le filtrage

        this.currentPage = 1;
        this.updatePagedAppointments();
      },
      error: err => {
        console.error("Erreur chargement appointments", err);
      }
    });
  }

  loadProfessionals() {
    this.userService.getProfessionals().subscribe(professionals => {
      this.professionals = professionals;
    });
  }

  //Pagination
  handlePageEvent(e: PageEvent) {
    this.currentPage = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.updatePagedAppointments();
  }
  
  updatePagedAppointments() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedAppointments = this.appointments.slice(startIndex, endIndex);
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

  editAppointment(appt: any) {
    const dialogRef = this.dialog.open(RescheduleAppointmentComponent, {
      width: '400px',
      data: { _id: appt._id }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadAppointments();
      }
    });
  }

  cancelAppointment(appointment: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to cancel this appointment?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const currentUser = this.authService.currentUserValue;
        
        if (currentUser.role === 'client') {
          this.appointmentService.clientCancels(appointment, currentUser, appointment.professional)
            .subscribe(() => this.loadAppointments());
        } else if (currentUser.role === 'professional') {
          this.appointmentService.professionalUpdatesStatus(appointment, currentUser, appointment.client, 'cancelled')
            .subscribe(() => this.loadAppointments());
        }
      }
    });
  }
  
  confirmAppointment(appointment: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to confirm this appointment?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const currentUser = this.authService.currentUserValue;
        
        if (currentUser.role === 'professional') {
          this.appointmentService.professionalUpdatesStatus(appointment, currentUser, appointment.client, 'confirmed')
            .subscribe(() => this.loadAppointments());
        }
      }
    });
  }


   
  // Filter logic
  applyFilters() {
    const { fromDate, toDate, selectedStatus } = this.filterForm.value;
    const from = fromDate || '0000-01-01';
    const to = toDate || '9999-12-31';

    this.appointments = this.allAppointments.filter(appt => {
      const apptDate = new Date(appt.date);
      const apptDateOnly = `${apptDate.getFullYear()}-${(apptDate.getMonth() + 1).toString().padStart(2, '0')}-${apptDate.getDate().toString().padStart(2, '0')}`;

      return apptDateOnly >= from && apptDateOnly <= to;
    });

    if (selectedStatus) {
      console.log('Selected status:', selectedStatus);
      this.appointments = this.appointments.filter(appt => {
        console.log('Appointment status:', appt.status);
        return appt.status?.toLowerCase() === selectedStatus.toLowerCase();
      });
    }
    this.currentPage = 1;
    this.updatePagedAppointments();
  }

}
