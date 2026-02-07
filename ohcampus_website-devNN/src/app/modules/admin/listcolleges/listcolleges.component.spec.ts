import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListcollegesComponent } from './listcolleges.component';

describe('ListcollegesComponent', () => {
  let component: ListcollegesComponent;
  let fixture: ComponentFixture<ListcollegesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListcollegesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListcollegesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
