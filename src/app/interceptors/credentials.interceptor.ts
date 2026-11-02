import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  let request = req;
  if (req.url.startsWith('https://localhost:7178')) {
    request = req.clone({
      withCredentials: true
    });
  }

  return next(request).pipe(
    catchError((error: unknown) => {
      // If a protected API endpoint returns 401 Unauthorized, redirect to /login
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('/api/Auth/login') &&
        !req.url.includes('/api/Auth/logout')
      ) {
        authService.authenticatedUser.set(null);
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
