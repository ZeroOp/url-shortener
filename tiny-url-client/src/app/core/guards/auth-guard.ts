import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  // 1. Inject the tools we need
  const authService = inject(AuthService);
  const router = inject(Router);

  // 2. Call the checkAuth method we built in the service
  return authService.checkAuth().pipe(
    take(1), // We only need the first value, then close the stream
    map((isLoggedIn) => {
      if (isLoggedIn) {
        // 3. If the backend/cache says they are logged in, return true
        return true; 
      } else {
        // 4. If not, redirect them to the signin page
        return router.parseUrl('/signin'); 
      }
    })
  );
};