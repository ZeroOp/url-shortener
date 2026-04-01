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
  // Changed to base path to support multiple endpoints
  private readonly BASE_URL = '/api/url';

  constructor(private http: HttpClient) {}

  /**
   * Fetches the 10 most recently created links for the user from MongoDB
   */
  getRecentLinks(): Observable<ShortenResponse[]> {
    return this.http.get<ShortenResponse[]>(`${this.BASE_URL}/recent`, {
      withCredentials: true
    });
  }

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

    // Hits /api/url/shorten as before
    return this.http.post<ShortenResponse>(`${this.BASE_URL}/shorten`, payload, {
      withCredentials: true 
    });
  }
}