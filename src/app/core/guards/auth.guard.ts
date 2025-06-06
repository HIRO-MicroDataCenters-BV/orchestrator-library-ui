import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      
      // Если пользователь не авторизован, перенаправляем на страницу логина
      return router.createUrlTree(['/auth/login']);
    })
  );
};

export const adminGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user?.role === 'admin') {
        return true;
      }
      
      // Если пользователь не админ, перенаправляем на страницу 403 (доступ запрещен)
      return router.createUrlTree(['/error/403']);
    })
  );
};