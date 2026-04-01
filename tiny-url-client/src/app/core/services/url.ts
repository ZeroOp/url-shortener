import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum UrlStatus {
  Active = "Active",
  Expired = "Expired",
  Deleted = "Deleted"
}

export interface ShortenResponse {
  id: string;
  longUrl: string;
  shortUrl: string;
  userId: string | null;
  status: UrlStatus;
  isAliased: boolean;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  // Ensure this matches your backend route exactly
  private readonly API_URL = '/api/url/shorten';

  constructor(private http: HttpClient) {}

  /**
   * Universal method to shorten URLs with optional Alias and Expiration
   */
  shortenUrl(
    longUrl: string, 
    options?: { alias?: string; expiresAt?: Date | string }
  ): Observable<ShortenResponse> {
    
    // Construct the payload dynamically
    const payload: any = { 
      longUrl,
      // If an alias exists, isAliased is true, otherwise false
      isAliased: !!options?.alias 
    };

    if (options?.alias) {
      payload.alias = options.alias;
    }

    if (options?.expiresAt) {
      payload.expiresAt = options.expiresAt;
    }

    return this.http.post<ShortenResponse>(this.API_URL, payload, {
      withCredentials: true // Important for attaching session cookies/JWT
    });
  }
}