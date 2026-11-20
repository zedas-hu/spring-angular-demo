import { EnvironmentProviders } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpRequest, HttpResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { from, mergeMap, Observable, of, throwError } from 'rxjs';

export interface ApiStubResponse {
  status?: number;
  body?: unknown;
}

export type ApiStubHandler = (
  request: HttpRequest<unknown>,
) => ApiStubResponse | Promise<ApiStubResponse> | Observable<ApiStubResponse>;

export function provideApiStub(handler: ApiStubHandler): EnvironmentProviders {
  return provideHttpClient(withInterceptors([
    (request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
      const result = handler(request);
      const response$ = result instanceof Observable ? result : from(Promise.resolve(result));

      return response$.pipe(
        mergeMap(({ status = 200, body = null }) => status < 400
          ? of(new HttpResponse({ status, body }))
          : throwError(() => new HttpErrorResponse({ status, error: body, url: request.urlWithParams }))),
      );
    },
  ]));
}
