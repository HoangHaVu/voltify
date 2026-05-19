import { supabase } from '../lib/supabase';

export interface Note {
  id: string;
  installer_id: string;
  lead_id: string | null;
  project_id: string | null;
  content: string;
  created_at: string;
}

export interface NoteWithContext extends Note {
  lead: { first_name: string; last_name: string } | null;
  project: { zip: string | null; kwp: number | null } | null;
}

const NOTE_SELECT = 'id, installer_id, lead_id, project_id, content, created_at';

export async function fetchNotesByLead(leadId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select(NOTE_SELECT)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchNotesByProject(projectId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select(NOTE_SELECT)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchAllNotes(): Promise<NoteWithContext[]> {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      ${NOTE_SELECT},
      lead:leads(first_name, last_name),
      project:projects(zip, kwp)
    `)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as Array<Note & {
    lead: { first_name: string; last_name: string }[] | null;
    project: { zip: string | null; kwp: number | null }[] | null;
  }>).map(row => ({
    ...row,
    lead: Array.isArray(row.lead) ? (row.lead[0] ?? null) : row.lead,
    project: Array.isArray(row.project) ? (row.project[0] ?? null) : row.project,
  }));
}

export async function addNote(payload: {
  lead_id?: string;
  project_id?: string;
  content: string;
}): Promise<Note> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht angemeldet');

  const { data, error } = await supabase
    .from('notes')
    .insert({ ...payload, installer_id: user.id })
    .select(NOTE_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) throw new Error(error.message);
}
