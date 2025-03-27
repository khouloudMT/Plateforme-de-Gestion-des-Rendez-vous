import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error) => {
      let errorMessage = 'An unknown error occurred!';
      
      if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.msg) {
        errorMessage = error.error.msg;
      } else if (error.error.errors) {
        errorMessage = error.error.errors[0].msg;
      }
      
      snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      
      if (error.status === 401) {
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};