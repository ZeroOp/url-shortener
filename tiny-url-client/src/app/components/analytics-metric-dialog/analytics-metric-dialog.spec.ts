import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsMetricDialog } from './analytics-metric-dialog';

describe('AnalyticsMetricDialog', () => {
  let component: AnalyticsMetricDialog;
  let fixture: ComponentFixture<AnalyticsMetricDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsMetricDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsMetricDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
