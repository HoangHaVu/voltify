// PROJECT: Voltify | PURPOSE: Types for installer solar planner layout stored in leads.module_layout

export interface StoredModulePosition {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}

export interface ModuleLayoutJson {
  address: string;
  coords: { lat: number; lng: number };
  kwp: number;
  moduleCount: number;
  roofAreaM2: number;
  orientation: string;
  modules: StoredModulePosition[];
  previewPng: string; // base64 data URL, 120×120
  savedAt: string;    // ISO timestamp
}
