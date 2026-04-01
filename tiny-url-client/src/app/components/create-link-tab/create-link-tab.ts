import { Component, inject, signal, OnInit } from '@angular/core';
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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Added for copy feedback

// Service & Types
import { UrlService, ShortenResponse, UrlStatus } from '../../core/services/url';

export interface RecentLink {
  shortUrl: string;
  longUrl: string;
  createdAt: Date | string;
  status: UrlStatus;
  isAliased: boolean;
}

@Component({
  selector: 'app-create-link-tab',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatCheckboxModule, MatDatepickerModule,
    MatNativeDateModule, MatTableModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './create-link-tab.html',
  styleUrl: './create-link-tab.scss'
})
export class CreateLinkTab implements OnInit {
  private fb = inject(FormBuilder);
  private urlService = inject(UrlService);
  private snackBar = inject(MatSnackBar);
  
  linkForm!: FormGroup; 
  recentLinks = signal<RecentLink[]>([]);
  isLoading = signal(false);
  lastCreatedUrl = signal<string | null>(null);
  readonly DOMAIN = 'zeroop.dev';

  ngOnInit() {
    this.initForm();
    this.loadRecentLinks();
  }

  private initForm() {
    this.linkForm = this.fb.group({
      longUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      hasAlias: [false],
      alias: [''],
      expiresAt: [null],
      expiresTime: ['']
    });

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

  private loadRecentLinks() {
    this.urlService.getRecentLinks().subscribe({
      next: (data: ShortenResponse[]) => {
        this.recentLinks.set(data.map(item => ({
          shortUrl: item.shortUrl,
          longUrl: item.longUrl,
          createdAt: item.createdAt,
          status: item.status,
          isAliased: item.isAliased
        })));
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

    if (expiresAt) {
      const expiration = new Date(expiresAt);
      if (expiresTime) {
        const [hours, minutes] = expiresTime.split(':');
        expiration.setHours(Number(hours), Number(minutes), 0, 0);
      } else {
        expiration.setHours(23, 59, 59, 999);
      }
      options.expiresAt = expiration.toISOString();
    }

    this.urlService.shortenUrl(longUrl, options).subscribe({
      next: (res) => {
        this.lastCreatedUrl.set(this.formatShortUrl(res.shortUrl, res.isAliased));
        this.updateRecentLinksTable(res);
        this.linkForm.reset({ longUrl: '', hasAlias: false, alias: '', expiresAt: null, expiresTime: '' });
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
      createdAt: res.createdAt,
      status: res.status,
      isAliased: res.isAliased
    };
    this.recentLinks.update(current => [newLink, ...current].slice(0, 10));
  }

  formatShortUrl(code: string, isAliased: boolean): string {
    return isAliased ? `${this.DOMAIN}/${code}` : `${this.DOMAIN}/r/${code}`;
  }

  copyToClipboard(text: string, message: string = 'Copied to clipboard!') {
    navigator.clipboard.writeText(text);
    this.snackBar.open(message, 'Close', { duration: 2000, panelClass: ['custom-snack'] });
  }
}