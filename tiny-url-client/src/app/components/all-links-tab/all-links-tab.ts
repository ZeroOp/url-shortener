import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog';
import { AnalyticsMetricDialog } from '../analytics-metric-dialog/analytics-metric-dialog';

export interface LinkWithStats {
  id: string;
  shortUrl: string;
  longUrl: string;
  status: string;
  createdAt: string;
  isAliased: boolean;
  totalClicks: number | string;
}

@Component({
  selector: 'app-all-links-tab',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatCardModule, 
    MatButtonModule, MatIconModule, MatSnackBarModule, 
    MatTooltipModule, MatDialogModule
  ],
  templateUrl: './all-links-tab.html',
  styleUrl: './all-links-tab.scss'
})
export class AllLinksTab implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  dataSource = signal<LinkWithStats[]>([]);
  isLoading = signal(true);
  readonly DOMAIN = 'zeroop.dev';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    forkJoin({
      links: this.http.get<any[]>('/api/url/all'),
      stats: this.http.get<any[]>('/api/analytics/counts').pipe(
        catchError(() => of([]))
      )
    }).pipe(
      map(({ links, stats }) => {
        // Debugging: Open your browser console to see these!
        console.log('Links from API:', links);
        console.log('Stats from API:', stats);

        return links.map(link => {
          /**
           * 1. Use '==' instead of '===' to handle string vs number mismatches.
           * 2. Check link.id (URL service) against s.shortUrlId or s.id (Analytics service).
           * 3. Use 'count' or 'total' depending on what your Analytics service returns.
           */
          const foundStat = stats.find(s => 
            (s.shortUrlId == link.id) || (s.id == link.id) || (s.shortUrl == link.shortUrl)
          );

          return {
            ...link,
            totalClicks: foundStat ? (foundStat.count ?? foundStat.total ?? 0) : 0
          };
        });
      })
    ).subscribe({
      next: (combinedData) => {
        this.dataSource.set(combinedData);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load links', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  formatUrl(link: any): string {
    const prefix = link.isAliased ? '' : 'r/';
    return `${this.DOMAIN}/${prefix}${link.shortUrl}`;
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    this.snackBar.open('Link copied!', 'OK', { duration: 2000 });
  }

  openAnalytics(link: LinkWithStats) {
    this.dialog.open(AnalyticsMetricDialog, {
      width: '700px',
      maxWidth: '90vw',
      data: link, // Passing the whole link object (including totalClicks)
      panelClass: 'custom-dialog-container'
    });
  }

  onDelete(linkId: string) {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      height: '200px',
      backdropClass: 'blur-backdrop',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.http.delete(`/api/url/${linkId}`).subscribe({
          next: () => {
            this.dataSource.update(links => links.filter(l => l.id !== linkId));
            this.snackBar.open('Link deleted', 'OK', { duration: 2000 });
          }
        });
      }
    });
  }
}