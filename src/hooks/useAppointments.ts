import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchInstallerAppointments,
  fetchOwnerAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  type Appointment,
} from '../services/data';

export function useAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const data = user.role === 'owner'
        ? await fetchOwnerAppointments(user.id)
        : await fetchInstallerAppointments(user.id);
      setAppointments(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => { load(); }, [load]);

  function sortByStart(list: Appointment[]): Appointment[] {
    return [...list].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  }

  async function create(data: {
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
  }) {
    if (!user) return;
    const newA = await createAppointment(user.id, data);
    setAppointments(prev => sortByStart([...prev, newA]));
  }

  async function update(
    id: string,
    data: Partial<Pick<Appointment, 'title' | 'type' | 'starts_at' | 'ends_at' | 'location' | 'notes'>>,
  ) {
    await updateAppointment(id, data);
    setAppointments(prev => sortByStart(prev.map(a => a.id === id ? { ...a, ...data } : a)));
  }

  async function remove(id: string) {
    await deleteAppointment(id);
    setAppointments(prev => prev.filter(a => a.id !== id));
  }

  return { appointments, isLoading, error, create, update, remove };
}
