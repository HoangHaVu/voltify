-- Migration 052: company_settings_db (WL2)
-- Company-Settings (Logo, Farben, IBAN, Angebotspreise, Hersteller etc.) als JSONB in der DB.
-- Ziel: Source of Truth statt localStorage → geräte- und teamübergreifend konsistent.
-- localStorage bleibt nur noch synchronisierter Cache (Hydration bei Login).
-- Zugriff über Standard-profiles-RLS (authed) — kein anon-RPC nötig.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_settings jsonb;
