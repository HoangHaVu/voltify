import { vi } from 'vitest';
import React from 'react';

export const mockNavigate = vi.fn();

export function mockReactRouter() {
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
      Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
        React.createElement('a', { href: to, ...props }, children)
      ),
    };
  });
}
