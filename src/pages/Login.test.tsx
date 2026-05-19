import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin, user: null }),
}));

vi.mock('../components/seo/SEO', () => ({
  default: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Login', () => {
  it('rendert das Login-Formular korrekt', () => {
    render(<Login />);

    expect(screen.getByText('Willkommen zurück')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('info@voltify.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anmelden/i })).toBeInTheDocument();
  });

  it('zeigt einen Fehler bei fehlgeschlagenem Login', async () => {
    mockLogin.mockRejectedValue(new Error('Ungültige Anmeldedaten'));
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('info@voltify.com'), { target: { value: 'test@test.de' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'falsch' } });
    fireEvent.click(screen.getByRole('button', { name: /Anmelden/i }));

    await waitFor(() => {
      expect(screen.getByText('Ungültige Anmeldedaten')).toBeInTheDocument();
    });
  });

  it('ruft login mit korrekten Daten auf', async () => {
    mockLogin.mockResolvedValue(undefined);
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('info@voltify.com'), { target: { value: 'installateur@test.de' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Test123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Anmelden/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('installateur@test.de', 'Test123456');
    });
  });

  it('zeigt Ladezustand während des Logins', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('info@voltify.com'), { target: { value: 'test@test.de' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'passwort' } });
    fireEvent.click(screen.getByRole('button', { name: /Anmelden/i }));

    await waitFor(() => {
      expect(screen.getByText('Anmeldung...')).toBeInTheDocument();
    });
  });

  it('hat den Beta-Tester Link im Footer', () => {
    render(<Login />);

    const betaLink = screen.getByText('Jetzt Beta Tester werden.');
    expect(betaLink).toBeInTheDocument();
    expect(betaLink.closest('a')).toHaveAttribute('href', '/beta');
  });

  it('hat Passwort-vergessen Link', () => {
    render(<Login />);

    const forgotLink = screen.getByText('Passwort vergessen?');
    expect(forgotLink).toBeInTheDocument();
  });

  it('hat Schnell-Login Buttons für Test-Accounts', () => {
    render(<Login />);

    expect(screen.getByText('Installateur')).toBeInTheDocument();
    expect(screen.getByText('Inhaber')).toBeInTheDocument();
  });

  it('füllt Test-Account-Daten beim Klick auf Schnell-Login', () => {
    render(<Login />);

    fireEvent.click(screen.getByText('Installateur'));

    const emailInput = screen.getByPlaceholderText('info@voltify.com') as HTMLInputElement;
    expect(emailInput.value).toBe('installateur@test.de');
  });
});
