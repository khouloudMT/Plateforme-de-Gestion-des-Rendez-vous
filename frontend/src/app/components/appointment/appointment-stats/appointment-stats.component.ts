import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-appointment-stats',
  templateUrl: './appointment-stats.component.html',
  styleUrls: ['./appointment-stats.component.scss']
})
export class AppointmentStatsComponent implements OnChanges {
  @Input() appointments: any[] = [];

  todayCount = 0;
  weeklyCount = 0;
  upcomingCount = 0;
  recentCount = 0;
  pendingCount = 0;

  ngOnChanges() {
    this.calculateStats();
  }

  private calculateStats() {
    const now = new Date();
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    this.todayCount = 0;
    this.weeklyCount = 0;
    this.upcomingCount = 0;
    this.recentCount = 0;
    this.pendingCount = 0;

    this.appointments.forEach(appt => {
      
      const createdAt = new Date(appt.createdAt || appt.created_at);
      const isRecent = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 3;
      const apptDate = new Date(appt.date);

      if (isSameDay(apptDate, now)) {
        this.todayCount++;
      }

      if (apptDate >= startOfWeek && apptDate <= endOfWeek) {
        this.weeklyCount++;
      }

      if (apptDate > now) {
        this.upcomingCount++;
      }

      if (isRecent) {
        this.recentCount++;
      }

      if (appt.status?.toLowerCase() === 'pending') {
        this.pendingCount++;
      }
    });
  }
}
