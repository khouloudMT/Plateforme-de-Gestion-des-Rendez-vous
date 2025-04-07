import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http: HttpClient) { }
  getClientAppointments() {
    return this.http.get<any[]>('http://localhost:5000/api/appointments/me');
  }

  getProfessionalAppointments() {
    return this.http.get<any[]>('http://localhost:5000/api/appointments/me');
  }

  createAppointment(appointmentData: any) {
    return this.http.post('http://localhost:5000/api/appointments', appointmentData);
  }

  updateAppointment(appointmentId: string, updateData: any) {
    return this.http.put(`http://localhost:5000/api/appointments/${appointmentId}`, updateData);
  }

  deleteAppointment(appointmentId: string) {
    return this.http.delete(`http://localhost:5000/api/appointments/${appointmentId}`);
  }
}
