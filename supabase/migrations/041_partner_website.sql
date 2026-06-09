-- Migration 041: Webseite-Spalte für Partner-Tabelle
ALTER TABLE partners ADD COLUMN IF NOT EXISTS website text;
