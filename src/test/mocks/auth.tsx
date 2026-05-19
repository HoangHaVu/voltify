import { vi } from 'vitest';
import React from 'react';

export const mockLogin = vi.fn();
export const mockAuthUser: { user: any; login: any } = { user: null, login: mockLogin };

export function mockAuthContext() {
  vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => mockAuthUser,
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  }));
}
