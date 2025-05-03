import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppointmentService } from '../../../services/appointment.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-appointment-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule, //toast notification
    MatTooltipModule, //tooltip for the form fields
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss'
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm;
  allTimeSlots: string[] = [];
  bookedSlots: string[] = [];
  minDate: Date = new Date();

  dayBlocked: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AppointmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {
    this.appointmentForm = this.fb.group({
      professional: [data.selectedProfessionalId ||'', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.generateAllSlots();
    this.appointmentForm.get('date')?.valueChanges.subscribe(date => {
      const professionalId = this.appointmentForm.get('professional')?.value;
      if (professionalId && date) {
        const formattedDate = new Date(date).toISOString().split('T')[0];
        this.fetchAvailableSlots(professionalId, formattedDate);
      }
    });
  }

  generateAllSlots() {
    const slots: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour}:00`, `${hour}:30`);
    }
    this.allTimeSlots = slots;
  }

  fetchAvailableSlots(professionalId: string, date: string) {
    this.appointmentService.getAvailableSlots(professionalId, date).subscribe({
      next: (res) => {
        this.bookedSlots = this.allTimeSlots.filter(slot => !res.availableSlots.includes(slot));
        this.dayBlocked = res.alreadyBookedThatDay; 
      },
      error: (err) => {
        console.error('Error loading slots:', err);
        this.bookedSlots = [];
        this.dayBlocked = false;
      }
    });
  }
  

  selectSlot(slot: string) {
    if (this.bookedSlots.includes(slot)) return;
    this.appointmentForm.get('time')?.setValue(slot);
  }  
  // For better UX, we can disable the booked slots in the dropdown
  generateAllTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour}:00`, `${hour}:30`);
    }
    return slots;
  }
  isSlotDisabled(slot: string): boolean {
    return this.dayBlocked || this.bookedSlots.includes(slot);
  }
  getBookedSlots(availableSlots: string[]): string[] {
    const fullSlots = this.generateAllTimeSlots();
    this.allTimeSlots = fullSlots;
    return fullSlots.filter(slot => !availableSlots.includes(slot));
  }
  
  onSubmit() {
    const appointmentData = this.appointmentForm.value;

    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: res => {
        this.snackBar.open('Appointment added successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true);
      }
    });
  }
}