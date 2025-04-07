import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'];
  const userRole = authService.getUserRole();

  console.log('Expected Role:', expectedRole); // Debug log
  console.log('User Role:', userRole); // Debug log
  
  if (userRole === expectedRole) {
    return true;
  }
  
  // Redirect to appropriate dashboard if user has a different role
  if (userRole === 'admin') {
    router.navigate(['/admin']);
  } else if (userRole === 'professional') {
    router.navigate(['/professional']);
  } else {
    router.navigate(['/client']);
  }
  
  return false;
};