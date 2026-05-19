import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchInstallerLeads, fetchOwnerLeads, updateLeadStatus, createProjectFromLead, type Lead } from '../services/data';

export function useLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    const loader = user.role === 'owner' ? fetchOwnerLeads(user.id) : fetchInstallerLeads(user.id);
    loader
      .then(setLeads)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [user?.id, user?.role]);

  async function moveCard(leadId: string, newStatus: Lead['status']) {
    const snapshot = leads;
    setLeads(current => current.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    try {
      await updateLeadStatus(leadId, newStatus);
    } catch {
      setLeads(snapshot);
    }
  }

  async function markWon(lead: Lead): Promise<string | null> {
    if (!user) return null;
    try {
      const projectId = await createProjectFromLead(lead, user.id);
      setLeads(current => current.map(l => l.id === lead.id ? { ...l, status: 'gewonnen' as const } : l));
      return projectId;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }

  async function markLost(leadId: string) {
    setLeads(current => current.map(l => l.id === leadId ? { ...l, status: 'verloren' as const } : l));
    try {
      await updateLeadStatus(leadId, 'verloren');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return { leads, isLoading, error, moveCard, markWon, markLost };
}
