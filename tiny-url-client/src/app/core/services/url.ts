import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Matching your Backend Enum exactly
export enum UrlStatus {
  Active = "Active",
  Expired = "Expired",
  Deleted = "Deleted"
}

export interface ShortenResponse {
  id: string;          // Mapped from _id via transform()
  longUrl: string;
  shortUrl: string;    // Your unique shortCode
  userId: string | null;
  status: UrlStatus;
  isAliased: boolean;
  clicks: number;
  createdAt: string;   // Added via timestamps: true
  updatedAt: string;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  private readonly API_URL = '/api/url/shorten';

  constructor(private http: HttpClient) {}

  shortenUrl(longUrl: string): Observable<ShortenResponse> {
    // Payload matches your router.post body validation
    const payload = { 
      longUrl, 
      isAliased: false 
    };

    return this.http.post<ShortenResponse>(this.API_URL, payload);
  }
}