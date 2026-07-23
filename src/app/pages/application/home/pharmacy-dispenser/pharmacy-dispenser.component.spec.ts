import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyDispenserComponent } from './pharmacy-dispenser.component';

describe('PharmacyDispenserComponent', () => {
  let component: PharmacyDispenserComponent;
  let fixture: ComponentFixture<PharmacyDispenserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PharmacyDispenserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyDispenserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
