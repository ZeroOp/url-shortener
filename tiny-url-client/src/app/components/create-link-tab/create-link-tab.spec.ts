import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLinkTab } from './create-link-tab';

describe('CreateLinkTab', () => {
  let component: CreateLinkTab;
  let fixture: ComponentFixture<CreateLinkTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateLinkTab],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateLinkTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
