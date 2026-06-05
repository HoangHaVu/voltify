import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BetaSignupPage from '@/pages/BetaSignupPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  };
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({})),
    },
  },
}));

vi.mock('@/components/seo/SEO', () => ({
  default: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BetaSignupPage', () => {
  it('rendert das Beta-Formular korrekt', () => {
    render(<BetaSignupPage />);

    expect(screen.getByText('Jetzt Beta-Partner werden')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mustermann GmbH')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max Mustermann')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('max@firma.de')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anfragen/i })).toBeInTheDocument();
  });

  it('zeigt den Login-Link im Footer', () => {
    render(<BetaSignupPage />);

    const loginLink = screen.getByText('Jetzt anmelden.');
    expect(loginLink).toBeInTheDocument();
  });

  it('zeigt den Voltify-Logo-Button', () => {
    render(<BetaSignupPage />);

    expect(screen.getByText('Voltify')).toBeInTheDocument();
  });

  it('zeigt Beta-Vorteile auf der rechten Seite', () => {
    render(<BetaSignupPage />);

    expect(screen.getByText('3 Monate kostenlos')).toBeInTheDocument();
    expect(screen.getAllByText(/-30% Gründerrabatt/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Persönliches Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Direkter Einfluss')).toBeInTheDocument();
  });

  it('zeigt Stats (3 Mo., -30%, 30 min)', () => {
    render(<BetaSignupPage />);

    expect(screen.getByText('3 Mo.')).toBeInTheDocument();
    expect(screen.getByText('-30%')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });
});
