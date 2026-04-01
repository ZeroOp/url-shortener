import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Base Components
import { StatCard } from '../stat-card/stat-card';
import { LinkRow, LinksTableComponent } from '../links-table/links-table';
import { AnalyticsService } from '../../core/services/analytics/analytics';

@Component({
  selector: 'app-analytics-tab',
  standalone: true,
  imports: [
    CommonModule,
    StatCard,
    LinksTableComponent,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './analytics-tab.html',
  styleUrl: './analytics-tab.scss'
})
export class AnalyticsTab implements OnInit {
  // Inject the Analytics Service
  public analytics = inject(AnalyticsService);
  
  // Local state for the leaderboard
  topLinks = signal<LinkRow[]>([]);
  
  // Expose the summary signal from the service for the template
  summary = this.analytics.summary;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // 1. Fetch the big numbers (Total Clicks, Active Links, etc.)
    this.analytics.fetchSummary();

    // 2. Fetch the top 5 links for the leaderboard
    this.analytics.getTopLinks(5).subscribe({
      next: (data) => {
        this.topLinks.set(data);
      },
      error: (err) => {
        console.error('Error loading top links:', err);
      }
    });
  }
}