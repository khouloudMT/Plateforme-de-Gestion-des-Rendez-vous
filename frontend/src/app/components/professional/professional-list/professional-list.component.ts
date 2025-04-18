import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-professional-list',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './professional-list.component.html',
  styleUrls: ['./professional-list.component.scss']
})
export class ProfessionalListComponent implements OnInit {
  allProfessionals: any[] = [];
  professionals: any[] = [];
  pagedProfessionals: any[] = [];

  professions: string[] = [];
  selectedProfession: string = '';

  // Table columns
  displayedColumns: string[] = ['name', 'email', 'phone'];

  // Pagination variables
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private userService: UserService) {}

  // Initialize the component and load professionals
  ngOnInit(): void {
    this.loadProfessionals();
  }

  // Load all professionals 
  loadProfessionals() {
    this.userService.getProfessionals().subscribe({
      next: (res: any[]) => {
        this.allProfessionals = res;
        this.professionals = res;

        this.professions = Array.from(new Set(res.map(p => p.profession))).filter(Boolean);

        this.totalPages = Math.ceil(this.professionals.length / this.pageSize);
        this.currentPage = 1;
        this.updatePagedProfessionals();
      },
      error: err => console.error('Erreur chargement professionnels', err)
    });
  }

  // Filter professionals based on selected profession
  applyFilter() {
    this.professionals = this.selectedProfession
      ? this.allProfessionals.filter(p => p.profession === this.selectedProfession)
      : [...this.allProfessionals];

    this.totalPages = Math.ceil(this.professionals.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagedProfessionals();
  }
  selectProfession(prof: string) {
    this.selectedProfession = prof;
    this.applyFilter();
  }
  

  // Pagination logic
  updatePagedProfessionals() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedProfessionals = this.professionals.slice(start, end);
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedProfessionals();
    }
  }
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedProfessionals();
    }
  }

  getProfileImage(gender: string): string {
    return gender?.toUpperCase() === 'F' 
      ? 'assets/images/femaleavatar.png' 
      : 'assets/images/maleavatar.png';
  }

  
}
