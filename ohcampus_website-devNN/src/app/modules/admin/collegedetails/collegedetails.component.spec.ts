import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollegedetailsComponent } from './collegedetails.component';

describe('CollegedetailsComponent', () => {
  let component: CollegedetailsComponent;
  let fixture: ComponentFixture<CollegedetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollegedetailsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollegedetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
