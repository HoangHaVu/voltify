import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import type { UserRole } from '@/services/auth';

const mockUseAuth = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">Navigate to {to}</div>,
  };
});

describe('ProtectedRoute', () => {
  it('zeigt Lade-Spinner während isLoading', () => {
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: true });
    render(<ProtectedRoute><div>Content</div></ProtectedRoute>);

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('leitet zu /login um wenn nicht authentifiziert', () => {
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: false });
    render(<ProtectedRoute><div>Content</div></ProtectedRoute>);

    expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
  });

  it('leitet zu / um wenn Rolle nicht erlaubt', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'customer' as UserRole },
      isAuthenticated: true,
      isLoading: false,
    });
    render(
      <ProtectedRoute allowedRoles={['owner', 'installer']}>
        <div>Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('/');
  });

  it('rendert children wenn authentifiziert und Rolle erlaubt', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'owner' as UserRole },
      isAuthenticated: true,
      isLoading: false,
    });
    render(
      <ProtectedRoute allowedRoles={['owner']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('rendert children wenn authentifiziert und keine Rollen-Einschränkung', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'installer' as UserRole },
      isAuthenticated: true,
      isLoading: false,
    });
    render(<ProtectedRoute><div>Dashboard</div></ProtectedRoute>);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

});
