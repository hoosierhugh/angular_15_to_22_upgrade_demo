import { HTTP_INTERCEPTORS } from '@angular/common/http';
import type { Provider } from '@angular/core';
import type { User } from '@app/models/user.model';
import { MockBackendInterceptor } from '@app/mock/mock-backend.interceptor';
import { demoUser } from '@app/mock/mock-data';

export const MOCK_MODE = true;
export const MOCK_PROVIDERS: Provider[] = [
    { provide: HTTP_INTERCEPTORS, useClass: MockBackendInterceptor, multi: true }
];

export function createMockUser(): User {
    // An unsigned UI fixture, never a real credential.
    const payload = btoa(JSON.stringify({
        username: 'demo', useradmin: true, usergroup: 'admin',
        exp: Math.floor(Date.now() / 1000) + 86400
    })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return {
        ...demoUser,
        token: `eyJhbGciOiJub25lIn0.${payload}.mock-only`,
        user: { admin: true, force_password: false, username: 'demo' }
    };
}
