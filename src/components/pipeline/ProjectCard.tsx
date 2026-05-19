import { useNavigate } from 'react-router-dom';
import { Zap, Euro, CheckCircle } from 'lucide-react';
import type { Project } from '../../services/data';

interface ProjectCardProps {
  project: Project;
  done?: boolean;
  onClick?: () => void;
}

export function ProjectCard({ project, done }: ProjectCardProps) {
  const navigate = useNavigate();
  const name = project.customer?.full_name
    ?? (project.lead ? `${project.lead.first_name} ${project.lead.last_name}` : null)
    ?? 'Unbekannter Kunde';

  return (
    <div
      draggable={!done}
      onDragStart={!done ? (e) => {
        e.dataTransfer.setData('leadId', project.id);
        e.dataTransfer.effectAllowed = 'move';
      } : undefined}
      onClick={() => navigate(`/project/${project.id}`)}
      className={`rounded-xl border p-4 transition-all duration-200 group cursor-pointer ${
        done
          ? 'bg-green-500/5 border-green-500/20 opacity-75 hover:opacity-100'
          : 'bg-[#1A1A1A] border-white/5 hover:border-[#F5A623]/30 hover:shadow-lg cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-bold text-white text-sm leading-tight truncate">{name}</p>
        {done && <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />}
      </div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
        #{project.id.slice(0, 8).toUpperCase()}
      </p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className={`rounded-lg p-2 flex items-center gap-1.5 ${done ? 'bg-green-500/10' : 'bg-[#252525]'}`}>
          <Zap className="w-3 h-3 text-gray-500 shrink-0" />
          <p className="text-xs font-bold text-white truncate">
            {project.kwp != null ? `${project.kwp} kWp` : '—'}
          </p>
        </div>
        <div className={`rounded-lg p-2 flex items-center gap-1.5 ${done ? 'bg-green-500/10' : 'bg-[#252525]'}`}>
          <Euro className="w-3 h-3 text-gray-500 shrink-0" />
          <p className="text-xs font-bold text-white truncate">
            {project.investment != null ? `${project.investment.toLocaleString('de-DE')} €` : '—'}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-right font-medium group-hover:text-[#F5A623] transition-colors">
        Details →
      </p>
    </div>
  );
}
