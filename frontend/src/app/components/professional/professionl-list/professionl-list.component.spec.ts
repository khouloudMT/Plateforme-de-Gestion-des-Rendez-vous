import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionlListComponent } from './professionl-list.component';

describe('ProfessionlListComponent', () => {
  let component: ProfessionlListComponent;
  let fixture: ComponentFixture<ProfessionlListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionlListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionlListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
