import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-user-dialog-component',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-user-dialog-component.component.html',
  styleUrl: './edit-user-dialog-component.component.scss'
})
export class EditUserDialogComponentComponent {
  editForm: FormGroup;
  roles = ['admin', 'professional', 'client'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditUserDialogComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any }
  ) {
    this.editForm = this.fb.group({
      name: [data.user.name, Validators.required],
      email: [data.user.email, [Validators.required, Validators.email]],
      role: [data.user.role, Validators.required],
      profession: [data.user.profession || '']
    });
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
