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
import { AuthService } from '../../../services/auth.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

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
    MatTabsModule,
    MatFormFieldModule,
    AppointmentStatsComponent

  ],

  styleUrls: ['./appointment-list.component.scss']
})

export class AppointmentListComponent implements OnInit {
  allAppointments: any[] = [];
  filteredAppointments: any[] = [];
  pagedAppointments: any[] = [];

  displayedColumns: string[] = [];

  fromDate: string = '';
  toDate: string = '';
  selectedStatus: string = '';
  selectedTabIndex: number = 0; // Index de l'onglet sélectionné

  @Input() appointments: any[] = [];
  @Input() professionals: any[] = [];

  userRole: string | null = null;


  // Pagination variables
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;
  
  private notificationSubscription!: Subscription;


  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

 

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();  // Récupérer le rôle de l'utilisateur
    this.loadAppointments();
    this.loadProfessionals();
    this.setDisplayedColumns();
    this.subscribeToNotifications();
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

        this.totalPages = Math.ceil(this.professionals.length / this.pageSize);
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
  // Pagination logic
  updatePagedAppointments() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedAppointments = this.professionals.slice(start, end);
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


  // Notification logic
  private subscribeToNotifications() {
    this.notificationSubscription = this.appointmentService.getNotifications()
      .subscribe(notification => {
        this.snackBar.open(notification.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.loadAppointments(); // Refresh the list
      });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }
   
  // Filter logic
  applyFilters() {
    const from = this.fromDate || '0000-01-01';
    const to = this.toDate || '9999-12-31';

    this.appointments = this.allAppointments.filter(appt => {
      const apptDate = new Date(appt.date);
      const apptDateOnly = `${apptDate.getFullYear()}-${(apptDate.getMonth() + 1).toString().padStart(2, '0')}-${apptDate.getDate().toString().padStart(2, '0')}`;

      return apptDateOnly >= from && apptDateOnly <= to;
    });

    if (this.selectedStatus) {
      this.appointments = this.appointments.filter(appt => 
        appt.status?.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }


    this.totalPages = Math.ceil(this.professionals.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagedAppointments();
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.filterAppointmentsByTab();
  }

  filterAppointmentsByTab() {
    this.applyFilters();
  }

  getStatusFromTabIndex(index: number): string | null {
    switch (index) {
      case 1: return 'confirmed';
      case 2: return 'cancelled';
      case 3: return 'pending';
      case 4: return 'completed';
      default: return null;
    }
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
