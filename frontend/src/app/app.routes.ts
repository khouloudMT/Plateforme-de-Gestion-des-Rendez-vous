import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { ProfessionalDashboardComponent } from './components/professional/professional-dashboard/professional-dashboard.component';
import { ClientDashboardComponent } from './components/client/client-dashboard/client-dashboard.component';
import { CalendarViewComponent } from './components/calendar/calendar-view/calendar-view.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { 
        path: '', 
        component: DashboardComponent,
        canActivate: [authGuard],
        children: [
          { 
            path: 'admin', 
            component: AdminDashboardComponent,
            canActivate: [roleGuard],
            data: { role: 'admin' },
            children: [
              { path: 'users', component: UserListComponent }
            ]
          },
          { 
            path: 'professional', 
            component: ProfessionalDashboardComponent,
            canActivate: [roleGuard],
            data: { role: 'professional' }
          },
          { 
            path: 'client', 
            component: ClientDashboardComponent,
            canActivate: [roleGuard],
            data: { role: 'client' },
            children: [
              { path: 'calendar', component: CalendarViewComponent }
            ]
          },
          { path: '', redirectTo: 'client', pathMatch: 'full' }
        ]
      },
      { path: '**', redirectTo: '' }
   
];
