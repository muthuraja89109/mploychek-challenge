import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api';
import { AuthService } from './auth.service';

/** Adds "Authorization: Bearer <token>" to every API call, and signs out on 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!req.url.startsWith(API_URL) || !auth.token) return next(req);

  const authed = req.clone({ setHeaders: { Authorization: `Bearer ${auth.token}` } });
  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && auth.isLoggedIn()) auth.logout(); // session expired
      return throwError(() => err);
    })
  );
};
