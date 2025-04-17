import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppointmentService } from '../../../services/appointment.service';
import { UserService } from '../../../services/user.service';

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
    MatButtonModule
  ],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss'
})
export class AppointmentFormComponent {
  appointmentForm;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AppointmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private appointmentService: AppointmentService
  ) {
    this.appointmentForm = this.fb.group({
      professional: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      notes: ['']
    });
  }
  timeSlots: string[] = this.generateTimeSlots();
  minDate: Date = new Date();


  generateTimeSlots(): string[] {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  }

  onSubmit() {
    const appointmentData = this.appointmentForm.value;

    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: res => {
        console.log("Rendez-vous enregistré", res);
        this.dialogRef.close(true);
      },
      error: err => {
        if (err.status === 400) {
          alert(err.error.msg); 
        } else {
          console.error("Erreur :", err);
        }
      }
    });
  }
}
