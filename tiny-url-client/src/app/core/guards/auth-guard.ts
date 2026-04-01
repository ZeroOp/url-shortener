import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';
import { NotificationService } from '../services/notification';

export const authGuard: CanActivateFn = (route, state) => {
  // 1. Inject the tools we need
  const authService = inject(AuthService);
  const router = inject(Router);
  const notifyService = inject(NotificationService);

  // 2. Call the checkAuth method we built in the service
  return authService.checkAuth().pipe(
    take(1), // We only need the first value, then close the stream
    map((isLoggedIn) => {
      if (isLoggedIn) {
        // 3. If the backend/cache says they are logged in, return true
        return true; 
      } else {
        // 4. If not, redirect them to the signin page
        notifyService.setMessage('Please sign in to access the dashboard');
        return router.parseUrl('/signin'); 
      }
    })
  );
};