import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // We call checkAuth() which handles the "memory vs network" logic
  return authService.checkAuth().pipe(
    take(1), // Auto-unsubscribe after getting the first value
    map((isLoggedIn) => {
      if (isLoggedIn) {
        return true; // Access granted to dashboard
      } else {
        // Access denied: Redirect to signin
        return router.parseUrl('/signin'); 
      }
    })
  );
};