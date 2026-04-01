import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortenerCard } from './shortener-card';

describe('ShortenerCard', () => {
  let component: ShortenerCard;
  let fixture: ComponentFixture<ShortenerCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortenerCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ShortenerCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
