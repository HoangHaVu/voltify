import { useState } from 'react';
import { Clock, Phone, Mail, Send, CheckCircle, XCircle, Calendar, StickyNote, TrendingUp, Tag, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Lead, LeadActivity } from '../../services/data';

interface Props {
  lead: Lead;
  userName: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Phone; color: string; bg: string }> = {
  status_change:      { label: 'Status-Änderung', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  offer_sent:         { label: 'Angebot versendet', icon: Send, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  offer_viewed:       { label: 'Angebot angesehen', icon: Mail, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  offer_accepted:     { label: 'Angebot angenommen', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  offer_rejected:     { label: 'Angebot abgelehnt', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  call_made:          { label: 'Anruf', icon: Phone, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  email_sent:         { label: 'E-Mail', icon: Mail, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  appointment_scheduled: { label: 'Termin', icon: Calendar, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  note_added:         { label: 'Notiz', icon: StickyNote, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  site_visit_done:    { label: 'Vor-Ort-Termin', icon: Calendar, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  payment_received:   { label: 'Zahlung', icon: Tag, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  discount_requested: { label: 'Rabatt-Anfrage', icon: Tag, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  discount_approved:  { label: 'Rabatt genehmigt', icon: Tag, color: 'text-green-400', bg: 'bg-green-500/10' },
};

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'gerade eben';
  if (mins < 60) return `vor ${mins} Min.`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs} Std.`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `vor ${days} Tagen`;
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ActivityLog({ lead, userName }: Props) {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const activities = lead.activities || [];

  async function addNote() {
    if (!note.trim()) return;
    setIsSaving(true);
    await supabase.from('lead_activities').insert({
      lead_id: lead.id,
      type: 'note_added',
      description: note.trim(),
      user_name: userName,
    });
    setNote('');
    setIsSaving(false);
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      {/* Neue Notiz */}
      <div className="flex gap-2">
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNote()}
          placeholder="Notiz hinzufügen…"
          className="flex-1 bg-[#252525] border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-gray-600 focus:ring-1 focus:ring-[#F5A623] outline-none"
        />
        <button
          onClick={addNote}
          disabled={isSaving || !note.trim()}
          className="bg-[#F5A623] hover:bg-[#E09000] text-[#1A3A5C] font-bold text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Speichern'}
        </button>
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4">Noch keine Aktivitäten. Fügen Sie eine Notiz hinzu oder ändern Sie den Status.</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const cfg = TYPE_CONFIG[activity.type] || TYPE_CONFIG.note_added;
            const Icon = cfg.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">
                    <span className={`font-bold ${cfg.color}`}>{cfg.label}</span>
                    {activity.user_name && <span className="text-gray-500"> · {activity.user_name}</span>}
                  </p>
                  <p className="text-sm text-white mt-0.5">{activity.description}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{formatTimeAgo(activity.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
