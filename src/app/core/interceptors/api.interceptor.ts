import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, tap, timeout } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { API_CONFIG } from '../config/api.config';

/**
 * Functional API interceptor that handles:
 * - Request/response logging
 * - Error handling and formatting
 * - Timeout and retry logic
 * - Proxy route exclusion to prevent interference
 */
export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const logger = inject(LoggerService);
  const apiConfig = inject(API_CONFIG);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Skip interceptor for server-side rendering
  if (!isBrowser) {
    return next(req);
  }

  // Skip interceptor for proxy routes to prevent 404 errors
  if (shouldSkipInterceptor(req.url)) {
    return next(req);
  }

  const startTime = Date.now();

  // Only modify headers for non-proxy requests
  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  logger.debug(
    `HTTP ${req.method} ${req.url}`,
    {
      body: req.body,
      headers: req.headers,
    },
    'ApiInterceptor'
  );

  return next(modifiedReq).pipe(
    timeout(apiConfig.timeout),
    retry({
      count: apiConfig.retryAttempts,
      delay: (error, retryCount) => {
        if (shouldRetry(error)) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          logger.warn(
            `Retrying request (${retryCount}/${apiConfig.retryAttempts}) after ${delay}ms`,
            error,
            'ApiInterceptor'
          );
          return timer(delay);
        }
        return throwError(() => error);
      },
    }),
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          logger.info(
            `HTTP ${req.method} ${req.url} completed in ${duration}ms`,
            {
              status: event.status,
              statusText: event.statusText,
              duration,
            },
            'ApiInterceptor'
          );
        }
      },
    }),
    catchError((error: HttpErrorResponse) => {
      const duration = Date.now() - startTime;

      logger.error(
        `HTTP ${req.method} ${req.url} failed after ${duration}ms`,
        {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          duration,
        },
        'ApiInterceptor'
      );

      return throwError(() => formatError(error));
    })
  );
};

/**
 * Check if the interceptor should be skipped for proxy routes
 * This prevents Angular from interfering with proxy configurations
 */
function shouldSkipInterceptor(url: string): boolean {
  const proxyPatterns = [
    '/api/',
    '/iframe-dashboard/',
    '/iframe-grafana/',
    '/iframe-cog/',
    '/dex/',
    '/authservice/',
    '.well-known/',
    '/assets/',
    '/i18n/',
    '.json',
    'oauth2',
    'oidc',
  ];

  return proxyPatterns.some((pattern) => url.includes(pattern));
}

/**
 * Determine if a failed request should be retried
 */
function shouldRetry(error: HttpErrorResponse): boolean {
  return !error.status || (error.status >= 500 && error.status < 600);
}

/**
 * Format error responses with user-friendly messages
 */
function formatError(error: HttpErrorResponse): {
  userMessage: string;
  timestamp: string;
} & HttpErrorResponse {
  let errorMessage = 'An unexpected error occurred';

  if (error.error?.message) {
    errorMessage = error.error.message;
  } else if (error.message) {
    errorMessage = error.message;
  }

  switch (error.status) {
    case 0:
      errorMessage = 'Network error. Please check your connection.';
      break;
    case 400:
      errorMessage = 'Bad request. Please check your input.';
      break;
    case 401:
      errorMessage = 'Unauthorized. Please log in again.';
      break;
    case 403:
      errorMessage = 'Access denied. You do not have permission.';
      break;
    case 404:
      errorMessage = 'Resource not found.';
      break;
    case 408:
      errorMessage = 'Request timeout. Please try again.';
      break;
    case 429:
      errorMessage = 'Too many requests. Please wait before trying again.';
      break;
    case 500:
      errorMessage = 'Server error. Please try again later.';
      break;
    case 502:
    case 503:
    case 504:
      errorMessage = 'Service temporarily unavailable. Please try again later.';
      break;
  }

  return {
    ...error,
    userMessage: errorMessage,
    timestamp: new Date().toISOString(),
  };
}
