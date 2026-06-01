import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchLeadByIdScoped, updateLeadStatus, updateLeadOfferStatus, addLeadActivity,
  applyDiscountCode, requestDiscount, clearDiscount, redeemDiscountCode,
  type Lead,
} from '../services/data';

export function useInstallerLead(leadId: string) {
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !leadId) { setIsLoading(false); return; }
    fetchLeadByIdScoped(user.id, user.role === 'owner' ? 'owner' : 'installer', leadId)
      .then(setLead)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [user?.id, user?.role, leadId]);

  async function changeStatus(status: Lead['status']) {
    if (!lead) return;
    await updateLeadStatus(lead.id, status);
    const statusLabels: Record<string, string> = {
      neu: 'Neu', kontaktiert: 'Kontaktiert', angebot: 'Angebot', termin: 'Termin vereinbart',
      gewonnen: 'Gewonnen', verloren: 'Verloren', abgelehnt: 'Abgelehnt',
    };
    await addLeadActivity(lead.id, 'status_change', `Status geändert zu „${statusLabels[status] || status}"`, user?.id, user?.fullName);
    setLead((prev) => prev ? { ...prev, status } : prev);
  }

  async function changeOfferStatus(
    offerStatus: Lead['offer_status'],
    extra?: { offer_sent_at?: string; offer_viewed_at?: string }
  ) {
    if (!lead) return;
    await updateLeadOfferStatus(lead.id, offerStatus, extra);
    const offerLabels: Record<string, string> = {
      created: 'Angebot erstellt', sent: 'Angebot versendet', viewed: 'Angebot angesehen',
      accepted: 'Angebot angenommen', rejected: 'Angebot abgelehnt',
    };
    await addLeadActivity(lead.id, `offer_${offerStatus}`, offerLabels[offerStatus] || `Angebot-Status: ${offerStatus}`, user?.id, user?.fullName);
    setLead((prev) => prev ? { ...prev, offer_status: offerStatus, ...extra } : prev);
  }

  async function applyCode(code: string, percentage: number, createdBy: string) {
    if (!lead) return;
    const basePrice = lead.investment ?? 0;
    const validation = await redeemDiscountCode(createdBy, code, basePrice);
    if (!validation.success) throw new Error(validation.reason);
    await applyDiscountCode(lead.id, code, percentage, basePrice);
    const final_price = Math.round(basePrice * (1 - percentage / 100));
    setLead((prev) => prev ? {
      ...prev,
      discount_code: code,
      discount_percentage: percentage,
      discount_status: 'code_applied',
      final_price,
      discount_note: null,
      discount_requested_at: null,
      discount_resolved_at: null,
    } : prev);
  }

  async function requestCustomDiscount(percentage: number, note: string) {
    if (!lead) return;
    const basePrice = lead.investment ?? 0;
    await requestDiscount(lead.id, percentage, note, basePrice);
    const final_price = Math.round(basePrice * (1 - percentage / 100));
    setLead((prev) => prev ? {
      ...prev,
      discount_code: null,
      discount_percentage: percentage,
      discount_status: 'requested',
      final_price,
      discount_note: note || null,
      discount_requested_at: new Date().toISOString(),
      discount_resolved_at: null,
    } : prev);
  }

  async function clearLeadDiscount() {
    if (!lead) return;
    await clearDiscount(lead.id);
    setLead((prev) => prev ? {
      ...prev,
      discount_code: null,
      discount_percentage: null,
      discount_status: 'none',
      final_price: null,
      discount_note: null,
      discount_requested_at: null,
      discount_resolved_at: null,
    } : prev);
  }

  return { lead, isLoading, error, changeStatus, changeOfferStatus, applyCode, requestCustomDiscount, clearLeadDiscount };
}
