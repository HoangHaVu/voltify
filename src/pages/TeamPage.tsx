import { useState, useEffect } from 'react';
import {
  Users, Loader2, RefreshCw, Trash2, ChevronDown,
  UserPlus, Shield, User, Wrench, HardHat, ClipboardList,
  Crown, AlertTriangle, X, Check, Copy, Eye, EyeOff,
  Mail, KeyRound, Sparkles,
} from 'lucide-react';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { fetchTeamMembers, updateTeamMemberRole, removeTeamMember, type TeamMember } from '../services/data';

const ROLE_OPTIONS = [
  { value: 'vertrieb', label: 'Vertrieb', icon: User },
  { value: 'projektleiter', label: 'Projektleiter', icon: ClipboardList },
  { value: 'monteur', label: 'Monteur', icon: Wrench },
  { value: 'backoffice', label: 'Backoffice', icon: HardHat },
  { value: 'super_employee', label: 'Super-Mitarbeiter', icon: Shield },
];

const ROLE_ICONS: Record<string, React.ElementType> = {
  vertrieb: User,
  projektleiter: ClipboardList,
  monteur: Wrench,
  backoffice: HardHat,
  super_employee: Shield,
  installer: User,
};

const ROLE_LABELS: Record<string, string> = {
  owner: 'Inhaber',
  vertrieb: 'Vertrieb',
  projektleiter: 'Projektleiter',
  monteur: 'Monteur',
  backoffice: 'Backoffice',
  super_employee: 'Super-Mitarbeiter',
  installer: 'Installateur',
};

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['vertrieb']);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{
    email: string;
    password: string;
    role: string;
    name: string;
  } | null>(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) loadMembers();
  }, [user?.id]);

  async function loadMembers() {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTeamMembers(user.id);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    setUpdatingId(memberId);
    try {
      await updateTeamMemberRole(memberId, newRole);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm('Mitarbeiter wirklich aus dem Team entfernen?')) return;
    setRemovingId(memberId);
    try {
      await removeTeamMember(memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Entfernen');
    } finally {
      setRemovingId(null);
    }
  }

  function toggleRole(role: string) {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        // Don't allow unchecking the last role
        if (prev.length === 1) return prev;
        return prev.filter(r => r !== role);
      }
      return [...prev, role];
    });
  }

  function getEffectiveRole(roles: string[]): string {
    if (roles.length === 1) return roles[0];
    // Multiple roles → super_employee (combines all permissions)
    return 'super_employee';
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !inviteEmail.trim() || !inviteName.trim()) return;

    const email = inviteEmail.trim();
    const name = inviteName.trim();
    const effectiveRole = getEffectiveRole(selectedRoles);
    const tempPassword = generateTempPassword();

    setIsInviting(true);
    setInviteError(null);
    setInviteResult(null);

    try {
      // 1. Create auth user with random password
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: { full_name: name },
        },
      });

      if (signUpErr) {
        // User might already exist
        if (signUpErr.message?.toLowerCase().includes('already registered') ||
            signUpErr.message?.toLowerCase().includes('already exists')) {
          setInviteError('Diese E-Mail ist bereits registriert. Verwende stattdessen die "Bestehenden Nutzer zuweisen" Funktion (kommt bald).');
        } else {
          setInviteError(signUpErr.message);
        }
        setIsInviting(false);
        return;
      }

      const newUserId = signUpData.user?.id;
      if (!newUserId) {
        setInviteError('Nutzer konnte nicht erstellt werden. Bitte versuche es erneut.');
        setIsInviting(false);
        return;
      }

      // 2. Update profile with owner_id and role
      // Note: The trigger already created the profile, we just need to update it
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          owner_id: user.id,
          role: effectiveRole,
          full_name: name,
        })
        .eq('id', newUserId);

      if (updateErr) {
        // Rollback: delete the auth user if profile update fails
        // This requires admin API — for MVP we just show error
        setInviteError('Account erstellt, aber Team-Zuweisung fehlgeschlagen: ' + updateErr.message);
        setIsInviting(false);
        return;
      }

      // 3. Show success with credentials
      setInviteResult({
        email,
        password: tempPassword,
        role: effectiveRole,
        name,
      });

      await loadMembers();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Fehler beim Erstellen');
    } finally {
      setIsInviting(false);
    }
  }

  function handleCopy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function closeInvite() {
    setShowInvite(false);
    setInviteEmail('');
    setInviteName('');
    setSelectedRoles(['vertrieb']);
    setInviteError(null);
    setInviteResult(null);
    setShowPassword(false);
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  return (
    <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-white/5 bg-[#0F0F0F] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Team-Verwaltung</h1>
              <p className="text-xs text-gray-500">{members.length} Mitarbeiter</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] text-[#1A3A5C] rounded-xl text-sm font-bold hover:bg-[#E09000] transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Mitarbeiter einladen
            </button>
            <button
              onClick={loadMembers}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1A1A1A] border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 text-center">
              {error}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-500 mb-1">Noch keine Mitarbeiter</p>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Lade Mitarbeiter ein, damit sie Leads und Projekte verwalten können.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map(member => {
                const RoleIcon = ROLE_ICONS[member.role] || User;
                const isOwner = member.role === 'owner';
                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-4 bg-[#1A1A1A] border rounded-xl px-5 py-4 ${
                      isOwner ? 'border-[#F5A623]/20' : 'border-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isOwner ? 'bg-[#F5A623]/10' : 'bg-[#1A3A5C]'
                    }`}>
                      <RoleIcon className={`w-5 h-5 ${isOwner ? 'text-[#F5A623]' : 'text-[#F5A623]'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white truncate">{member.full_name || 'Unbekannt'}</p>
                        {isOwner && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5A623]/10 text-[#F5A623] font-bold">Inhaber</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {ROLE_LABELS[member.role] || member.role} · {member.email || 'Keine E-Mail'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Rolle ändern — Inhaber nicht änderbar */}
                      {isOwner ? (
                        <span className="text-xs text-gray-500 px-3 py-2">—</span>
                      ) : (
                        <div className="relative">
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            disabled={updatingId === member.id}
                            className="appearance-none bg-[#0F0F0F] border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623] disabled:opacity-50"
                          >
                            {ROLE_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}

                      {/* Entfernen — Inhaber nicht entfernbar */}
                      {isOwner ? (
                        <span className="w-9 h-9 flex items-center justify-center text-gray-600" title="Inhaber kann nicht entfernt werden">
                          <Crown className="w-4 h-4" />
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRemove(member.id)}
                          disabled={removingId === member.id}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          title="Aus Team entfernen"
                        >
                          {removingId === member.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Invite Modal */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { if (!isInviting && !inviteResult) closeInvite(); }}
        >
          <div
            className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-white/5 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#F5A623]" />
                </div>
                <h2 className="text-lg font-black text-white">Mitarbeiter einladen</h2>
              </div>
              <button
                onClick={closeInvite}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success State */}
            {inviteResult ? (
              <div className="px-6 py-6 space-y-5">
                <div className="flex items-center gap-3 text-emerald-400">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Account erstellt!</p>
                    <p className="text-sm text-gray-400">Teile diese Login-Daten mit dem Mitarbeiter.</p>
                  </div>
                </div>

                {/* Credentials Card */}
                <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">E-Mail</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <code className="flex-1 text-sm text-white font-mono">{inviteResult.email}</code>
                      <button
                        onClick={() => handleCopy(inviteResult.email, 'email')}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                      >
                        {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Temporäres Passwort</label>
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#F5A623]" />
                      <code className="flex-1 text-sm text-[#F5A623] font-mono">
                        {showPassword ? inviteResult.password : '••••••••••••'}
                      </code>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopy(inviteResult.password, 'password')}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                      >
                        {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Rolle</label>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#F5A623]" />
                      <span className="text-sm text-white">{ROLE_LABELS[inviteResult.role] || inviteResult.role}</span>
                      {selectedRoles.length > 1 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5A623]/10 text-[#F5A623]">
                          {selectedRoles.length} Rollen kombiniert
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-blue-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-0.5">Wichtig</p>
                    <p className="text-blue-300/80">Das Passwort wird nur jetzt angezeigt. Speichere es oder teile es sofort mit dem Mitarbeiter.</p>
                  </div>
                </div>

                <button
                  onClick={closeInvite}
                  className="w-full py-3 rounded-xl bg-[#F5A623] text-[#1A3A5C] text-sm font-bold hover:bg-[#E09000] transition-colors"
                >
                  Fertig
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleInvite} className="px-6 py-5 space-y-4">
                <p className="text-sm text-gray-400">
                  Erstelle einen neuen Account für den Mitarbeiter. Du erhältst die Login-Daten zum Kopieren.
                </p>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    placeholder="Max Mustermann"
                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">E-Mail</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="max@firma.de"
                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                    required
                  />
                </div>

                {/* Roles Multi-Select */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">
                    Rollen
                    <span className="text-[10px] font-normal text-gray-600 ml-1">(Mehrere möglich → Super-Mitarbeiter)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLE_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const isSelected = selectedRoles.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleRole(opt.value)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                            isSelected
                              ? 'bg-[#F5A623]/10 border-[#F5A623]/30 text-[#F5A623]'
                              : 'bg-[#0F0F0F] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected roles summary */}
                {selectedRoles.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Gewählt: {' '}
                    <span className="text-[#F5A623] font-bold">
                      {selectedRoles.map(r => ROLE_LABELS[r] || r).join(', ')}
                    </span>
                    {selectedRoles.length > 1 && (
                      <span className="text-gray-600 ml-1">→ wird als Super-Mitarbeiter gespeichert</span>
                    )}
                  </div>
                )}

                {inviteError && (
                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {inviteError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail.trim() || !inviteName.trim() || selectedRoles.length === 0}
                  className="w-full py-3 rounded-xl bg-[#F5A623] text-[#1A3A5C] text-sm font-bold hover:bg-[#E09000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isInviting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Account wird erstellt…
                    </span>
                  ) : (
                    'Account erstellen & Login-Daten anzeigen'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
