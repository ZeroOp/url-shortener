import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsTab } from './analytics-tab';

describe('AnalyticsTab', () => {
  let component: AnalyticsTab;
  let fixture: ComponentFixture<AnalyticsTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsTab],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
