import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AppointmentService } from '../../../services/appointment.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


@Component({
  selector: 'app-reschedule-appointment',
  imports: [
    FormsModule,
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './reschedule-appointment.component.html',
  styleUrls: ['./reschedule-appointment.component.scss']
})
export class RescheduleAppointmentComponent implements OnInit {
  appointment = {
    _id: '', // Added _id property
    date: '',
    time: '',
    notes: ''
  };
  minDate: Date = new Date();
  timeSlots: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<RescheduleAppointmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.timeSlots = this.generateTimeSlots();
    this.loadAppointment();
  }

  generateTimeSlots(): string[] {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${this.pad(hour)}:00`);
      slots.push(`${this.pad(hour)}:30`);
    }
    return slots;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  loadAppointment() {
    if (!this.data || !this.data._id) {
      console.error("No appointment ID provided.");
      return;
    }

    this.appointmentService.getAppointmentById(this.data._id.trim()).subscribe({
      next: (res: any) => {
        this.appointment = {
          _id: res._id || '', // Ensure _id is included
          date: res.date?.split('T')[0], // yyyy-mm-dd
          time: res.time,
          notes: res.notes || ''
        };
        
      },
      error: err => {
        console.error("Failed to load appointment", err);
      }
    });
  }

  onReschedule() {
    const updatedData = {
      date: this.appointment.date,
      time: this.appointment.time,
      notes: this.appointment.notes
    };
    
    if (!this.appointment.date || !this.appointment.time) {
      alert("Date and Time are required.");
      return;
    }

    this.appointmentService.updateAppointment(this.appointment._id, updatedData).subscribe({
      next: (res) => {
        this.snackBar.open('Appointment updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open('Failed to update appointment.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error("Update failed", err);
      }
    });
    
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
