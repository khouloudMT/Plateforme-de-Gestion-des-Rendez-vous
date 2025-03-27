import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';  
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')!));
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  login(email: string, password: string) {
    return this.http.post<any>('http://localhost:5000/api/auth/login', { email, password })
      .subscribe({
        next: (response) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            const decoded: any = jwtDecode(response.token);
            localStorage.setItem('currentUser', JSON.stringify(decoded.user));
            this.currentUserSubject.next(decoded.user);
            
            const role = decoded.user.role;
            if (role === 'admin') {
              this.router.navigate(['/admin']);
            } else if (role === 'professional') {
              this.router.navigate(['/professional']);
            } else {
              this.router.navigate(['/client']);
            }
          }
        },
        error: (error) => {
          console.error('Login error:', error);
        }
      });
  }

  register(userData: any) {
    return this.http.post('http://localhost:5000/api/auth/register', userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }
}