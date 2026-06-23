import { supabase } from '../lib/supabase';
import type { Lead, OfferDraft, OfferLineItem, DiscountCode } from './data';

export type { OfferDraft, OfferLineItem };

// ─── Default-Preise (können in AdminSettings überschrieben werden) ────

const STORAGE_KEY = 'voltify_settings_v1';

export interface OfferPrices {
  modulePerKwp: number;
  inverterPerKwp: number;
  storagePerKwh: number;
  mountingFixed: number;
  electricalFixed: number;
  scaffoldingFixed: number;
  travelFixed: number;
  vatRate: number;
}

export const DEFAULT_PRICES: OfferPrices = {
  modulePerKwp: 1200,
  inverterPerKwp: 250,
  storagePerKwh: 800,
  mountingFixed: 2500,
  electricalFixed: 1800,
  scaffoldingFixed: 1200,
  travelFixed: 0,
  vatRate: 0,
};

export function loadOfferPrices(): OfferPrices {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRICES;
    const settings = JSON.parse(raw);
    return {
      modulePerKwp: Number(settings.modulePricePerKwp) || DEFAULT_PRICES.modulePerKwp,
      inverterPerKwp: Number(settings.inverterPricePerKwp) || DEFAULT_PRICES.inverterPerKwp,
      storagePerKwh: Number(settings.storagePricePerKwh) || DEFAULT_PRICES.storagePerKwh,
      mountingFixed: Number(settings.mountingFixed) || DEFAULT_PRICES.mountingFixed,
      electricalFixed: Number(settings.electricalFixed) || DEFAULT_PRICES.electricalFixed,
      scaffoldingFixed: Number(settings.scaffoldingFixed) || DEFAULT_PRICES.scaffoldingFixed,
      travelFixed: Number(settings.travelFixed) || DEFAULT_PRICES.travelFixed,
      vatRate: Number(settings.vatRate) || DEFAULT_PRICES.vatRate,
    };
  } catch {
    return DEFAULT_PRICES;
  }
}

export const CATEGORY_LABELS: Record<OfferLineItem['category'], string> = {
  module: 'Module',
  inverter: 'Wechselrichter',
  storage: 'Speicher',
  mounting: 'Montage',
  electrical: 'Elektroarbeiten',
  scaffolding: 'Gerüst',
  travel: 'Anfahrt',
  other: 'Sonstiges',
};

// ─── Angebotsvorlagen ─────────────────────────────────────────────────

export interface OfferTextTemplate {
  anschreiben: string;
  zahlungsbedingungen: string;
  folgekostenHinweis: string;
  schlusstext: string;
  showFolgekosten: boolean;
}

export interface EmailTemplate {
  betreff: string;
  nachricht: string;
}

export const DEFAULT_OFFER_TEXT_TEMPLATE: OfferTextTemplate = {
  anschreiben: 'Sehr geehrte/r {{nachname}},\n\nvielen Dank für Ihr Interesse an einer Photovoltaikanlage. Anbei erhalten Sie Ihr persönliches Angebot Nr. {{angebotsnummer}}.\n\nBei Fragen stehen wir Ihnen gerne zur Verfügung.',
  zahlungsbedingungen: 'Zahlungsziel: {{zahlungsziel}} Tage nach Rechnungsstellung ohne Abzug.\nDie Liefer- und Leistungsfrist beginnt mit Zahlungseingang der Anzahlung.\nDieses Angebot ist unverbindlich und freibleibend. Die angegebenen Werte sind Prognosen auf Basis von Einstrahlungsdaten und Standardannahmen.',
  folgekostenHinweis: 'Diese Analyse rechnet ehrlich — die meisten Anbieter verschweigen Folgekosten.\n\nBerücksichtigte Lebenszykluskosten:\n• Wechselrichter-Austausch nach ca. 12 Jahren: ~2.000 €\n• Jährliche Wartung & Inspektion: ~200 €/Jahr\n\nDie angegebenen Amortisations- und Gewinnwerte sind Planungswerte. Tatsächliche Erträge können abweichen.',
  schlusstext: 'Mit freundlichen Grüßen\n{{firmenname}}',
  showFolgekosten: true,
};

export const DEFAULT_EMAIL_TEMPLATE: EmailTemplate = {
  betreff: 'Ihr persönliches Solar-Angebot {{angebotsnummer}} — {{firmenname}}',
  nachricht: 'Guten Tag {{vorname}} {{nachname}},\n\nvielen Dank für Ihr Interesse an einer Photovoltaikanlage. Anbei finden Sie Ihr persönliches Angebot.\n\nBei Fragen stehen wir Ihnen gerne zur Verfügung.\n\nMit freundlichen Grüßen\n{{firmenname}}',
};

export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

export async function fetchOfferTemplates(ownerId: string): Promise<{
  offerTextTemplate: OfferTextTemplate;
  emailTemplate: EmailTemplate;
}> {
  const { data } = await supabase
    .from('profiles')
    .select('offer_text_template, email_template')
    .eq('id', ownerId)
    .single();
  return {
    offerTextTemplate: data?.offer_text_template
      ? { ...DEFAULT_OFFER_TEXT_TEMPLATE, ...(data.offer_text_template as Partial<OfferTextTemplate>) }
      : DEFAULT_OFFER_TEXT_TEMPLATE,
    emailTemplate: data?.email_template
      ? { ...DEFAULT_EMAIL_TEMPLATE, ...(data.email_template as Partial<EmailTemplate>) }
      : DEFAULT_EMAIL_TEMPLATE,
  };
}

export async function saveOfferTemplates(
  ownerId: string,
  offerTextTemplate: OfferTextTemplate,
  emailTemplate: EmailTemplate,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ offer_text_template: offerTextTemplate, email_template: emailTemplate })
    .eq('id', ownerId);
  if (error) throw error;
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────

export function buildDefaultLineItems(lead: Lead): Omit<OfferLineItem, 'id' | 'offer_draft_id'>[] {
  const prices = loadOfferPrices();
  const items: Omit<OfferLineItem, 'id' | 'offer_draft_id'>[] = [];
  let order = 0;

  const kwp = lead.kwp ?? 0;

  // Module
  if (kwp > 0) {
    items.push({
      category: 'module',
      description: `Photovoltaik-Module (${kwp.toFixed(2)} kWp)`,
      quantity: kwp,
      unit: 'kWp',
      unit_price: prices.modulePerKwp,
      total_price: Math.round(kwp * prices.modulePerKwp),
      is_optional: false,
      sort_order: order++,
    });
  }

  // Wechselrichter
  if (kwp > 0) {
    items.push({
      category: 'inverter',
      description: 'Wechselrichter inkl. Schutzkomponenten',
      quantity: kwp,
      unit: 'kWp',
      unit_price: prices.inverterPerKwp,
      total_price: Math.round(kwp * prices.inverterPerKwp),
      is_optional: false,
      sort_order: order++,
    });
  }

  // Speicher (Default 10 kWh falls vorhanden, da Lead nur boolean hat)
  if (lead.has_battery) {
    const storageKwh = 10;
    items.push({
      category: 'storage',
      description: `Stromspeicher (${storageKwh} kWh)`,
      quantity: storageKwh,
      unit: 'kWh',
      unit_price: prices.storagePerKwh,
      total_price: Math.round(storageKwh * prices.storagePerKwh),
      is_optional: false,
      sort_order: order++,
    });
  }

  // Montage
  items.push({
    category: 'mounting',
    description: 'Montage, Durchdringungen und Abdichtung',
    quantity: 1,
    unit: 'Pauschal',
    unit_price: prices.mountingFixed,
    total_price: prices.mountingFixed,
    is_optional: false,
    sort_order: order++,
  });

  // Elektro
  items.push({
    category: 'electrical',
    description: 'Elektroinstallation, Anschluss und Inbetriebnahme',
    quantity: 1,
    unit: 'Pauschal',
    unit_price: prices.electricalFixed,
    total_price: prices.electricalFixed,
    is_optional: false,
    sort_order: order++,
  });

  return items;
}

export function generateOfferNumber(lead: Lead): string {
  const prefix = 'ANG';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const leadId = lead.id.slice(0, 4).toUpperCase();
  return `${prefix}-${date}-${leadId}`;
}

export function calculateDraftTotals(lineItems: Pick<OfferLineItem, 'total_price'>[]): {
  subtotal: number;
} {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  return { subtotal };
}

// ─── CRUD ─────────────────────────────────────────────────────────────

export async function getOfferDraftForLead(leadId: string): Promise<OfferDraft | null> {
  const { data, error } = await supabase
    .from('offer_drafts')
    .select('*, line_items:offer_line_items(*)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as OfferDraft | null;
}

export async function getOrCreateOfferDraft(
  lead: Lead,
  userId: string
): Promise<OfferDraft> {
  const existing = await getOfferDraftForLead(lead.id);
  if (existing) return existing;

  const { subtotal } = calculateDraftTotals(buildDefaultLineItems(lead));
  const offerNumber = generateOfferNumber(lead);

  const prices = loadOfferPrices();
  const { data: draft, error: draftError } = await supabase
    .from('offer_drafts')
    .insert({
      lead_id: lead.id,
      created_by: userId,
      status: 'draft',
      subtotal,
      total: subtotal,
      offer_number: offerNumber,
      vat_rate: prices.vatRate,
    })
    .select()
    .single();
  if (draftError) throw draftError;

  const defaultItems = buildDefaultLineItems(lead);
  if (defaultItems.length > 0) {
    const { error: itemsError } = await supabase
      .from('offer_line_items')
      .insert(defaultItems.map((item) => ({ ...item, offer_draft_id: draft.id })));
    if (itemsError) throw itemsError;
  }

  // Neu laden mit Line Items
  const full = await getOfferDraftForLead(lead.id);
  if (!full) throw new Error('Entwurf konnte nicht erstellt werden');
  return full;
}

export async function updateOfferDraft(
  draftId: string,
  fields: Partial<Pick<
    OfferDraft,
    'status' | 'discount_amount' | 'discount_percentage' | 'discount_code' | 'discount_note' | 'vat_rate' | 'notes' | 'offer_number' | 'sent_at' | 'accepted_at' | 'rejected_at'
  >>
): Promise<OfferDraft> {
  const { data, error } = await supabase
    .from('offer_drafts')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', draftId)
    .select()
    .single();
  if (error) throw error;
  return data as OfferDraft;
}

export async function addLineItem(
  draftId: string,
  item: Omit<OfferLineItem, 'id' | 'offer_draft_id'>
): Promise<OfferLineItem> {
  const total_price = Math.round(item.quantity * item.unit_price);
  const { data, error } = await supabase
    .from('offer_line_items')
    .insert({ ...item, offer_draft_id: draftId, total_price })
    .select()
    .single();
  if (error) throw error;
  return data as OfferLineItem;
}

export async function updateLineItem(
  itemId: string,
  fields: Partial<Pick<OfferLineItem, 'category' | 'description' | 'quantity' | 'unit' | 'unit_price' | 'is_optional' | 'sort_order'>>
): Promise<OfferLineItem> {
  const total_price =
    fields.quantity !== undefined && fields.unit_price !== undefined
      ? Math.round(fields.quantity * fields.unit_price)
      : undefined;
  const { data, error } = await supabase
    .from('offer_line_items')
    .update({ ...fields, ...(total_price !== undefined ? { total_price } : {}) })
    .eq('id', itemId)
    .select()
    .single();
  if (error) throw error;
  return data as OfferLineItem;
}

export async function deleteLineItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('offer_line_items').delete().eq('id', itemId);
  if (error) throw error;
}

export async function recalculateDraft(draftId: string): Promise<OfferDraft> {
  // Line Items laden
  const { data: items, error: itemsError } = await supabase
    .from('offer_line_items')
    .select('total_price')
    .eq('offer_draft_id', draftId);
  if (itemsError) throw itemsError;

  const { subtotal } = calculateDraftTotals(items || []);

  // Draft laden für Rabatt-Info
  const { data: draft, error: draftError } = await supabase
    .from('offer_drafts')
    .select('discount_percentage, discount_amount, vat_rate')
    .eq('id', draftId)
    .single();
  if (draftError) throw draftError;

  const discountPercentage = draft.discount_percentage || 0;
  const discountAmount = draft.discount_amount || 0;
  const discountFromPct = Math.round((subtotal * discountPercentage) / 100);
  const totalDiscount = discountAmount > 0 ? discountAmount : discountFromPct;
  const netAfterDiscount = Math.max(0, subtotal - totalDiscount);
  const vatRate = draft.vat_rate || 0;
  const vatAmount = Math.round((netAfterDiscount * vatRate) / 100);
  const total = netAfterDiscount + vatAmount;

  const { data, error } = await supabase
    .from('offer_drafts')
    .update({
      subtotal,
      discount_amount: totalDiscount,
      vat_amount: vatAmount,
      total,
      updated_at: new Date().toISOString(),
    })
    .eq('id', draftId)
    .select('*, line_items:offer_line_items(*)')
    .single();
  if (error) throw error;
  return data as OfferDraft;
}

// ─── Rabatt-Codes ─────────────────────────────────────────────────────

export async function applyDiscountCodeToDraft(
  draftId: string,
  code: DiscountCode
): Promise<OfferDraft> {
  const { data: draft, error: draftError } = await supabase
    .from('offer_drafts')
    .select('subtotal')
    .eq('id', draftId)
    .single();
  if (draftError) throw draftError;

  const discountAmount = Math.round((draft.subtotal * code.percentage) / 100);

  const { data, error } = await supabase
    .from('offer_drafts')
    .update({
      discount_code: code.code,
      discount_percentage: code.percentage,
      discount_amount: discountAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', draftId)
    .select()
    .single();
  if (error) throw error;

  return recalculateDraft((data as OfferDraft).id);
}

// ─── Status-Übergänge ─────────────────────────────────────────────────

export async function markOfferDraftSent(draftId: string): Promise<OfferDraft> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('offer_drafts')
    .update({ status: 'sent', sent_at: now, updated_at: now })
    .eq('id', draftId)
    .select('*, line_items:offer_line_items(*)')
    .single();
  if (error) throw error;

  // Lead-Status synchronisieren
  const draft = data as OfferDraft;
  await supabase
    .from('leads')
    .update({ offer_status: 'sent', offer_sent_at: now })
    .eq('id', draft.lead_id);

  return draft;
}

export async function markOfferDraftAccepted(draftId: string): Promise<OfferDraft> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('offer_drafts')
    .update({ status: 'accepted', accepted_at: now, updated_at: now })
    .eq('id', draftId)
    .select('*, line_items:offer_line_items(*)')
    .single();
  if (error) throw error;

  const draft = data as OfferDraft;
  await supabase
    .from('leads')
    .update({ offer_status: 'accepted', status: 'gewonnen', final_price: draft.total })
    .eq('id', draft.lead_id);

  return draft;
}

export async function markOfferDraftRejected(draftId: string): Promise<OfferDraft> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('offer_drafts')
    .update({ status: 'rejected', rejected_at: now, updated_at: now })
    .eq('id', draftId)
    .select('*, line_items:offer_line_items(*)')
    .single();
  if (error) throw error;

  const draft = data as OfferDraft;
  await supabase
    .from('leads')
    .update({ offer_status: 'rejected' })
    .eq('id', draft.lead_id);

  return draft;
}
