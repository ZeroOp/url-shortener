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
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog';
import { MatDialog } from '@angular/material/dialog';

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
    MatButtonModule, MatIconModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './all-links-tab.html',
  styleUrl: './all-links-tab.scss'
})
export class AllLinksTab implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  dataSource = signal<LinkWithStats[]>([]);
  isLoading = signal(true);
  readonly DOMAIN = 'zeroop.dev';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    // Stitching logic: Parallel calls to URL and Analytics services
    forkJoin({
      links: this.http.get<any[]>('/api/url/all'),
      stats: this.http.get<any[]>('/api/analytics/counts').pipe(
        catchError(() => of([])) // Graceful degradation if Analytics is down
      )
    }).pipe(
      map(({ links, stats }) => {
        return links.map(link => ({
          ...link,
          // Match count by shortUrlId, default to 0 if not found, or '-' on error
          totalClicks: stats.find(s => s.shortUrlId === link.id)?.count ?? 0
        }));
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

  // 1. Add MatDialog to your imports list in the @Component decorator
// 2. Inject it: 
private dialog = inject(MatDialog);

onDelete(linkId: string) {
  const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
    width: '400px',
    height: '200px', // Adjusted to fit your 100-200px requirement
    backdropClass: 'blur-backdrop',
    disableClose: true // User must click a button to close
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