import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '@/pages/LandingPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  };
});

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    from: vi.fn(),
    to: vi.fn(),
    fromTo: vi.fn(),
    context: vi.fn(() => ({
      revert: vi.fn(),
    })),
    utils: {
      toArray: vi.fn(() => []),
    },
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn(),
    refresh: vi.fn(),
  },
}));

vi.mock('@/components/seo/SEO', () => ({
  default: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LandingPage', () => {
  it('rendert den Hero-Bereich mit Haupt-CTA', () => {
    render(<LandingPage />);

    expect(screen.getByText(/Mehr Leads/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Kostenlos testen/i }).length).toBeGreaterThan(0);
  });

  it('navigiert zu /beta beim Klick auf Kostenlos testen (Hero)', () => {
    render(<LandingPage />);

    const ctaButton = screen.getAllByRole('button', { name: /Kostenlos testen/i })[0];
    fireEvent.click(ctaButton);

    expect(mockNavigate).toHaveBeenCalledWith('/beta');
  });

  it('rendert die 3 Produkt-Kacheln', () => {
    render(<LandingPage />);

    expect(screen.getByText('CRM & Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Solar-Konfigurator')).toBeInTheDocument();
    expect(screen.getByText('Digitaler Auftritt')).toBeInTheDocument();
  });

  it('navigiert zu /login beim Klick auf Dashboard öffnen', () => {
    render(<LandingPage />);

    const dashboardButton = screen.getByRole('button', { name: /Dashboard oeffnen/i });
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigiert zu /konfigurator beim Klick auf Konfigurator testen', () => {
    render(<LandingPage />);

    const configButton = screen.getByRole('button', { name: /Konfigurator testen/i });
    fireEvent.click(configButton);

    expect(mockNavigate).toHaveBeenCalledWith('/konfigurator');
  });

  it('navigiert zu /demo beim Klick auf Demo-Webseite ansehen', () => {
    render(<LandingPage />);

    const demoButton = screen.getByRole('button', { name: /Demo-Webseite ansehen/i });
    fireEvent.click(demoButton);

    expect(mockNavigate).toHaveBeenCalledWith('/demo');
  });

  it('navigiert zu /demo beim Klick auf Demo ansehen (Hero)', () => {
    render(<LandingPage />);

    const demoButton = screen.getAllByRole('button', { name: /Demo ansehen/i })[0];
    fireEvent.click(demoButton);

    expect(mockNavigate).toHaveBeenCalledWith('/demo');
  });

  it('rendert die Stats-Bar', () => {
    render(<LandingPage />);

    expect(screen.getByText('30 Tage')).toBeInTheDocument();
    expect(screen.getByText('3-in-1')).toBeInTheDocument();
    expect(screen.getByText('50%+')).toBeInTheDocument();
    expect(screen.getByText('Sofort')).toBeInTheDocument();
  });

  it('rendert den Footer mit rechtlichen Links', () => {
    render(<LandingPage />);

    expect(screen.getByText('Datenschutz')).toBeInTheDocument();
    expect(screen.getByText('AGB')).toBeInTheDocument();
  });
});
