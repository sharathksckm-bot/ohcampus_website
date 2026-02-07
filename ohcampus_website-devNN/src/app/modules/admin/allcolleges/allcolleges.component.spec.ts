import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllcollegesComponent } from './allcolleges.component';

describe('AllcollegesComponent', () => {
  let component: AllcollegesComponent;
  let fixture: ComponentFixture<AllcollegesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllcollegesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllcollegesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
