import { useState, useEffect, useCallback } from 'react';
import {
  fetchDiscountCodes,
  fetchOwnerDiscountCodes,
  createDiscountCode,
  toggleDiscountCode,
  deleteDiscountCode,
  type DiscountCode,
} from '../services/data';

export type { DiscountCode };

export interface NewDiscountCode {
  code: string;
  label: string;
  percentage: number;
  min_investment: number | null;
  max_uses: number | null;
  valid_until: string | null;
}

export function useDiscountCodes(installerId: string | undefined) {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = installerId
        ? await fetchOwnerDiscountCodes(installerId)
        : await fetchDiscountCodes();
      setCodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setIsLoading(false);
    }
  }, [installerId]);

  useEffect(() => { load(); }, [load]);

  async function create(values: NewDiscountCode): Promise<boolean> {
    if (!installerId) return false;
    setIsSaving(true);
    setError(null);
    try {
      await createDiscountCode({
        createdBy: installerId,
        code: values.code,
        label: values.label,
        percentage: values.percentage,
        min_investment: values.min_investment,
        max_uses: values.max_uses,
        valid_until: values.valid_until,
      });
      await load();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    try {
      await toggleDiscountCode(id, active);
      setCodes(prev => prev.map(c => c.id === id ? { ...c, active } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren');
    }
  }

  async function remove(id: string) {
    try {
      await deleteDiscountCode(id);
      setCodes(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
    }
  }

  return { codes, isLoading, isSaving, error, create, toggle, remove };
}
