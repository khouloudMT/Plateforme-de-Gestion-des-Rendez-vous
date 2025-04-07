import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';  
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: any;

  constructor(private http: HttpClient, private router: Router) {
    const isBrowser = typeof window !== 'undefined'; // Check if running in the browser
    const storedUser = isBrowser ? localStorage.getItem('currentUser') : null;
    this.currentUserSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }
  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('Retrieved token:', token); // Add this line
    return token;
  }

  login(email: string, password: string) {
    return this.http.post<any>('http://localhost:5000/api/auth/login', { email, password })
    .pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          const decoded: any= jwtDecode(response.token);
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
      })
    );
  }

  register(userData: any) {
    return this.http.post('http://localhost:5000/api/auth/register', userData);
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }
}