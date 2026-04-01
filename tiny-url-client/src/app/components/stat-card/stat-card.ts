import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule
  ],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss'
})
export class StatCard {
  /**
   * The text label displayed at the top of the card (e.g., 'Total Clicks')
   */
  @Input() label: string = '';

  /**
   * The numeric value to display. 
   * Initialized to 0 to prevent template errors before data loads.
   */
  @Input() value: number | undefined = 0;

  /**
   * The Material Icon name (e.g., 'mouse', 'bolt', 'link_off')
   */
  @Input() icon: string = 'show_chart';

  /**
   * The color theme class applied to the card for styling ('blue', 'green', 'orange')
   */
  @Input() color: 'blue' | 'green' | 'orange' | string = 'blue';
}