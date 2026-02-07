import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostelCampusComponent } from './hostel-campus.component';

describe('HostelCampusComponent', () => {
  let component: HostelCampusComponent;
  let fixture: ComponentFixture<HostelCampusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HostelCampusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostelCampusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
