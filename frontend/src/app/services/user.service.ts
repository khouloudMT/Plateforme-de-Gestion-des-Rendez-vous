import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
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
