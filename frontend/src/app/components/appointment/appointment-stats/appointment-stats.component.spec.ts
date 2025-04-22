import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentStatsComponent } from './appointment-stats.component';

describe('AppointmentStatsComponent', () => {
  let component: AppointmentStatsComponent;
  let fixture: ComponentFixture<AppointmentStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
