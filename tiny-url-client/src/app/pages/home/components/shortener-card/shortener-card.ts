import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Clipboard } from '@angular/cdk/clipboard'; 
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // 1. Import
import { UrlService } from '../../../../core/services/url';

@Component({
  selector: 'app-shortener-card',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatSnackBarModule // 2. Add to imports
  ],
  templateUrl: './shortener-card.html',
  styleUrl: './shortener-card.scss'
})
export class ShortenerCardComponent {
  private clipboard = inject(Clipboard);
  private urlService = inject(UrlService);
  private snackBar = inject(MatSnackBar); 
  private cdr = inject(ChangeDetectorRef);

  shortenedUrl: string | null = null;
  isLoading = false; 

  shorten(inputElement: HTMLInputElement) {
    const url = inputElement.value;
    if (!url) return;
    
    this.isLoading = true;
    this.shortenedUrl = null; 
  
    this.urlService.shortenUrl(url).subscribe({
      next: (response) => {
        const domain = window.location.origin; 
        this.shortenedUrl = `${domain}/r/${response.shortUrl}`;
        
        // ADD THIS LINE - The UI needs to know we are done!
        this.isLoading = false; 
        inputElement.value = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false; 
        this.cdr.detectChanges();
        this.snackBar.open('Error: Failed to shorten URL', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  copyToClipboard() {
    if (this.shortenedUrl) {
      this.clipboard.copy(this.shortenedUrl);
      this.snackBar.open('Link copied!', '', { duration: 1500 });
    }
  }
}