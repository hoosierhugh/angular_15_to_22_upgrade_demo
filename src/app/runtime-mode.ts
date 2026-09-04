import type { Provider } from '@angular/core';
import type { User } from './models/user.model';

// Only the explicit Angular "mock" configuration replaces this file.
export const MOCK_MODE = false;
export const MOCK_PROVIDERS: Provider[] = [];
export function createMockUser(): User | null { return null; }
