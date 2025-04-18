// professional.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getAllProfessionals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/professionals`).pipe(
      catchError(this.handleError)
    );
  }

  getProfessionalById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/professionals/${id}`).pipe(
      catchError(this.handleError)
    );
  }

 

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something went wrong. Please try again later.';
    if (error.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}