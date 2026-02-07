import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparecollegesComponent } from './comparecolleges.component';

describe('ComparecollegesComponent', () => {
  let component: ComparecollegesComponent;
  let fixture: ComponentFixture<ComparecollegesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComparecollegesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComparecollegesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
