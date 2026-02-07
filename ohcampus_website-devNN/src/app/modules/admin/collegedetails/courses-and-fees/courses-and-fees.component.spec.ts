import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesAndFeesComponent } from './courses-and-fees.component';

describe('CoursesAndFeesComponent', () => {
  let component: CoursesAndFeesComponent;
  let fixture: ComponentFixture<CoursesAndFeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoursesAndFeesComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesAndFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
