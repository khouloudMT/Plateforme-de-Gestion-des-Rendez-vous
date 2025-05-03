import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';


import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AppointmentService } from '../../../services/appointment.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  currentUser: any;
  // notifications: any[] = [];
  // private notificationSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private appointmentService: AppointmentService
  ) {
    this.currentUser = this.authService.currentUserValue;
    // this.notificationSubscription = this.appointmentService.getNotifications()
    //   .subscribe((notification: any) => {
    //     this.notifications.unshift(notification);
    //   });
  }

  // Notificatipns
  // ngOnDestroy() {
  //   if (this.notificationSubscription) {
  //     this.notificationSubscription.unsubscribe();
  //   }
  // }
  // clearNotifications() {
  //   this.notifications = [];
  // }

  getDashboardRoute(): string {
    const role = this.authService.getUserRole();
    if (role === 'admin') return '/admin';
    if (role === 'professional') return '/professional';
    return '/client';
  }

  logout() {
    this.authService.logout();
  }

}
