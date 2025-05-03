import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../services/user.service';
import { StatsService } from '../../../services/stats.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

interface RegistrationStats {
  dates: string[];
  counts: number[];
}

interface RoleStats {
  roles: string[];
  counts: number[];
}

interface StatusStats {
  statuses: string[];
  counts: number[];
}

interface MonthlyStats {
  totalUsers: number;
  newUsers: number;
  totalAppointments: number;
  completedAppointments: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    MatSnackBarModule
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit  {
  isLoading = true;
  
  
  // Registration Chart
  regChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [
      {
        data: [],
        label: 'Registrations',
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63, 81, 181, 0.3)',
        fill: true,
        tension: 0.4
      }
    ],
    labels: []
  };
  regChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'User Registrations (Last 30 Days)',
        font: { size: 14 }
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
  regChartType: ChartType = 'line';

   // Role Distribution Chart
   roleChartData: ChartConfiguration<'doughnut'>['data'] = {
    datasets: [
      {
        data: [],
        backgroundColor: ['#3f51b5', '#4caf50', '#ff9800'],
        hoverBackgroundColor: ['#303f9f', '#388e3c', '#f57c00']
      }
    ],
    labels: []
  };
  roleChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'right'
      },
      title: {
        display: true,
        text: 'User Role Distribution',
        font: { size: 14 }
      }
    }
  };
  roleChartType: ChartType = 'doughnut';

    // Appointment Status Chart
    statusChartData: ChartConfiguration<'pie'>['data'] = {
      datasets: [
        {
          data: [],
          backgroundColor: [
            '#ff9800', // pending
            '#4caf50', // confirmed
            '#f44336', // cancelled
            '#2196f3'  // completed
          ]
        }
      ],
      labels: []
    };
    statusChartOptions: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: true,
          position: 'right'
        },
        title: {
          display: true,
          text: 'Appointment Status',
          font: { size: 14 }
        }
      }
    };
    statusChartType: ChartType = 'pie';

      // Monthly Stats
  monthlyStats: MonthlyStats = {
    totalUsers: 0,
    newUsers: 0,
    totalAppointments: 0,
    completedAppointments: 0
  };
  constructor(
    private userService: UserService,
    private statsService: StatsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;

    forkJoin({
      regStats: this.userService.getRegistrationStats(),
      roleStats: this.userService.getUserRoleStats(),
      statusStats: this.statsService.getStatusStats(),
      monthlyStats: this.statsService.getMonthlyStats()
    }).subscribe({
      next: ({regStats, roleStats, statusStats, monthlyStats}) => {
        // Update registration chart
        this.regChartData = {
          ...this.regChartData,
          labels: regStats.dates,
          datasets: [{
            ...this.regChartData.datasets[0],
            data: regStats.counts
          }]
        };

        // Update role distribution chart
        this.roleChartData = {
          ...this.roleChartData,
          labels: roleStats.roles,
          datasets: [{
            ...this.roleChartData.datasets[0],
            data: roleStats.counts
          }]
        };

        // Update status chart
        this.statusChartData = {
          ...this.statusChartData,
          labels: statusStats.statuses,
          datasets: [{
            ...this.statusChartData.datasets[0],
            data: statusStats.counts
          }]
        };

        // Update monthly stats
        this.monthlyStats = monthlyStats;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load statistics:', err);
        this.isLoading = false;
        this.snackBar.open('Failed to load statistics. Please try again later.', 'Dismiss', {
          duration: 5000
        });
      }
    });
  }


}
