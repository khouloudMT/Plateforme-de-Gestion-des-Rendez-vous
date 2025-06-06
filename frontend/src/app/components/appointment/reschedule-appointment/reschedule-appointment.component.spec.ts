import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RescheduleAppointmentComponent } from './reschedule-appointment.component';

describe('RescheduleAppointmentComponent', () => {
  let component: RescheduleAppointmentComponent;
  let fixture: ComponentFixture<RescheduleAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RescheduleAppointmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RescheduleAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
