import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular'; 
import { AppointmentService } from '../../../services/appointment.service';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AuthService } from '../../../services/auth.service';
import { AppointmentDetailsModalComponent } from '../../appointment-details-modal/appointment-details-modal.component';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FullCalendarModule,AppointmentDetailsModalComponent],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss']
})
export class CalendarViewComponent {
  showDetailsModal = false;
  selectedAppointment: any = {};
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
    editable: false,
    // selectable: false,
    droppable: false,
    eventDragStart: () => false,
    eventDragStop: () => false,
    eventDrop: () => false,
    eventResizeStart: () => false,
    eventResizeStop: () => false,
    eventResize: () => false,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    },
    eventMinHeight: 50,
  };


  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    const userRole = this.authService.getUserRole();
    
    if (userRole === 'professional') {
      this.loadProfessionalAppointments();
    } else {
      this.loadClientAppointments();
    }
  }

  loadClientAppointments() {
    this.appointmentService.getClientAppointments().subscribe({
      next: (appointments) => {
        const events = appointments.map(appointment => ({
          id: appointment._id,
          title: this.getClientEventTitle(appointment),
          start: this.formatAppointmentDateTime(appointment.date, appointment.time),
          backgroundColor: this.getStatusColor(appointment.status),
          borderColor: this.getStatusColor(appointment.status),
          extendedProps: {
            status: appointment.status,
            notes: appointment.notes,
            professional: appointment.professional,
            date: appointment.date,
            time: appointment.time
          }
        }));
        this.calendarOptions.events = events;
      },
      error: (err) => {
        console.error('Error loading client appointments:', err);
      }
    });
  }

  loadProfessionalAppointments() {
    this.appointmentService.getProfessionalAppointments().subscribe({
      next: (appointments) => {
        const events = appointments.map(appointment => ({
          id: appointment._id,
          title: this.getProfessionalEventTitle(appointment),
          start: this.formatAppointmentDateTime(appointment.date, appointment.time),
          backgroundColor: this.getStatusColor(appointment.status),
          borderColor: this.getStatusColor(appointment.status),
          extendedProps: {
            status: appointment.status,
            notes: appointment.notes,
            client: appointment.client,
            date: appointment.date,
            time: appointment.time
          }
        }));
        this.calendarOptions.events = events;
      },
      error: (err) => {
        console.error('Error loading professional appointments:', err);
      }
    });
  }

  private getClientEventTitle(appointment: any): string {
    if (!appointment.professional) return 'Appointment';
    return `${appointment.professional.profession} with ${appointment.professional.name}`;
  }

  private getProfessionalEventTitle(appointment: any): string {
    if (!appointment.client) return 'Appointment';
    return `${appointment.client.name}`;
  }

  private formatAppointmentDateTime(dateString: string, timeString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return '';
      }
      const datePart = date.toISOString().split('T')[0];
      return `${datePart}T${timeString}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  }
  handleDateClick(arg: any) {
    console.log('date click', arg.dateStr);
  }

  handleEventClick(arg: EventClickArg) {
    // 1. First immediately close the modal if it's open
    this.showDetailsModal = false;
  
    // 2. Clear any previous appointment data
    this.selectedAppointment = null;
  
    // 3. Force Angular change detection cycle
    setTimeout(() => {
      // 4. Prepare the new appointment data
      const event = arg.event;
      this.selectedAppointment = {
        ...event.extendedProps,
        id: event.id,
        title: event.title,
        date: event.start ? new Date(event.start) : null,
        time: event.start ? this.formatTime(event.start) : 'N/A',
        status: event.extendedProps['status'] || 'unknown'
      };
  
      // 5. Debug log to verify data
      console.log('Opening modal with:', this.selectedAppointment);
  
      // 6. Open the modal after a tiny delay
      setTimeout(() => {
        this.showDetailsModal = true;
      }, 50);
    }, 50);
  }
  
  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#dc3545';
      case 'completed': return '#17a2b8';
      default: return '#007bff';
    }
  }
}


// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { FullCalendarModule } from '@fullcalendar/angular'; 
// import { AppointmentService } from '../../../services/appointment.service';
// import { CalendarOptions } from '@fullcalendar/core'; // Import CalendarOptions
// import dayGridPlugin from '@fullcalendar/daygrid'; // Import plugins
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// @Component({
//   selector: 'app-calendar-view',
//   imports: [CommonModule, FullCalendarModule],
//   templateUrl: './calendar-view.component.html',
//   styleUrl: './calendar-view.component.scss'
// })
// export class CalendarViewComponent {
//   calendarOptions: CalendarOptions = {
//     initialView: 'dayGridMonth',
//     plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
//     headerToolbar: {
//       left: 'prev,next today',
//       center: 'title',
//       right: 'dayGridMonth,timeGridWeek,timeGridDay'
//     },
//     events: [],
//     dateClick: this.handleDateClick.bind(this),
//     eventClick: this.handleEventClick.bind(this),
//     editable: true,
//     selectable: true
//   };

//   constructor(private appointmentService: AppointmentService) {}
//   ngOnInit() {
//     this.loadAppointmentsForUser(); // or pro
//   }
//   loadAppointmentsForUser() {
//     this.appointmentService.getClientAppointments().subscribe(appointments => {
//       const events = appointments.map(appointment => ({
//         title: appointment.client.name || 'Appointment',
//         start: appointment.date + 'T' + appointment.time,
//         backgroundColor: this.getStatusColor(appointment.status),
//         borderColor: this.getStatusColor(appointment.status)
        
//         // You can customize colors or additional info here
//       }));
  
//       this.calendarOptions = {
//         initialView: 'dayGridMonth',
//         events: events,
//         // Add other FullCalendar options as needed
//       };
//     });
//   }
  


  

//   // loadAppointments() {
//   //   this.appointmentService.getClientAppointments().subscribe(appointments => {
//   //     this.calendarOptions.events = appointments.map(appointment => ({
//   //       id: appointment._id,
//   //       title: `Appointment with ${appointment.professional.name}`,
//   //       start: `${appointment.date}T${appointment.startTime}`,
//   //       end: `${appointment.date}T${appointment.endTime}`,
//   //       backgroundColor: this.getStatusColor(appointment.status),
//   //       borderColor: this.getStatusColor(appointment.status)
//   //     }));
//   //   });
//   // }

//  handleDateClick(arg: any) {
//      console.log('date click', arg.dateStr);
//   }

//   handleEventClick(arg: any) {
//      console.log('event click', arg.event.id);
//    }

//   getStatusColor(status: string): string {
//     switch (status) {
//       case 'confirmed': return '#28a745';
//       case 'pending': return '#ffc107';
//       case 'cancelled': return '#dc3545';
//       default: return '#007bff';
//     }
//   }

// }
