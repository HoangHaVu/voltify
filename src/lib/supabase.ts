import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

declare global {
  interface Window { __supabase?: SupabaseClient }
}

if (!window.__supabase) {
  window.__supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      lock: <R>(_name: string, _timeout: number, fn: () => Promise<R>) => fn(),
    },
  });
}

export const supabase = window.__supabase;
