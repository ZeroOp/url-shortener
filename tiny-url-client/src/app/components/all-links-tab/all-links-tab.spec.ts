import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllLinksTab } from './all-links-tab';

describe('AllLinksTab', () => {
  let component: AllLinksTab;
  let fixture: ComponentFixture<AllLinksTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllLinksTab],
    }).compileComponents();

    fixture = TestBed.createComponent(AllLinksTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
