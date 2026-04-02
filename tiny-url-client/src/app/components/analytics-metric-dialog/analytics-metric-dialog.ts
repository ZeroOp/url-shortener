import { Component, Inject, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-analytics-metric-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, 
    MatIconModule, MatButtonToggleModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="analytics-wrapper">
      <div class="header">
        <div class="title-group">
          <mat-icon color="primary">insights</mat-icon>
          <h2>Analytics Dashboard</h2>
        </div>
        <button mat-icon-button (click)="onClose()"><mat-icon>close</mat-icon></button>
      </div>

      <div class="selector-row">
        <mat-button-toggle-group [value]="selectedRange()" (change)="onRangeChange($event.value)">
          <mat-button-toggle value="1h">1H</mat-button-toggle>
          <mat-button-toggle value="6h">6H</mat-button-toggle>
          <mat-button-toggle value="24h">24H</mat-button-toggle>
          <mat-button-toggle value="7d">1W</mat-button-toggle>
          <mat-button-toggle value="30d">1M</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <div class="stats-hero">
        <span class="label">Engagement in Period</span>
        <h1 class="count">{{ totalClicksInRange() }}</h1>
        <span class="sub-label">Insights for <strong>zeroop.dev/{{ data.shortUrl }}</strong></span>
      </div>

      <div class="chart-container">
        @if (isLoading()) {
          <div class="loading-overlay">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Aggregating ClickHouse data...</p>
          </div>
        } @else {
          <div class="svg-wrapper">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" (mouseleave)="hoveredPoint.set(null)">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#2563eb" stop-opacity="0.3" />
                  <stop offset="100%" stop-color="#2563eb" stop-opacity="0" />
                </linearGradient>
              </defs>
              
              <path [attr.d]="areaPath()" fill="url(#chartGradient)" />
              <path [attr.d]="linePath()" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" />
              
              @for (p of points(); track $index) {
                <g class="point-group" (mouseenter)="hoveredPoint.set(p)">
                  <rect [attr.x]="p.x - 10" y="0" width="20" height="150" fill="transparent" style="cursor: pointer;" />
                  
                  <circle [attr.cx]="p.x" [attr.cy]="p.y" r="4" 
                          [attr.fill]="hoveredPoint() === p ? '#1e293b' : '#2563eb'" 
                          [class.active-dot]="hoveredPoint() === p" />
                  
                  @if (hoveredPoint() === p) {
                    <line [attr.x1]="p.x" y1="0" [attr.x2]="p.x" y2="150" stroke="#cbd5e1" stroke-dasharray="4" />
                  }
                </g>
              }
            </svg>

            @if (hoveredPoint(); as active) {
              <div class="chart-tooltip" [style.left.px]="active.x * (containerWidth / 500)" [style.top.px]="active.y - 40">
                <div class="val">{{ active.value }} clicks</div>
                <div class="time">{{ active.rawTime | date:'shortTime' }}</div>
              </div>
            }

            <div class="x-axis">
              <span>{{ startTime() | date: dateFormat() }}</span>
              <span class="view-label">{{ selectedRange() }} Trend</span>
              <span>{{ endTime() | date: dateFormat() }}</span>
            </div>
          </div>
        }
      </div>

      <div class="actions">
        <button class="btn-done" (click)="onClose()">Done</button>
      </div>
    </div>
  `,
  styles: [`
    .analytics-wrapper { padding: 24px; display: flex; flex-direction: column; gap: 20px; min-width: 600px; }
    .header { 
      display: flex; justify-content: space-between; align-items: center;
      .title-group { display: flex; align-items: center; gap: 10px; h2 { margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; } }
    }
    .selector-row { display: flex; justify-content: center; }
    
    .stats-hero {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center;
      .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; }
      .count { font-size: 42px; margin: 2px 0; color: #2563eb; font-weight: 800; }
      .sub-label { font-size: 12px; color: #94a3b8; }
    }
    
    .chart-container {
      height: 240px; position: relative; border: 1px solid #f1f5f9; border-radius: 12px; padding: 30px 20px 10px 20px;
      background: white;
    }

    .chart-tooltip {
      position: absolute; transform: translateX(-50%); background: #1e293b; color: white;
      padding: 6px 10px; border-radius: 6px; font-size: 11px; pointer-events: none; z-index: 10;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      .val { font-weight: 700; display: block; }
      .time { font-size: 9px; color: #94a3b8; }
      &::after {
        content: ''; position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%);
        border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #1e293b;
      }
    }

    .svg-wrapper {
      display: flex; flex-direction: column; height: 100%; position: relative;
      svg { width: 100%; height: 150px; overflow: visible; }
      .x-axis { 
        display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; 
        border-top: 1px solid #f8fafc; padding-top: 12px; margin-top: 8px;
        .view-label { font-weight: 600; color: #cbd5e1; text-transform: uppercase; }
      }
    }

    .active-dot { r: 6; stroke: white; stroke-width: 2; transition: all 0.1s ease; }
    
    .loading-overlay {
      display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;
      p { font-size: 12px; color: #94a3b8; margin-top: 8px; }
    }
    .actions { display: flex; justify-content: flex-end; }
    .btn-done { padding: 10px 32px; background: #0f172a; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; &:hover { opacity: 0.9; } }
  `]
})
export class AnalyticsMetricDialog implements OnInit {
  private http = inject(HttpClient);
  
  selectedRange = signal('24h');
  chartData = signal<any[]>([]);
  isLoading = signal(false);
  hoveredPoint = signal<any>(null);
  containerWidth = 560; 

  startTime = signal<Date>(new Date());
  endTime = signal<Date>(new Date());
  dateFormat = computed(() => this.selectedRange().includes('d') ? 'MMM d, HH:mm' : 'HH:mm');

  // Logic: Sum all clicks in the returned time-series array
  totalClicksInRange = computed(() => {
    return this.chartData().reduce((acc, curr) => acc + (curr.count || 0), 0);
  });

  points = computed(() => {
    const data = this.chartData();
    if (!data.length) return [];
    
    const max = Math.max(...data.map(d => d.count), 1);
    const width = 500;
    const height = 150;
    
    return data.map((d, i) => ({
      x: (i / (data.length - 1)) * width,
      y: height - (d.count / max) * height,
      value: d.count,
      rawTime: d.time
    }));
  });

  linePath = computed(() => {
    const p = this.points();
    if (!p.length) return '';
    return p.reduce((acc, curr, i) => 
      i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`, '');
  });

  areaPath = computed(() => {
    const p = this.points();
    if (!p.length) return '';
    return `${this.linePath()} L ${p[p.length-1].x} 150 L 0 150 Z`;
  });

  constructor(
    public dialogRef: MatDialogRef<AnalyticsMetricDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() { this.fetchData(); }

  onRangeChange(range: string) {
    this.selectedRange.set(range);
    this.fetchData();
  }

  fetchData() {
    this.isLoading.set(true);
    const range = this.selectedRange();
    let res = '1h', lim = 24;
    const now = new Date();
    this.endTime.set(now);

    if (range === '1h') { res = '1m'; lim = 60; this.startTime.set(new Date(now.getTime() - 60*60*1000)); }
    else if (range === '6h') { res = '10m'; lim = 36; this.startTime.set(new Date(now.getTime() - 6*60*60*1000)); }
    else if (range === '24h') { res = '1h'; lim = 24; this.startTime.set(new Date(now.getTime() - 24*60*60*1000)); }
    else if (range === '7d') { res = '1h'; lim = 168; this.startTime.set(new Date(now.getTime() - 7*24*60*60*1000)); }
    else { res = '1d'; lim = 90; this.startTime.set(new Date(now.getTime() - 90*24*60*60*1000)); }

    const url = `/api/analytics/timeseries/${this.data.shortUrl}?resolution=${res}&limit=${lim}`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        // Map to real Dates for the Angular Pipe to work consistently
        const formatted = res.map(d => ({ ...d, time: new Date(d.time) }));
        this.chartData.set(formatted);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onClose(): void { this.dialogRef.close(); }
}