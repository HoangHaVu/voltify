// PROJECT: Voltify | PURPOSE: Geocode addresses via Google API with Supabase cache
import { supabase } from '../lib/supabase';

export interface GeoCoords {
  lat: number;
  lng: number;
}

async function hashAddress(address: string): Promise<string> {
  const normalized = address.trim().toLowerCase().replace(/\s+/g, ' ');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

async function fetchFromCache(hash: string): Promise<GeoCoords | null> {
  const { data } = await supabase
    .from('address_cache')
    .select('lat, lng')
    .eq('address_hash', hash)
    .maybeSingle();
  return data ? { lat: data.lat, lng: data.lng } : null;
}

async function saveToCache(hash: string, raw: string, coords: GeoCoords): Promise<void> {
  await supabase
    .from('address_cache')
    .upsert({ address_hash: hash, address_raw: raw, lat: coords.lat, lng: coords.lng });
}

async function geocodeViaGoogle(address: string): Promise<GeoCoords> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('VITE_GOOGLE_MAPS_API_KEY fehlt');

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&region=de`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);

  const json = await res.json();
  if (json.status !== 'OK' || !json.results?.[0]) {
    throw new Error(`Geocoding fehlgeschlagen: ${json.status}`);
  }

  const loc = json.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

export async function geocodeAddress(
  street: string,
  zipCode: string,
  city?: string
): Promise<GeoCoords> {
  const raw = city
    ? `${street}, ${zipCode} ${city}, Deutschland`
    : `${street}, ${zipCode}, Deutschland`;
  const hash = await hashAddress(raw);

  const cached = await fetchFromCache(hash);
  if (cached) return cached;

  const coords = await geocodeViaGoogle(raw);
  await saveToCache(hash, raw, coords);
  return coords;
}
