import { Component, inject, signal, OnInit } from '@angular/core'; // Added OnInit
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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"; // Ensure Module is imported

// Service & Types
import { UrlService, ShortenResponse } from '../../core/services/url';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './create-link-tab.html',
  styleUrl: './create-link-tab.scss'
})
export class CreateLinkTab implements OnInit { // Implement OnInit
  private fb = inject(FormBuilder);
  private urlService = inject(UrlService); // Injected via field for cleaner access
  
  linkForm!: FormGroup; // Use definite assignment
  recentLinks = signal<RecentLink[]>([]);
  isLoading = signal(false);
  lastCreatedUrl = signal<string | null>(null);

  ngOnInit() {
    this.initForm();
    this.loadRecentLinks(); // Fetch data from MongoDB on startup
  }

  private initForm() {
    this.linkForm = this.fb.group({
      longUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      hasAlias: [false],
      alias: [''],
      expiresAt: [null],
      expiresTime: [''] // Start empty so it's clear no time is set
    });
  
    // Toggle alias validation based on checkbox
    this.linkForm.get('hasAlias')?.valueChanges.subscribe(checked => {
      const aliasControl = this.linkForm.get('alias');
      if (checked) {
        aliasControl?.setValidators([Validators.required, Validators.minLength(3)]);
      } else {
        aliasControl?.clearValidators();
        aliasControl?.setValue('');
      }
      aliasControl?.updateValueAndValidity();
    });
  }

  // --- THE NEW METHOD ---
  private loadRecentLinks() {
    this.urlService.getRecentLinks().subscribe({
      next: (data: ShortenResponse[]) => {
        // Map the backend data to our local signal
        const mappedData: RecentLink[] = data.map(item => ({
          shortUrl: item.shortUrl,
          longUrl: item.longUrl,
          createdAt: item.createdAt
        }));
        this.recentLinks.set(mappedData);
      },
      error: (err) => console.error('History fetch failed:', err)
    });
  }

  onSubmit() {
    if (this.linkForm.invalid) return;
    this.isLoading.set(true);
  
    const { longUrl, hasAlias, alias, expiresAt, expiresTime } = this.linkForm.value;
  
    const options: any = {};
    if (hasAlias && alias) options.alias = alias;
  
    // ✅ STRICTOR LOGIC: Only process expiration if a DATE is selected
    if (expiresAt) {
      const expiration = new Date(expiresAt);
      if (expiresTime) {
        const [hours, minutes] = expiresTime.split(':');
        expiration.setHours(Number(hours), Number(minutes), 0, 0);
      } else {
        // If date is picked but no time, default to end of day
        expiration.setHours(23, 59, 59, 999);
      }
      options.expiresAt = expiration.toISOString();
    }
  
    this.urlService.shortenUrl(longUrl, options).subscribe({
      next: (res) => {
        this.lastCreatedUrl.set(res.shortUrl);
        this.updateRecentLinksTable(res);
        
        // ✅ BETTER RESET: Clears the form and validation state properly
        this.linkForm.reset({
          longUrl: '',
          hasAlias: false,
          alias: '',
          expiresAt: null,
          expiresTime: ''
        });
        
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
    // Add to the beginning of the signal array
    this.recentLinks.update(current => [newLink, ...current].slice(0, 10));
  }

  copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
  }
}