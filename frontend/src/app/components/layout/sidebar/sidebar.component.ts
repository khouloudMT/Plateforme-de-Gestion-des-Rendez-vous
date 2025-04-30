import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InitialsPipe } from "../../../pipes/initials.pipe";
import { AuthService } from '../../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';

interface NavItem {
  label: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,

  imports: [
    CommonModule, 
    RouterModule, 
    MatIconModule, 
    MatTooltipModule,
    MatButtonModule, 
    InitialsPipe],

  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() navItems: NavItem[] = [];
  @Input() isCollapsed = false;
  @Output() toggle = new EventEmitter<boolean>();

  currentRoute: string = '';

  get userName(): string {
    const user = this.authService.currentUserValue;
    return user?.name || user?.email?.split('@')[0] || 'User';
  }
  get userEmail(): string | null {
    return this.authService.currentUserValue?.email || null;
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentRoute = this.router.url;
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }


  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.toggle.emit(this.isCollapsed);
  }
}