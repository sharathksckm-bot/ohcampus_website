import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CutoffsComponent } from './cutoffs.component';

describe('CutoffsComponent', () => {
  let component: CutoffsComponent;
  let fixture: ComponentFixture<CutoffsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CutoffsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CutoffsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
