import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

interface ProblemDetail {
  detail?: string;
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    readonly detail: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(detail);
  }
}

export interface ApiRequestOptions {
  body?: unknown;
  params?: Record<string, string>;
  signal?: AbortSignal;
  fallbackError: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, options: ApiRequestOptions): Promise<T> {
    const response$ = this.http.request<T>(method, url, {
      body: options.body,
      params: options.params,
    }).pipe(
      catchError((error: unknown) => throwError(() =>
        error instanceof HttpErrorResponse ? toApiError(error, options.fallbackError) : error,
      )),
    );

    return toPromise(response$, options.signal);
  }
}

function toApiError(error: HttpErrorResponse, fallbackError: string): ApiError {
  const body = error.error as ProblemDetail | null;
  const problem = typeof body === 'object' && body !== null ? body : {};
  return new ApiError(problem.detail ?? fallbackError, problem.fieldErrors ?? {});
}

function toPromise<T>(source: Observable<T>, signal?: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const subscription = source.subscribe({ next: resolve, error: reject });
    signal?.addEventListener('abort', () => {
      subscription.unsubscribe();
      reject(new DOMException('The operation was aborted.', 'AbortError'));
    }, { once: true });
  });
}
