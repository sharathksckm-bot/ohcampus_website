import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnspageComponent } from './anspage.component';

describe('AnspageComponent', () => {
  let component: AnspageComponent;
  let fixture: ComponentFixture<AnspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnspageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
