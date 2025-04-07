import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular'; 
import { AppointmentService } from '../../../services/appointment.service';
import { CalendarOptions } from '@fullcalendar/core'; // Import CalendarOptions
import dayGridPlugin from '@fullcalendar/daygrid'; // Import plugins
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
@Component({
  selector: 'app-calendar-view',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss'
})
export class CalendarViewComponent {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    editable: true,
    selectable: true
  };

  constructor(private appointmentService: AppointmentService) {
    this.loadAppointments();
  }

  loadAppointments() {
    this.appointmentService.getClientAppointments().subscribe(appointments => {
      this.calendarOptions.events = appointments.map(appointment => ({
        id: appointment._id,
        title: `Appointment with ${appointment.professional.name}`,
        start: `${appointment.date}T${appointment.startTime}`,
        end: `${appointment.date}T${appointment.endTime}`,
        backgroundColor: this.getStatusColor(appointment.status),
        borderColor: this.getStatusColor(appointment.status)
      }));
    });
  }

  handleDateClick(arg: any) {
    console.log('date click', arg.dateStr);
  }

  handleEventClick(arg: any) {
    console.log('event click', arg.event.id);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#007bff';
    }
  }

}
