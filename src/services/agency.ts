import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────

export interface Partner {
  id: string;
  agency_id: string;
  company_name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  zip_regions: string[];
  commission_type: 'fixed' | 'percentage';
  commission_value: number;
  kwh_price: number | null;
  is_active: boolean;
  notes: string | null;
  website: string | null;
  access_token: string;
  created_at: string;
}

export interface LeadAssignment {
  id: string;
  lead_id: string;
  partner_id: string;
  agency_id: string;
  assigned_by: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'converted' | 'expired';
  partner_notes: string | null;
  offer_sent_at: string | null;
  offer_accepted_at: string | null;
  commission_amount: number | null;
  commission_status: 'pending' | 'invoiced' | 'paid';
  assigned_at: string;
  responded_at: string | null;
  lead?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    zip: string | null;
    kwp: number | null;
    investment: number | null;
    status: string;
  };
  partner?: {
    company_name: string;
    email: string;
  };
  assigned_by_profile?: {
    full_name: string;
  } | null;
}

export interface Commission {
  id: string;
  agency_id: string;
  partner_id: string;
  lead_id: string;
  lead_assignment_id: string | null;
  amount: number;
  status: 'pending' | 'invoiced' | 'paid' | 'cancelled';
  invoice_number: string | null;
  paid_at: string | null;
  created_at: string;
  partner?: { company_name: string };
  lead?: { first_name: string; last_name: string };
  assignment?: {
    assigned_by: string | null;
    assigned_by_profile?: { full_name: string } | null;
  } | null;
}

// ─── Partners ─────────────────────────────────────────────────────────

export async function fetchPartners(agencyId: string): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('agency_id', agencyId)
    .order('company_name', { ascending: true });
  if (error) throw error;
  return (data as Partner[]) || [];
}

export async function createPartner(
  agencyId: string,
  partner: Omit<Partner, 'id' | 'agency_id' | 'access_token' | 'created_at'>
): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .insert({ ...partner, agency_id: agencyId })
    .select()
    .single();
  if (error) throw error;
  return data as Partner;
}

export async function updatePartner(
  partnerId: string,
  fields: Partial<Omit<Partner, 'id' | 'agency_id' | 'access_token' | 'created_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('partners')
    .update(fields)
    .eq('id', partnerId);
  if (error) throw error;
}

export async function deletePartner(partnerId: string): Promise<void> {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', partnerId);
  if (error) throw error;
}

export async function fetchPartnerByToken(token: string): Promise<Partner | null> {
  const { data, error } = await supabase.rpc('get_partner_by_token', { p_token: token });
  if (error || !data) return null;
  return data as Partner;
}

// ─── Lead Assignments ─────────────────────────────────────────────────

export async function fetchLeadAssignments(agencyId: string): Promise<LeadAssignment[]> {
  const { data, error } = await supabase
    .from('lead_assignments')
    .select(`
      *,
      lead:leads(first_name, last_name, email, phone, zip, kwp, investment, status),
      partner:partners(company_name, email),
      assigned_by_profile:profiles!assigned_by(full_name)
    `)
    .eq('agency_id', agencyId)
    .order('assigned_at', { ascending: false });
  if (error) throw error;
  return (data as LeadAssignment[]) || [];
}

// Portal-seitig: Token statt partner_id (anon-safe via RPC)
export async function fetchPartnerAssignmentsByToken(token: string): Promise<LeadAssignment[]> {
  const { data, error } = await supabase.rpc('get_partner_assignments', { p_token: token });
  if (error) throw error;
  return (data as LeadAssignment[]) || [];
}

// Agency-seitig: direkte Supabase-Abfrage (authenticated)
export async function fetchPartnerAssignments(partnerId: string): Promise<LeadAssignment[]> {
  const { data, error } = await supabase
    .from('lead_assignments')
    .select(`
      *,
      lead:leads(first_name, last_name, email, phone, zip, kwp, investment, status)
    `)
    .eq('partner_id', partnerId)
    .order('assigned_at', { ascending: false });
  if (error) throw error;
  return (data as LeadAssignment[]) || [];
}

export async function assignLeadToPartner(
  leadId: string,
  partnerId: string,
  agencyId: string,
  assignedBy?: string
): Promise<LeadAssignment> {
  // Hole Partner für Provision + E-Mail
  const { data: partner, error: pErr } = await supabase
    .from('partners')
    .select('company_name, email, access_token, commission_type, commission_value')
    .eq('id', partnerId)
    .single();
  if (pErr) throw pErr;

  // Hole Lead für E-Mail (vollständige Wirtschaftsdaten)
  const { data: lead, error: lErr } = await supabase
    .from('leads')
    .select('first_name, last_name, email, phone, zip, kwp, investment, annual_savings, autarky, amortization, consumption, has_battery, has_e_car, has_heat_pump, roof_orientation, planning_horizon')
    .eq('id', leadId)
    .single();
  if (lErr) throw lErr;

  const commissionAmount = partner.commission_type === 'fixed'
    ? partner.commission_value
    : 0; // Percentage wird erst bei Conversion berechnet

  const { data, error } = await supabase
    .from('lead_assignments')
    .insert({
      lead_id: leadId,
      partner_id: partnerId,
      agency_id: agencyId,
      commission_amount: commissionAmount,
      ...(assignedBy ? { assigned_by: assignedBy } : {}),
    })
    .select()
    .single();
  if (error) throw error;

  // E-Mail an Partner mit vollständigen Daten + Ein-Klick-Buttons
  const fnBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  try {
    await fetch(`${fnBase}/notify-partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
      body: JSON.stringify({
        partner_email:    partner.email,
        partner_name:     partner.company_name,
        assignment_id:    (data as LeadAssignment).id,
        partner_token:    partner.access_token,
        lead_name:        `${lead.first_name} ${lead.last_name}`,
        lead_email:       lead.email,
        lead_phone:       lead.phone,
        lead_zip:         lead.zip,
        lead_kwp:         lead.kwp,
        lead_investment:  lead.investment,
        lead_savings:     lead.annual_savings,
        lead_autarky:     lead.autarky,
        lead_amortization: lead.amortization,
        lead_consumption: lead.consumption,
        lead_battery:     lead.has_battery,
        lead_ecar:        lead.has_e_car,
        lead_heatpump:    lead.has_heat_pump,
        lead_orientation: lead.roof_orientation,
        lead_horizon:     lead.planning_horizon,
        commission_value: partner.commission_value,
        commission_type:  partner.commission_type,
      }),
    });
  } catch (e) {
    console.warn('E-Mail an Partner konnte nicht gesendet werden:', e);
  }

  return data as LeadAssignment;
}

// Portal-seitig: token-basiert, anon-safe. Commission-Erstellung + Validierung im RPC.
export async function partnerUpdateAssignmentByToken(
  token: string,
  assignmentId: string,
  status: 'accepted' | 'rejected' | 'converted',
  notes?: string
): Promise<void> {
  const { error } = await supabase.rpc('partner_update_assignment', {
    p_token: token,
    p_assignment_id: assignmentId,
    p_status: status,
    p_notes: notes ?? null,
  });
  if (error) throw error;

  // E-Mail an Agentur (fire-and-forget, nach dem RPC-Erfolg)
  _notifyAgencyOnStatusChange(assignmentId, status, notes).catch(() => {});
}

// Agency-seitig: direkt, authenticated (z. B. Agentur setzt Lead auf expired)
export async function updateAssignmentStatus(
  assignmentId: string,
  status: LeadAssignment['status'],
  notes?: string
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (notes !== undefined) updates.partner_notes = notes;
  if (status === 'accepted' || status === 'rejected') {
    updates.responded_at = new Date().toISOString();
  }
  if (status === 'converted') {
    updates.offer_accepted_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('lead_assignments')
    .update(updates)
    .eq('id', assignmentId);
  if (error) throw error;

  if (['accepted', 'rejected', 'converted'].includes(status)) {
    _notifyAgencyOnStatusChange(assignmentId, status, notes).catch(() => {});
  }
}

async function _notifyAgencyOnStatusChange(
  assignmentId: string,
  status: string,
  notes?: string
): Promise<void> {
  const { data: assignment } = await supabase
    .from('lead_assignments')
    .select(`agency_id, partner:partners(company_name), lead:leads(first_name, last_name), partner_notes`)
    .eq('id', assignmentId)
    .single();
  if (!assignment) return;

  const { data: agencyProfile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', assignment.agency_id)
    .single();
  if (!agencyProfile?.email) return;

  await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-agency`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
    body: JSON.stringify({
      agency_email: agencyProfile.email,
      partner_name: (assignment as any).partner?.company_name,
      lead_name: `${(assignment as any).lead?.first_name || ''} ${(assignment as any).lead?.last_name || ''}`.trim(),
      status,
      notes: notes ?? (assignment as any).partner_notes,
    }),
  });
}

// ─── Commissions ──────────────────────────────────────────────────────

export async function fetchCommissions(agencyId: string): Promise<Commission[]> {
  const { data, error } = await supabase
    .from('commissions')
    .select(`
      *,
      partner:partners(company_name),
      lead:leads(first_name, last_name),
      assignment:lead_assignments!lead_assignment_id(assigned_by, assigned_by_profile:profiles!assigned_by(full_name))
    `)
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Commission[]) || [];
}

export async function createCommission(
  agencyId: string,
  partnerId: string,
  leadId: string,
  leadAssignmentId: string,
  amount: number
): Promise<Commission> {
  const { data, error } = await supabase
    .from('commissions')
    .insert({
      agency_id: agencyId,
      partner_id: partnerId,
      lead_id: leadId,
      lead_assignment_id: leadAssignmentId,
      amount,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Commission;
}

export async function markCommissionInvoiced(commissionId: string, invoiceNumber?: string): Promise<void> {
  const { error } = await supabase
    .from('commissions')
    .update({ status: 'invoiced', invoice_number: invoiceNumber || null })
    .eq('id', commissionId);
  if (error) throw error;
}

export async function markCommissionPaid(commissionId: string): Promise<void> {
  const { error } = await supabase
    .from('commissions')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', commissionId);
  if (error) throw error;
}

// ─── Leads für Agency ─────────────────────────────────────────────────

export async function fetchAgencyLeads(agencyId: string): Promise<import('./data').Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as import('./data').Lead[]) || [];
}
