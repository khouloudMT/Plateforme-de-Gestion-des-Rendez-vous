import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) { }

  getRegistrationStats(): Observable<any> {
    return this.http.get<any>('http://localhost:5000/api/users/stats/registrations');
  }
  
  getUserRoleStats(): Observable<any> {
    return this.http.get<any>('http://localhost:5000/api/users/stats/roles');
  }
  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`/api/users/${userId}`, userData);
  }
  getAllUsers() {
    return this.http.get<any[]>('http://localhost:5000/api/users');
  }

  getProfessionals() {
    return this.http.get<any[]>('http://localhost:5000/api/users/professionals');
  }

  deleteUser(userId: string) {
    return this.http.delete(`http://localhost:5000/api/users/${userId}`);
  }

}
