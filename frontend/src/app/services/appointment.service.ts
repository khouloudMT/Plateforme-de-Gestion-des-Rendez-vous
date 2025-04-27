import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { WebsocketService} from './websocket.service'; // Adjust the path as needed

@Injectable({
  providedIn: 'root'
})


export class AppointmentService {
    private pendingDeletion: { [id: string]: any } = {};

    constructor(private http: HttpClient,
    private webSocketService:  WebsocketService
  ) { }

  
  getClientAppointments() {
    return this.http.get<any[]>(`http://localhost:5000/api/appointments/my-appointments`);
  }

  getProfessionalAppointments() {
    return this.http.get<any[]>(`http://localhost:5000/api/appointments/my-appointments`);
  }

  createAppointment(appointmentData: any) {
    return this.http.post(`http://localhost:5000/api/appointments`, appointmentData);
  }

  updateAppointment(appointmentId: string, updateData: any) {
    return this.http.put(`http://localhost:5000/api/appointments/${appointmentId}`, updateData);
  }

  deleteAppointment(appointmentId: string) {
    return this.http.delete(`http://localhost:5000/api/appointments/${appointmentId}`);
  }

  getAppointmentById(appointmentId: string) {
    return this.http.get(`http://localhost:5000/api/appointments/${appointmentId}`);
  }

  // Notification stream
  getNotifications() {
    return this.webSocketService.getNotifications();
  }

  // Called when client cancels
  clientCancels(appointment: any, client: any, professional: any) {
    appointment.status = 'cancelled';
    
    this.webSocketService.sendNotification({
      type: 'cancellation',
      recipient: professional._id,
      message: `The client "${client.name}" coming at "${appointment.time}" has cancelled their appointment.`
    });

    this.scheduleDeletion(appointment);
    return this.updateAppointment(appointment._id, { status: 'cancelled' });
  }

  // Called when professional cancels or confirms
  professionalUpdatesStatus(appointment: any, professional: any, client: any, status: 'cancelled' | 'confirmed') {
    appointment.status = status;

    const actionMsg = status === 'cancelled' ? 'is cancelled' : 'is confirmed';
    
    this.webSocketService.sendNotification({
      type: status,
      recipient: client._id,
      message: `Your "${professional.profession}" appointment taken at "${appointment.time}" ${actionMsg}.`
    });

    if (status === 'cancelled') {
      this.scheduleDeletion(appointment);
    } else if (status === 'confirmed') {
      this.scheduleAutoCompleteAndDeletion(appointment);
    }

    return this.updateAppointment(appointment._id, { status });
  }

  // Schedule deletion in 48 hours
  private scheduleDeletion(appointment: any) {
    const delay = 48 * 60 * 60 * 1000; // 48h in ms
    const timer$ = timer(delay);
    
    this.pendingDeletion[appointment._id] = timer$.subscribe(() => {
      this.deleteAppointment(appointment._id).subscribe();
    });
  }

  // Auto-mark as completed after 1h, then delete after 48h
  private scheduleAutoCompleteAndDeletion(appointment: any) {
    const appointmentTime = new Date(appointment.time).getTime();
    const now = Date.now();
    const delayUntilComplete = appointmentTime + 60 * 60 * 1000 - now;

    if (delayUntilComplete > 0) {
      timer(delayUntilComplete).subscribe(() => {
        appointment.status = 'completed';
        this.updateAppointment(appointment._id, { status: 'completed' }).subscribe(() => {
          this.scheduleDeletion(appointment);
        });
      });
    }
  }

  
}
