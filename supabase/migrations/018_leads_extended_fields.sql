-- ============================================================
-- Voltify — Leads Tabelle erweitern um Konfigurator-Felder
-- ============================================================

alter table leads
  add column if not exists roof_tilt        integer,
  add column if not exists shading          text,
  add column if not exists building_type    text,
  add column if not exists ownership        text,
  add column if not exists wallbox          boolean default false,
  add column if not exists backup_power     boolean default false,
  add column if not exists energy_app       boolean default false,
  add column if not exists consumption_method text,
  add column if not exists household_size   text,
  add column if not exists planning_horizon text,
  add column if not exists needs_financing  boolean default false;
