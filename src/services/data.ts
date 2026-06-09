import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  customer_id: string | null;
  installer_id: string | null;
  lead_id: string | null;
  status: 'angebot' | 'planung' | 'genehmigung' | 'installation' | 'inbetrieb';
  zip: string | null;
  kwp: number | null;
  investment: number | null;
  annual_savings: number | null;
  amortization: number | null;
  autarky: number | null;
  profit_20_years: number | null;
  notes: string | null;
  created_at: string;
  installer?: { full_name: string; phone: string | null } | null;
  customer?: { id: string; full_name: string; phone: string | null; zip: string | null } | null;
  lead?: { first_name: string; last_name: string; email: string; phone: string | null; zip: string | null } | null;
}

export interface DocumentItem {
  id: string;
  title: string;
  meta: string | null;
  type: 'pdf' | 'bolt' | 'verified' | 'premium';
  status: 'signed' | 'pending' | 'received';
  status_text: string;
  is_downloadable: boolean;
}

export interface DiscountCode {
  id: string;
  created_by: string;
  code: string;
  label: string | null;
  percentage: number;
  active: boolean;
  min_investment: number | null;
  max_uses: number | null;
  uses_count: number;
  valid_until: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  zip: string | null;
  installer_id: string | null;
  building_type: string | null;
  ownership: string | null;
  roof_orientation: string | null;
  roof_tilt: number | null;
  roof_area: number | null;
  shading: string | null;
  construction_year: string | null;
  consumption: number | null;
  has_e_car: boolean | null;
  has_heat_pump: boolean | null;
  has_battery: boolean | null;
  electricity_price: number | null;
  kwp: number | null;
  investment: number | null;
  annual_savings: number | null;
  amortization: number | null;
  autarky: number | null;
  profit_20_years: number | null;
  score: number | null;
  planning_horizon: 'sofort' | '3monate' | '12monate' | null;
  needs_financing: boolean | null;
  wants_zoom_call: boolean | null;
  status: 'neu' | 'kontaktiert' | 'vorort' | 'angebot' | 'abschluss' | 'gewonnen' | 'verloren' | 'planung' | 'installation' | 'abgeschlossen';
  offer_status: 'created' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  offer_sent_at: string | null;
  offer_viewed_at: string | null;
  payment_1_paid: boolean;
  payment_2_paid: boolean;
  payment_3_paid: boolean;
  discount_code: string | null;
  discount_percentage: number | null;
  discount_status: 'none' | 'code_applied' | 'requested' | 'approved' | 'rejected';
  final_price: number | null;
  discount_note: string | null;
  discount_requested_at: string | null;
  discount_resolved_at: string | null;
  site_visit_date: string | null;
  site_visit_notes: string | null;
  site_visit_done: boolean;
  roof_area_measured: number | null;
  roof_angle: number | null;
  shading_issues: boolean | null;
  created_at: string;
  offer_signatures?: { signature_png: string; signed_at: string }[];
  signing_token?: string;
  signing_token_expires_at?: string;
  offer_variants?: OfferVariant[];
  module_layout?: import('../types/solarPlanner').ModuleLayoutJson | null;
  source?: 'landingpage' | 'direct' | 'referral' | 'social' | 'google' | 'other';
  activities?: LeadActivity[];
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: string;
  description: string;
  user_id: string | null;
  user_name: string | null;
  created_at: string;
}

export interface OfferVariant {
  id: string;
  lead_id: string;
  variant_key: 'einstieg' | 'optimal' | 'zukunftssicher';
  label: string;
  description: string | null;
  storage_kwh: number;
  has_wallbox: boolean;
  has_backup: boolean;
  kwp: number | null;
  investment: number | null;
  annual_savings: number | null;
  amortization: number | null;
  autarky: number | null;
  profit_20_years: number | null;
  price_eur: number | null;
  is_primary: boolean;
  is_recommended: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  installer_id: string;
  title: string;
  type: 'beratung' | 'installation' | 'abnahme' | 'partnermeeting';
  starts_at: string;
  ends_at: string;
  location: string | null;
  notes: string | null;
  lead_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
}

const PROJECT_SELECT = '*, customer:profiles!customer_id(id, full_name, phone, zip), lead:leads!lead_id(first_name, last_name, email, phone, zip)';
const LEAD_SELECT = 'id, first_name, last_name, email, phone, zip, installer_id, agency_id, building_type, ownership, roof_orientation, roof_tilt, roof_area, shading, construction_year, consumption, has_e_car, has_heat_pump, has_battery, electricity_price, kwp, investment, annual_savings, amortization, autarky, profit_20_years, score, planning_horizon, needs_financing, wants_zoom_call, status, offer_status, offer_sent_at, offer_viewed_at, payment_1_paid, payment_2_paid, payment_3_paid, discount_code, discount_percentage, discount_status, final_price, discount_note, discount_requested_at, discount_resolved_at, site_visit_date, site_visit_notes, site_visit_done, roof_area_measured, roof_angle, shading_issues, source, module_layout, signing_token, created_at, offer_signatures(signature_png, signed_at), offer_variants(*), lead_activities(id, type, description, user_name, created_at)';

// ── Projekte ─────────────────────────────────────────────────────────

export async function fetchCustomerProject(customerId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, installer:profiles!installer_id(full_name, phone)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

export async function fetchInstallerProjects(installerId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('installer_id', installerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

/** Alle Projekte des Inhabers + seiner Mitarbeiter */
export async function fetchOwnerProjects(ownerId: string): Promise<Project[]> {
  const { data: employees, error: empErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('owner_id', ownerId);
  if (empErr) throw empErr;

  const ids = [ownerId, ...(employees ?? []).map(e => e.id)];

  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .in('installer_id', ids)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function fetchInstallerProjectById(installerId: string, projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('id', projectId)
    .eq('installer_id', installerId)
    .maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

/** Projekt mit Rollen-Scoping laden */
export async function fetchProjectByIdScoped(userId: string, role: 'owner' | 'installer', projectId: string): Promise<Project | null> {
  if (role === 'owner') {
    const { data: employees, error: empErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('owner_id', userId);
    if (empErr) throw empErr;
    const ids = [userId, ...(employees ?? []).map(e => e.id)];

    const { data, error } = await supabase
      .from('projects')
      .select(PROJECT_SELECT)
      .eq('id', projectId)
      .in('installer_id', ids)
      .maybeSingle();
    if (error) throw error;
    return data as Project | null;
  }

  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('id', projectId)
    .eq('installer_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

export async function updateProjectStatus(projectId: string, status: Project['status']): Promise<void> {
  const { error } = await supabase.from('projects').update({ status }).eq('id', projectId);
  if (error) throw error;
}

export async function updateProjectNotes(projectId: string, notes: string): Promise<void> {
  const { error } = await supabase.from('projects').update({ notes }).eq('id', projectId);
  if (error) throw error;
}

// ── Dokumente ────────────────────────────────────────────────────────

export async function fetchCustomerDocuments(customerId: string): Promise<DocumentItem[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, meta, type, status, status_text, is_downloadable')
    .eq('customer_id', customerId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as DocumentItem[];
}

// ── Leads ────────────────────────────────────────────────────────────

export async function fetchInstallerLeads(installerId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select(LEAD_SELECT)
    .eq('installer_id', installerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Lead[];
}

/** Alle Leads des Inhabers + seiner Mitarbeiter */
export async function fetchOwnerLeads(ownerId: string): Promise<Lead[]> {
  // Mitarbeiter-IDs des Inhabers ermitteln
  const { data: employees, error: empErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('owner_id', ownerId);
  if (empErr) throw empErr;

  const ids = [ownerId, ...(employees ?? []).map(e => e.id)];

  const { data, error } = await supabase
    .from('leads')
    .select(LEAD_SELECT)
    .in('installer_id', ids)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function fetchLeadById(leadId: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from('leads')
    .select(LEAD_SELECT)
    .eq('id', leadId)
    .maybeSingle();
  if (error) throw error;
  return data as Lead | null;
}

/** Lead mit Rollen-Scoping laden */
export async function fetchLeadByIdScoped(userId: string, role: 'owner' | 'installer', leadId: string): Promise<Lead | null> {
  if (role === 'owner') {
    // Owner: alle Leads von sich + Mitarbeitern
    const { data: employees, error: empErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('owner_id', userId);
    if (empErr) throw empErr;
    const ids = [userId, ...(employees ?? []).map(e => e.id)];

    const { data, error } = await supabase
      .from('leads')
      .select(LEAD_SELECT)
      .eq('id', leadId)
      .in('installer_id', ids)
      .maybeSingle();
    if (error) throw error;
    return data as Lead | null;
  }

  // Installer: nur eigene Leads
  const { data, error } = await supabase
    .from('leads')
    .select(LEAD_SELECT)
    .eq('id', leadId)
    .eq('installer_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Lead | null;
}

export async function updateLeadStatus(leadId: string, status: Lead['status']): Promise<void> {
  const { error } = await supabase.from('leads').update({ status }).eq('id', leadId);
  if (error) throw error;
}

export async function updateLeadFields(
  leadId: string,
  fields: Partial<Lead>
): Promise<void> {
  const { error } = await supabase.from('leads').update(fields).eq('id', leadId);
  if (error) throw error;
}

export async function updateLeadOfferStatus(
  leadId: string,
  offerStatus: Lead['offer_status'],
  extra?: { offer_sent_at?: string; offer_viewed_at?: string }
): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ offer_status: offerStatus, ...extra })
    .eq('id', leadId);
  if (error) throw error;
}

export async function addLeadActivity(
  leadId: string,
  type: string,
  description: string,
  userId?: string,
  userName?: string
): Promise<void> {
  const { error } = await supabase.from('lead_activities').insert({
    lead_id: leadId,
    type,
    description,
    user_id: userId || null,
    user_name: userName || null,
  });
  if (error) throw error;
}

export async function createProjectFromLead(lead: Lead, installerId: string): Promise<string> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      installer_id: installerId,
      lead_id: lead.id,
      zip: lead.zip,
      kwp: lead.kwp,
      investment: lead.investment,
      annual_savings: lead.annual_savings,
      status: 'planung',
    })
    .select('id')
    .single();
  if (error) throw error;
  await updateLeadStatus(lead.id, 'gewonnen');
  return (data as { id: string }).id;
}

// ── Discount-Code auf Lead anwenden ──────────────────────────────────

export async function applyDiscountCode(
  leadId: string,
  code: string,
  percentage: number,
  basePrice: number,
): Promise<void> {
  const finalPrice = Math.round(basePrice * (1 - percentage / 100));
  const { error } = await supabase
    .from('leads')
    .update({
      discount_code: code,
      discount_percentage: percentage,
      discount_status: 'code_applied',
      final_price: finalPrice,
      discount_note: null,
      discount_requested_at: null,
      discount_resolved_at: null,
    })
    .eq('id', leadId);
  if (error) throw error;
}

export async function requestDiscount(
  leadId: string,
  percentage: number,
  note: string,
  basePrice: number,
): Promise<void> {
  const finalPrice = Math.round(basePrice * (1 - percentage / 100));
  const { error } = await supabase
    .from('leads')
    .update({
      discount_code: null,
      discount_percentage: percentage,
      discount_status: 'requested',
      final_price: finalPrice,
      discount_note: note || null,
      discount_requested_at: new Date().toISOString(),
      discount_resolved_at: null,
    })
    .eq('id', leadId);
  if (error) throw error;
}

export async function clearDiscount(leadId: string): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({
      discount_code: null,
      discount_percentage: null,
      discount_status: 'none',
      final_price: null,
      discount_note: null,
      discount_requested_at: null,
      discount_resolved_at: null,
    })
    .eq('id', leadId);
  if (error) throw error;
}

// ── Zahlungsstatus ───────────────────────────────────────────────────

export async function updatePaymentStatus(
  leadId: string,
  payment: 1 | 2 | 3,
  paid: boolean,
): Promise<void> {
  const field = `payment_${payment}_paid` as const;
  const { error } = await supabase
    .from('leads')
    .update({ [field]: paid })
    .eq('id', leadId);
  if (error) throw error;
}

// ── Termine ──────────────────────────────────────────────────────────

export async function fetchInstallerAppointments(installerId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, installer_id, title, type, starts_at, ends_at, location, notes, lead_id, customer_name, customer_phone, customer_email')
    .eq('installer_id', installerId)
    .order('starts_at');
  if (error) throw error;
  return (data ?? []) as Appointment[];
}

/** Alle Termine des Inhabers + seiner Mitarbeiter */
export async function fetchOwnerAppointments(ownerId: string): Promise<Appointment[]> {
  const { data: employees, error: empErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('owner_id', ownerId);
  if (empErr) throw empErr;

  const ids = [ownerId, ...(employees ?? []).map(e => e.id)];

  const { data, error } = await supabase
    .from('appointments')
    .select('id, installer_id, title, type, starts_at, ends_at, location, notes, lead_id, customer_name, customer_phone, customer_email')
    .in('installer_id', ids)
    .order('starts_at');
  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function createAppointment(
  installerId: string,
  data: {
    title: string;
    type: Appointment['type'];
    starts_at: string;
    ends_at: string;
    location?: string | null;
    notes?: string | null;
    lead_id?: string | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    customer_email?: string | null;
  },
): Promise<Appointment> {
  const { data: row, error } = await supabase
    .from('appointments')
    .insert({ installer_id: installerId, ...data })
    .select('id, installer_id, title, type, starts_at, ends_at, location, notes, lead_id, customer_name, customer_phone, customer_email')
    .single();
  if (error) throw error;
  return row as Appointment;
}

export async function updateAppointment(
  id: string,
  data: Partial<Pick<Appointment, 'title' | 'type' | 'starts_at' | 'ends_at' | 'location' | 'notes' | 'lead_id' | 'customer_name' | 'customer_phone' | 'customer_email'>>,
): Promise<void> {
  const { error } = await supabase.from('appointments').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchAppointmentByLeadId(leadId: string): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, installer_id, title, type, starts_at, ends_at, location, notes, lead_id, customer_name, customer_phone, customer_email')
    .eq('lead_id', leadId)
    .maybeSingle();
  if (error) throw error;
  return data as Appointment | null;
}

export async function upsertSiteVisitAppointment(
  installerId: string,
  lead: Lead,
): Promise<void> {
  const existing = await fetchAppointmentByLeadId(lead.id);

  // Wenn kein Termin mehr geplant → bestehenden Appointment löschen
  if (!lead.site_visit_date) {
    if (existing) {
      await deleteAppointment(existing.id);
    }
    return;
  }

  // Termin erstellen oder aktualisieren
  const start = new Date(lead.site_visit_date);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 Stunde
  const title = `Vor-Ort: ${lead.first_name} ${lead.last_name}`;

  if (existing) {
    await updateAppointment(existing.id, {
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      notes: lead.site_visit_notes || existing.notes,
      customer_name: `${lead.first_name} ${lead.last_name}`,
      customer_phone: lead.phone,
      customer_email: lead.email,
    });
  } else {
    await createAppointment(installerId, {
      title,
      type: 'beratung',
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      location: lead.zip || null,
      notes: lead.site_visit_notes || null,
      lead_id: lead.id,
      customer_name: `${lead.first_name} ${lead.last_name}`,
      customer_phone: lead.phone,
      customer_email: lead.email,
    });
  }
}

// ── Rabatt-System ────────────────────────────────────────────────────

export async function fetchDiscountCodes(): Promise<DiscountCode[]> {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('active', true)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as DiscountCode[];
}

export async function fetchOwnerDiscountCodes(ownerId: string): Promise<DiscountCode[]> {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('created_by', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DiscountCode[];
}

export async function createDiscountCode(params: {
  createdBy: string;
  code: string;
  label?: string;
  percentage: number;
  min_investment?: number | null;
  max_uses?: number | null;
  valid_until?: string | null;
}): Promise<DiscountCode> {
  const { data, error } = await supabase
    .from('discount_codes')
    .insert({
      created_by: params.createdBy,
      code: params.code,
      label: params.label ?? null,
      percentage: params.percentage,
      min_investment: params.min_investment ?? null,
      max_uses: params.max_uses ?? null,
      valid_until: params.valid_until ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as DiscountCode;
}

export async function toggleDiscountCode(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('discount_codes').update({ active }).eq('id', id);
  if (error) throw error;
}

export async function deleteDiscountCode(id: string): Promise<void> {
  const { error } = await supabase.from('discount_codes').delete().eq('id', id);
  if (error) throw error;
}

export async function redeemDiscountCode(
  installerId: string,
  code: string,
  investment: number,
): Promise<{ success: boolean; percentage: number | null; reason: string }> {
  const { data, error } = await supabase.rpc('redeem_discount_code', {
    p_installer_id: installerId,
    p_code: code,
    p_investment: investment,
  });
  if (error) throw new Error(error.message);
  const result = (data as Array<{ success: boolean; percentage: number | null; reason: string }>)?.[0];
  return result ?? { success: false, percentage: null, reason: 'Keine Antwort vom Server' };
}

// ── Team-Management ──────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string | null;
  is_verified: boolean;
  created_at: string;
}

export async function fetchTeamMembers(ownerId: string): Promise<TeamMember[]> {
  // 1. Mitarbeiter laden (owner_id = ownerId)
  const { data: employees, error: empErr } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, phone, is_verified, created_at')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (empErr) {
    console.error('fetchTeamMembers error:', empErr);
    throw new Error(`Datenbankfehler: ${empErr.message}`);
  }

  // 2. Auch den Inhaber selbst laden (für Team-Übersicht)
  const { data: owner, error: ownerErr } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, phone, is_verified, created_at')
    .eq('id', ownerId)
    .single();

  if (ownerErr) {
    console.error('fetchTeamMembers owner error:', ownerErr);
  }

  const members: TeamMember[] = [];

  // Inhaber zuerst
  if (owner) {
    members.push({
      id: owner.id,
      full_name: owner.full_name,
      email: owner.email || '',
      role: owner.role,
      phone: owner.phone,
      is_verified: owner.is_verified,
      created_at: owner.created_at,
    });
  }

  // Dann Mitarbeiter
  (employees ?? []).forEach((d: any) => {
    if (d.id !== ownerId) {
      members.push({
        id: d.id,
        full_name: d.full_name,
        email: d.email || '',
        role: d.role,
        phone: d.phone,
        is_verified: d.is_verified,
        created_at: d.created_at,
      });
    }
  });

  return members;
}

export async function updateTeamMemberRole(userId: string, role: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) throw error;
}

export async function removeTeamMember(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ owner_id: null }).eq('id', userId);
  if (error) throw error;
}

// ── Rabatt-Anfragen ──────────────────────────────────────────────────

export async function fetchPendingDiscountRequests(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select(LEAD_SELECT)
    .eq('discount_status', 'requested')
    .order('discount_requested_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Lead[];
}

/** Rabatt-Anfragen mit Rollen-Scoping */
export async function fetchPendingDiscountRequestsScoped(userId: string, role: 'owner' | 'installer'): Promise<Lead[]> {
  let query = supabase
    .from('leads')
    .select(LEAD_SELECT)
    .eq('discount_status', 'requested');

  if (role === 'owner') {
    const { data: employees, error: empErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('owner_id', userId);
    if (empErr) throw empErr;
    const ids = [userId, ...(employees ?? []).map(e => e.id)];
    query = query.in('installer_id', ids);
  } else {
    query = query.eq('installer_id', userId);
  }

  const { data, error } = await query.order('discount_requested_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function resolveDiscountRequest(
  leadId: string,
  approved: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({
      discount_status: approved ? 'approved' : 'rejected',
      discount_resolved_at: new Date().toISOString(),
      final_price: approved
        ? undefined // wird vom Trigger/Backend berechnet
        : undefined,
    })
    .eq('id', leadId);
  if (error) throw error;
}
