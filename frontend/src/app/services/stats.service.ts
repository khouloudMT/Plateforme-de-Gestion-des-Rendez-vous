import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:5000/api/stats';


    constructor(private http: HttpClient) { }
    getAppointmentStats(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/appointments`);
    }

    getStatusStats(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/status`);
    }

    getMonthlyStats(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/monthly`);
    }
}
