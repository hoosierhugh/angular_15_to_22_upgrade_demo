import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MockApi, MOCK_API_BASE } from './mock-api';

@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {
    private readonly api = new MockApi();

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const url = new URL(request.url, window.location.href);
        if (url.origin === window.location.origin && url.pathname.startsWith(MOCK_API_BASE + '/')) {
            const reply = this.api.handle(request.method, url.pathname.slice(MOCK_API_BASE.length), request.body);
            return reply.status < 400
                ? of(new HttpResponse({ status: reply.status, body: reply.body, url: request.url })).pipe(delay(50))
                : throwError(() => new HttpErrorResponse({ status: reply.status, error: reply.body, url: request.url }));
        }
        // Only local static assets may escape this interceptor. Never fall through to a real API.
        if (request.method === 'GET' && url.origin === window.location.origin && url.pathname.startsWith('/assets/')) {
            return next.handle(request);
        }
        return throwError(() => new HttpErrorResponse({ status: 501, url: request.url,
            error: { message: 'Local demo blocked a non-mock HTTP request.' } }));
    }
}
