import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockFetchProfile = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn((_cb?: any) => ({ data: { subscription: { unsubscribe: vi.fn() } } }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (event: string, cb: any) => mockOnAuthStateChange(cb),
    },
  },
}));

vi.mock('@/services/auth', () => ({
  fetchProfile: (id: string) => mockFetchProfile(id),
  signIn: (email: string, password: string) => mockSignIn(email, password),
  signOut: () => mockSignOut(),
}));

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="authenticated">{auth.isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="loading">{auth.isLoading ? 'yes' : 'no'}</div>
      <div data-testid="owner">{auth.isOwner ? 'yes' : 'no'}</div>
      <div data-testid="employee">{auth.isEmployee ? 'yes' : 'no'}</div>
      <div data-testid="super">{auth.isSuperEmployee ? 'yes' : 'no'}</div>
      <div data-testid="user">{auth.user?.role ?? 'none'}</div>
      <button onClick={() => auth.login('test@test.de', 'pass')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AuthProvider', () => {
  it('startet im Ladezustand ohne Session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('yes');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('no');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('no');
  });

  it('setzt User bei bestehender Session', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: '123', email: 'test@test.de', user_metadata: {} },
        },
      },
    });
    mockFetchProfile.mockResolvedValue({
      id: '123',
      role: 'owner',
      full_name: 'Test User',
      is_verified: true,
      owner_id: null,
      phone: null,
      zip: null,
    });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('owner');
    expect(screen.getByTestId('owner')).toHaveTextContent('yes');
    expect(screen.getByTestId('employee')).toHaveTextContent('no');
    expect(screen.getByTestId('super')).toHaveTextContent('no');
  });

  it('setzt Employee korrekt für installer', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: '456', email: 'inst@test.de', user_metadata: {} },
        },
      },
    });
    mockFetchProfile.mockResolvedValue({
      id: '456',
      role: 'installer',
      full_name: 'Inst User',
      is_verified: true,
      owner_id: '789',
      phone: null,
      zip: null,
    });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('installer');
    expect(screen.getByTestId('owner')).toHaveTextContent('no');
    expect(screen.getByTestId('employee')).toHaveTextContent('yes');
    expect(screen.getByTestId('super')).toHaveTextContent('no');
  });

  it('setzt super_employee korrekt', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: '789', email: 'super@test.de', user_metadata: {} },
        },
      },
    });
    mockFetchProfile.mockResolvedValue({
      id: '789',
      role: 'super_employee',
      full_name: 'Super User',
      is_verified: true,
      owner_id: null,
      phone: null,
      zip: null,
    });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('super_employee');
    expect(screen.getByTestId('owner')).toHaveTextContent('no');
    expect(screen.getByTestId('employee')).toHaveTextContent('yes');
    expect(screen.getByTestId('super')).toHaveTextContent('yes');
  });

  it('login setzt den User', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    mockSignIn.mockResolvedValue({
      user: { id: '999', email: 'new@test.de' },
    });
    mockFetchProfile.mockResolvedValue({
      id: '999',
      role: 'owner',
      full_name: 'New User',
      is_verified: true,
      owner_id: null,
      phone: null,
      zip: null,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('no');
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('owner');
  });

  it('logout entfernt den User', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: '123', email: 'test@test.de', user_metadata: {} },
        },
      },
    });
    mockFetchProfile.mockResolvedValue({
      id: '123',
      role: 'owner',
      full_name: 'Test',
      is_verified: true,
      owner_id: null,
      phone: null,
      zip: null,
    });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    mockSignOut.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
    });

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('no');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });
});

describe('useAuth', () => {
  it('wirft Error wenn außerhalb AuthProvider verwendet', () => {
    function BadComponent() {
      useAuth();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow('useAuth must be used within AuthProvider');
  });
});
