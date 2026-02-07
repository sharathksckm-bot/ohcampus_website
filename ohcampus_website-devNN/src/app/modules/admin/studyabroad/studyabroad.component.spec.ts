import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyabroadComponent } from './studyabroad.component';

describe('StudyabroadComponent', () => {
  let component: StudyabroadComponent;
  let fixture: ComponentFixture<StudyabroadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyabroadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyabroadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
