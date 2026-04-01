import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-shortener-card',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './shortener-card.html',
  styleUrl: './shortener-card.scss'
})
export class ShortenerCardComponent {
  private clipboard = inject(Clipboard);
  shortenedUrl: string | null = null;

  shorten(url: string) {
    if (!url) return;
    // Dummy result for now
    this.shortenedUrl = `https://tiny.url/${Math.random().toString(36).substring(7)}`;
  }

  copyToClipboard() {
    if (this.shortenedUrl) {
      this.clipboard.copy(this.shortenedUrl);
    }
  }
}