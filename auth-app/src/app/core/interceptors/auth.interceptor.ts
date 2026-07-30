import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { apiConfig } from '../config/api.config';
import { AuthService } from '../services/auth.service';

const authBaseUrl = `${apiConfig.baseUrl}/auth`;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const accessToken = authService.getAccessToken();
  const isApiRequest = request.url.startsWith(apiConfig.baseUrl);
  const isRefreshRequest = request.url === `${authBaseUrl}/refresh`;
  const isLoginRequest = request.url === `${authBaseUrl}/login`;
  const isLogoutRequest = request.url === `${authBaseUrl}/logout`;

  let nextRequest = request;

  if (isApiRequest) {
    nextRequest = nextRequest.clone({ withCredentials: true });
  }

  if (accessToken && isApiRequest && !isRefreshRequest) {
    nextRequest = nextRequest.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return next(nextRequest).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isRefreshRequest ||
        isLoginRequest ||
        isLogoutRequest
      ) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap((response) => {
          const refreshedToken = response?.access_token;
          if (!refreshedToken) {
            void router.navigateByUrl('/login');
            return throwError(() => error);
          }

          return next(
            request.clone({
              withCredentials: true,
              setHeaders: {
                Authorization: `Bearer ${refreshedToken}`,
              },
            }),
          );
        }),
        catchError((refreshError) => {
          void router.navigateByUrl('/login');
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};