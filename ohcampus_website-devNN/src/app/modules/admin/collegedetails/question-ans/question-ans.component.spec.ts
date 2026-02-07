import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionAnsComponent } from './question-ans.component';

describe('QuestionAnsComponent', () => {
  let component: QuestionAnsComponent;
  let fixture: ComponentFixture<QuestionAnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionAnsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionAnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
