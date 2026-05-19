import { useState, useEffect } from 'react';
import { Webhook, CheckCircle, XCircle, Loader2, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const CRM_TEMPLATES = [
  { name: 'Zapier', icon: '⚡', description: 'Verbinde mit 5.000+ Apps — HubSpot, Pipedrive, Salesforce, Gmail u.v.m.', hint: 'Webhook-URL aus dem Zapier-Trigger "Webhooks by Zapier" kopieren.' },
  { name: 'HubSpot', icon: '🟠', description: 'Lead direkt als Kontakt + Deal in HubSpot anlegen.', hint: 'Nutze den HubSpot Workflow → Webhook-Schritt oder Zapier als Brücke.' },
  { name: 'Pipedrive', icon: '🟢', description: 'Lead als Person + Deal mit Score im Pipedrive anlegen.', hint: 'Pipedrive → Automatisierungen → Webhook-Auslöser aktivieren.' },
  { name: 'Make (Integromat)', icon: '🔵', description: 'Flexibler als Zapier, günstiger für mehrere Leads/Monat.', hint: 'Make-Szenario → Webhook-Modul → URL kopieren.' },
];

const PAYLOAD_EXAMPLE = JSON.stringify({
  event: 'lead.new',
  timestamp: '2026-05-02T10:00:00.000Z',
  lead: {
    id: 'uuid-123',
    name: 'Max Mustermann',
    email: 'max@example.de',
    phone: '+49 160 1234567',
    zip: '80331',
    kwp: 9.5,
    investment: 17100,
    annual_savings: 1420,
    amortization: 12,
    autarky: 72,
    score: 84,
    score_tier: 'heiss',
  },
}, null, 2);

export function WebhookSettingsSection() {
  const { user } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    supabase
      .from('company_webhook_settings')
      .select('webhook_url, webhook_secret, webhook_active')
      .eq('owner_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (data && !error) {
          setWebhookUrl(data.webhook_url || '');
          setWebhookSecret(data.webhook_secret || '');
          setIsActive(data.webhook_active || false);
        }
        setIsLoading(false);
      });
  }, [user?.id]);

  async function save() {
    if (!user?.id) return;
    setIsSaving(true);
    setSaveStatus('idle');

    const { error } = await supabase
      .from('company_webhook_settings')
      .upsert({
        owner_id: user.id,
        webhook_url: webhookUrl || null,
        webhook_secret: webhookSecret || null,
        webhook_active: isActive,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'owner_id' });

    setSaveStatus(error ? 'error' : 'success');
    setIsSaving(false);
    if (!error) setTimeout(() => setSaveStatus('idle'), 3000);
  }

  async function testWebhook() {
    if (!webhookUrl) return;
    setIsTesting(true);
    setTestStatus('idle');
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookSecret ? { 'X-Voltify-Signature': 'sha256=test' } : {}),
        },
        body: JSON.stringify({
          event: 'lead.test',
          timestamp: new Date().toISOString(),
          lead: { id: 'test-123', name: 'Test Lead', email: 'test@example.de', phone: '+49 160 1234567', zip: '80331', kwp: 9.5, investment: 17100, annual_savings: 1420, score: 84 },
        }),
      });
      setTestStatus(res.ok ? 'success' : 'error');
    } catch {
      setTestStatus('error');
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestStatus('idle'), 4000);
    }
  }

  function copyPayload() {
    navigator.clipboard.writeText(PAYLOAD_EXAMPLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Webhook-Konfiguration */}
      <section className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <Webhook className="w-5 h-5 text-[#F5A623]" />
          <h3 className="font-bold text-white text-lg">CRM-Webhook</h3>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-[#F5A623]/10 text-[#F5A623]">PRIO</span>
        </div>
        <div className="px-6 py-6 space-y-6">
          <p className="text-sm text-gray-400">
            Jeder neue Lead wird automatisch als JSON-Payload an deine Webhook-URL gesendet —
            kompatibel mit <strong className="text-white">Zapier, Make, HubSpot, Pipedrive</strong> und jedem eigenen System.
          </p>

          <div className="flex items-center justify-between p-4 bg-[#0F0F0F] rounded-xl border border-white/5">
            <div>
              <p className="font-semibold text-white text-sm">Webhook aktiv</p>
              <p className="text-xs text-gray-500 mt-0.5">Leads werden automatisch weitergeleitet</p>
            </div>
            <button onClick={() => setIsActive(!isActive)} className={`relative w-12 h-6 rounded-full overflow-hidden transition-colors ${isActive ? 'bg-[#F5A623]' : 'bg-gray-700'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-300">Webhook-URL</label>
            <input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-300">Webhook-Secret <span className="text-gray-500 font-normal">(optional)</span></label>
            <div className="relative">
              <input type={showSecret ? 'text' : 'password'} value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)} placeholder="Geheimer Schlüssel für HMAC-SHA256-Signatur"
                className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]" />
              <button onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Falls gesetzt, signieren wir jeden Request mit <code className="bg-[#0F0F0F] px-1 rounded text-gray-400">X-Voltify-Signature: sha256=…</code></p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={save} disabled={isSaving} className="flex items-center justify-center gap-2 bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#1A3A5C] font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSaving ? 'Speichern…' : 'Einstellungen speichern'}
            </button>
            <button onClick={testWebhook} disabled={isTesting || !webhookUrl} className="flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Webhook className="w-4 h-4" />}
              {isTesting ? 'Wird gesendet…' : 'Test-Webhook senden'}
            </button>
            {saveStatus !== 'idle' && (
              <span className={`flex items-center gap-1.5 text-sm font-semibold ${saveStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {saveStatus === 'success' ? <><CheckCircle className="w-4 h-4" /> Gespeichert</> : <><XCircle className="w-4 h-4" /> Fehler</>}
              </span>
            )}
            {testStatus !== 'idle' && (
              <span className={`flex items-center gap-1.5 text-sm font-semibold ${testStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {testStatus === 'success' ? <><CheckCircle className="w-4 h-4" /> Test erfolgreich</> : <><XCircle className="w-4 h-4" /> Test fehlgeschlagen</>}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Payload-Vorschau */}
      <section className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h3 className="font-bold text-white text-lg">Payload-Format (JSON)</h3>
          <button onClick={copyPayload} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
            <Copy className="w-4 h-4" /> {copied ? 'Kopiert!' : 'Kopieren'}
          </button>
        </div>
        <pre className="px-6 py-5 text-xs text-gray-400 bg-[#0F0F0F] overflow-x-auto leading-relaxed font-mono">{PAYLOAD_EXAMPLE}</pre>
      </section>

      {/* CRM-Templates */}
      <section className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5">
          <h3 className="font-bold text-white text-lg">Integrationen</h3>
          <p className="text-sm text-gray-500 mt-1">Kompatible Systeme — Webhook-URL aus dem jeweiligen Tool einfügen</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CRM_TEMPLATES.map(t => (
            <div key={t.name} className="border border-white/5 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2"><span className="text-xl">{t.icon}</span><span className="font-bold text-white">{t.name}</span></div>
              <p className="text-xs text-gray-400">{t.description}</p>
              <p className="text-xs text-gray-600 italic">{t.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Retry-Hinweis */}
      <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-5 py-4">
        <ExternalLink className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-400/80">
          <strong>Retry-Logik:</strong> Bei einem fehlgeschlagenen Webhook-Aufruf wird der Request automatisch <strong className="text-amber-400">3× wiederholt</strong> (nach 1 s, 2 s, 4 s Backoff). Alle Versuche werden im Webhook-Log protokolliert.
        </div>
      </div>
    </div>
  );
}
