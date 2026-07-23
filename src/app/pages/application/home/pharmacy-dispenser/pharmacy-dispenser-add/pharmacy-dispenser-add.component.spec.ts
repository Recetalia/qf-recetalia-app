import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyDispenserAddComponent } from './pharmacy-dispenser-add.component';

describe('PharmacyDispenserAddComponent', () => {
  let component: PharmacyDispenserAddComponent;
  let fixture: ComponentFixture<PharmacyDispenserAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PharmacyDispenserAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyDispenserAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
