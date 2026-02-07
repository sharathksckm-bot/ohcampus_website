import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScolarshipComponent } from './scolarship.component';

describe('ScolarshipComponent', () => {
  let component: ScolarshipComponent;
  let fixture: ComponentFixture<ScolarshipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScolarshipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScolarshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
