import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { EditUserDialogComponentComponent } from '../edit-user-dialog-component/edit-user-dialog-component.component';
import { User } from '../../../models/user.model'; 
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatChipsModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'profession', 'createdAt', 'actions'];
  isLoading = true;
  totalUsers = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 100];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.totalUsers = users.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.snackBar.open('Failed to load users. Please try again later.', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    // Implement server-side pagination if needed
  }

  deleteUser(userId: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { 
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this user? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (err) => {
            console.error('Failed to delete user:', err);
            this.snackBar.open('Failed to delete user. Please try again.', 'Close', {
              duration: 5000
            });
            this.isLoading = false;
          }
        });
      }
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(EditUserDialogComponentComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUser(user._id, result).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (err) => {
            console.error('Failed to update user:', err);
            this.snackBar.open('Failed to update user. Please try again.', 'Close', {
              duration: 5000
            });
          }
        });
      }
    });
  }

  getRoleColor(role: string): string {
    switch (role.toLowerCase()) { // Handle case variations
      case 'admin': 
        return '#3f51b5'; // Indigo
      case 'professional': 
        return '#4caf50'; // Green
      case 'client': 
        return '#ff9800'; // Orange
      default: 
        return '#9e9e9e'; // Grey for unknown roles
    }
  }

}
