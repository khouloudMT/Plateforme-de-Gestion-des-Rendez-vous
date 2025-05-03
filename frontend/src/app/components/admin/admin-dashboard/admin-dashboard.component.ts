import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AppointmentListComponent } from '../../appointment/appointment-list/appointment-list.component';
import { UserListComponent } from '../user-list/user-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { StatsComponent } from "../stats/stats.component";

@Component({
  selector: 'app-admin-dashboard',
  imports: [MatCardModule, RouterModule, RouterOutlet,
    CommonModule,
    MatCardModule,
    MatTabsModule,
    RouterModule,
    RouterOutlet,
    UserListComponent,
    AppointmentListComponent,
    MatButtonModule,
    MatIconModule, StatsComponent],
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  activeTab = 'Statistics';

}
