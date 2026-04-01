import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, map, shareReplay } from 'rxjs';

export interface User {
  id: string;
  email: string;
  iat?: number;
}

interface AuthResponse {
  currentUser: User | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  // 1. Internal state (The Source of Truth)
  private userState = signal<User | null>(null);
  private isLoaded = false;

  // 2. Publicly accessible Read-Only user data
  // Components can use this: authService.user()
  user = this.userState.asReadonly();
  
  // Helper to check if logged in: authService.isAuthenticated()
  isAuthenticated = computed(() => !!this.userState());

  /**
   * The "Gatekeeper" method.
   * Checks the backend once per session/refresh, then uses memory.
   */
  checkAuth(): Observable<boolean> {
    // If we already verified the session, don't hit the network again
    if (this.isLoaded) {
      return of(this.isAuthenticated());
    }

    return this.http.get<AuthResponse>('/api/users/currentuser').pipe(
      tap((res) => {
        this.userState.set(res.currentUser);
        this.isLoaded = true; // Block future redundant API calls
      }),
      map((res) => !!res.currentUser),
      catchError(() => {
        this.userState.set(null);
        this.isLoaded = true;
        return of(false);
      }),
      // If 3 components call this at once on startup, only 1 network request is made
      shareReplay(1) 
    );
  }

  /**
   * Use this for your Logout button
   */
  clearAuth() {
    this.userState.set(null);
    this.isLoaded = false;
  }
}