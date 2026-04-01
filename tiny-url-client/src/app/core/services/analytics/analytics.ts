import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs';

// Matching your backend interface
export interface DashboardSummary {
  totalLinks: number;
  activeLinks: number;
  expiredLinks: number;
  totalClicks: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  
  // Signals for the Dashboard to "watch"
  summary = signal<DashboardSummary | null>(null);
  isLoading = signal(false);

  /**
   * Fetches the 1. Overview Stats from your router
   */
  fetchSummary() {
    this.isLoading.set(true);
    
    this.http.get<DashboardSummary>('/api/analytics/summary', { 
      withCredentials: true 
    })
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: (data) => this.summary.set(data),
      error: (err) => console.error('Failed to fetch summary', err)
    });
  }

  /**
   * Fetches the 2. Chart Data
   */
  getChartData(days: number = 7) {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<any[]>('/api/analytics/charts/clicks', { 
      params, 
      withCredentials: true 
    });
  }

  /**
   * Fetches the 3. Leaderboard
   */
  getTopLinks(limit: number = 5) {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>('/api/analytics/top-links', { 
      params, 
      withCredentials: true 
    });
  }
}