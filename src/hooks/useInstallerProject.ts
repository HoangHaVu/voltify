import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProjectByIdScoped, updateProjectStatus, updateProjectNotes, type Project } from '../services/data';

const NEXT_PHASE: Partial<Record<Project['status'], Project['status']>> = {
  angebot: 'planung',
  planung: 'genehmigung',
  genehmigung: 'installation',
  installation: 'inbetrieb',
};

export function useInstallerProject(projectId: string) {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !projectId) { setIsLoading(false); return; }
    fetchProjectByIdScoped(user.id, user.role === 'owner' ? 'owner' : 'installer', projectId)
      .then(setProject)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [user?.id, user?.role, projectId]);

  async function changeStatus(status: Project['status']) {
    if (!project) return;
    setProject(prev => prev ? { ...prev, status } : prev);
    try {
      await updateProjectStatus(project.id, status);
    } catch (e) { setError((e as Error).message); }
  }

  async function advancePhase() {
    if (!project) return;
    const next = NEXT_PHASE[project.status];
    if (!next) return;
    setIsSaving(true);
    await changeStatus(next);
    setIsSaving(false);
  }

  async function saveNotes(notes: string) {
    if (!project) return;
    setIsSaving(true);
    try {
      await updateProjectNotes(project.id, notes);
      setProject(prev => prev ? { ...prev, notes } : prev);
    } catch (e) { setError((e as Error).message); }
    finally { setIsSaving(false); }
  }

  const isLastPhase = project?.status === 'inbetrieb';

  return { project, isLoading, isSaving, error, advancePhase, changeStatus, saveNotes, isLastPhase };
}
