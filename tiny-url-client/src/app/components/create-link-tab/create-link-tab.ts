import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

// Service & Types
import { UrlService, ShortenResponse } from '../../core/services/url';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

export interface RecentLink {
  shortUrl: string;
  longUrl: string;
  createdAt: Date | string;
}

@Component({
  selector: 'app-create-link-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinner
],
  templateUrl: './create-link-tab.html',
  styleUrl: './create-link-tab.scss'
})
export class CreateLinkTab {
  private fb = inject(FormBuilder);
  
  linkForm: FormGroup;
  recentLinks = signal<RecentLink[]>([]);
  isLoading = signal(false);
  lastCreatedUrl = signal<string | null>(null);

  constructor(private urlService: UrlService) {
    this.linkForm = this.fb.group({
      longUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      hasAlias: [false],
      alias: [''],
      expiresAt: [null]
    });
  }

  // Add MatTimepickerModule if your version supports it, 
// otherwise we use the HTML5 datetime-local strategy below.

onSubmit() {
  if (this.linkForm.invalid) return;
  this.isLoading.set(true);

  const { longUrl, hasAlias, alias, expiresAt, expiresTime } = this.linkForm.value;

  const options: any = {};
  if (hasAlias && alias) options.alias = alias;

  // Logic to merge Date and Time
  if (expiresAt) {
    const expiration = new Date(expiresAt);
    if (expiresTime) {
      const [hours, minutes] = expiresTime.split(':');
      expiration.setHours(Number(hours), Number(minutes));
    }
    options.expiresAt = expiration.toISOString();
  }

  this.urlService.shortenUrl(longUrl, options).subscribe({
    next: (res) => {
      this.lastCreatedUrl.set(res.shortUrl);
      this.updateRecentLinksTable(res);
      this.linkForm.reset({ hasAlias: false });
      this.isLoading.set(false);
    },
    error: (err) => {
      console.error('Creation failed:', err);
      this.isLoading.set(false);
    }
  });
 }

  private updateRecentLinksTable(res: ShortenResponse) {
    const newLink: RecentLink = {
      shortUrl: res.shortUrl,
      longUrl: res.longUrl,
      createdAt: res.createdAt
    };

    
    this.recentLinks.update(current => [newLink, ...current].slice(0, 10));
  }

  copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
  }
}