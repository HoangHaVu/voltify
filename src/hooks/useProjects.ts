import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchInstallerProjects, fetchOwnerProjects, updateProjectStatus, type Project } from '../services/data';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    const loader = user.role === 'owner' ? fetchOwnerProjects(user.id) : fetchInstallerProjects(user.id);
    loader
      .then(setProjects)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [user?.id, user?.role]);

  async function moveProject(projectId: string, newStatus: Project['status']) {
    const snapshot = projects;
    setProjects(current => current.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    try {
      await updateProjectStatus(projectId, newStatus);
    } catch {
      setProjects(snapshot);
    }
  }

  return { projects, isLoading, error, moveProject };
}
