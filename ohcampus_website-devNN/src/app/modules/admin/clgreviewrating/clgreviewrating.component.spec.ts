import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClgreviewratingComponent } from './clgreviewrating.component';

describe('ClgreviewratingComponent', () => {
  let component: ClgreviewratingComponent;
  let fixture: ComponentFixture<ClgreviewratingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClgreviewratingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClgreviewratingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
