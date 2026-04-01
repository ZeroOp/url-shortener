import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksTable } from './links-table';

describe('LinksTable', () => {
  let component: LinksTable;
  let fixture: ComponentFixture<LinksTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinksTable],
    }).compileComponents();

    fixture = TestBed.createComponent(LinksTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
