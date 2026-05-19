import { supabase } from '../lib/supabase';

export async function fetchRegionalLeadCount(zip: string): Promise<number> {
  if (!zip || zip.length < 2) return 0;
  const prefix = zip.slice(0, 2);
  const { count, error } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .like('zip', `${prefix}%`);
  if (error) return 0;
  return count ?? 0;
}

export async function fetchTotalLeadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true });
  if (error) return 0;
  return count ?? 0;
}
