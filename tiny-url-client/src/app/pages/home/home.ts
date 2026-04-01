import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Clipboard } from '@angular/cdk/clipboard';
import { StatsComponent } from "./components/stats/stats";
import { ShortenerCardComponent } from "./components/shortener-card/shortener-card"; // Install @angular/cdk

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, StatsComponent, ShortenerCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  shortenedUrl: string | null = null;

  constructor(private clipboard: Clipboard) {}

  shorten(longUrl: string) {
    if (!longUrl) return;
    // DUMMY DATA for now
    this.shortenedUrl = `https://tiny.url/${Math.random().toString(36).substring(7)}`;
  }

  copyToClipboard() {
    if (this.shortenedUrl) {
      this.clipboard.copy(this.shortenedUrl);
      alert('Copied to clipboard!'); // You can replace this with a MatSnackBar later
    }
  }
}