-- Migration 046: Agency-Subscription-Tiers
-- Fügt profiles.agency_tier + profiles.agency_partner_limit hinzu für das Partner-Limit-Gating.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS agency_tier text NOT NULL DEFAULT 'start'
  CHECK (agency_tier IN ('start', 'pro', 'scale'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS agency_partner_limit int NOT NULL DEFAULT 5;

-- Sicherstellen, dass bestehende sales_agency-Accounts ein konsistentes Default-Tier bekommen
UPDATE public.profiles
SET agency_tier = 'start', agency_partner_limit = 5
WHERE role = 'sales_agency' AND agency_tier IS NULL;

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_profiles_agency_tier ON public.profiles(agency_tier)
  WHERE role = 'sales_agency';
