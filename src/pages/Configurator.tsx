import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import SEO from '../components/seo/SEO';
import DemoBanner from '../components/layout/DemoBanner';
import { submitLead } from '../services/leads';
import { calculateROI } from '../lib/calculations';
import { trackFunnelEvent, getFunnelSource } from '../lib/funnelTracking';
import { supabase } from '../lib/supabase';
import { useTenantBranding } from '../hooks/useTenantBranding';
import Step0_EmailGate from '../sections/configurator/Step0_EmailGate';
import Step1_Building from '../sections/configurator/Step1_Building';
import Step2_Roof from '../sections/configurator/Step2_Roof';
import Step3_Consumption from '../sections/configurator/Step3_Consumption';
import Step5_Options from '../sections/configurator/Step5_Options';
import Step4_Storage from '../sections/configurator/Step4_Storage';
import Step6_Subsidies from '../sections/configurator/Step6_Subsidies';
import Step7_Analysis from '../sections/configurator/Step7_Analysis';
import Step8_Contact from '../sections/configurator/Step8_Contact';
import Step9_ThankYou from '../sections/configurator/Step9_ThankYou';

export interface WizardData {
  buildingType: string;
  ownership: string;
  roofTilt: number;
  roofOrientation: string;
  roofArea: string;
  shading: string;
  consumption: string;
  consumptionMethod: 'upload' | 'manual' | 'preset';
  storageSize: string;
  wallbox: boolean;
  futureCar: boolean;
  heatPump: boolean;
  backupPower: boolean;
  energyApp: boolean;
  electricityPrice: string;
  constructionYear: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zipCode: string;
  city: string;
  company: string;
  privacyConsent: boolean;
}

const initialData: WizardData = {
  buildingType: '',
  ownership: '',
  roofTilt: 30,
  roofOrientation: 'S',
  roofArea: '',
  shading: 'none',
  consumption: '',
  consumptionMethod: 'manual',
  storageSize: '10',
  wallbox: false,
  futureCar: false,
  heatPump: false,
  backupPower: false,
  energyApp: false,
  electricityPrice: '0.32',
  constructionYear: 'after2010',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  zipCode: '',
  city: '',
  company: '',
  privacyConsent: false,
};

const steps = [
  { id: 1, label: 'Gebäude & Eigentum', icon: '🏠' },
  { id: 2, label: 'Dach konfigurieren', icon: '🏗️' },
  { id: 3, label: 'Stromverbrauch', icon: '⚡' },
  { id: 4, label: 'Ausstattung & Pläne', icon: '🔧' },
  { id: 5, label: 'Speicher wählen', icon: '🔋' },
  { id: 6, label: 'Förderungen', icon: '💰' },
  { id: 7, label: 'Wirtschaftlichkeit', icon: '📊' },
  { id: 8, label: 'Kontaktdaten', icon: '📝' },
  { id: 9, label: 'Fertig', icon: '✅' },
];

export default function Configurator() {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === '1';
  const branding = useTenantBranding();

  const [gateCleared, setGateCleared] = useState(isDemo);
  const [currentStep, setCurrentStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  // Tracking: Session starten sobald Gate cleared ist
  useEffect(() => {
    if (!gateCleared) return;
    trackFunnelEvent(1, 'started', { demoMode: isDemo });
  }, [gateCleared, isDemo]);

  const updateData = (partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const goNext = () => {
    if (currentStep < 9) {
      setCurrentStep((s) => {
        const next = s + 1;
        setMaxVisitedStep((m) => Math.max(m, next));
        trackFunnelEvent(next, 'step_reached', { demoMode: isDemo });
        return next;
      });
    }
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const goToStep = (step: number) => {
    if (step <= maxVisitedStep) setCurrentStep(step);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const calc = calculateROI(data);
      // Speichere effectiveInvestment (nach Förderungen) als investment in der DB
      const dbCalc = {
        ...calc,
        investment: calc.effectiveInvestment || calc.investment,
      };

      // Agency-Slug aus Funnel-Cache auflösen → agency_id für Lead-Attribution
      let agencyId: string | undefined;
      const { agencySlug } = getFunnelSource();
      if (agencySlug && !isDemo) {
        const { data: resolvedId } = await supabase.rpc('resolve_agency_slug', { p_slug: agencySlug });
        agencyId = resolvedId ?? undefined;
      }

      await submitLead(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          wantsZoomCall: false,
        },
        {
          zip: data.zipCode,
          buildingType: data.buildingType,
          ownership: data.ownership,
          roofTilt: data.roofTilt,
          roofOrientation: data.roofOrientation,
          roofArea: Number(data.roofArea) || 0,
          shading: data.shading,
          consumption: Number(data.consumption) || 0,
          consumptionMethod: data.consumptionMethod,
          householdSize: '',
          storageSize: Number(data.storageSize) || 0,
          wallbox: data.wallbox,
          backupPower: data.backupPower,
          energyApp: data.energyApp,
          electricityPrice: Number(data.electricityPrice) || 0.32,
          constructionYear: data.constructionYear,
          futureCar: data.futureCar,
          heatPump: data.heatPump,
        },
        dbCalc,
        undefined,  // installerId
        agencyId,
      );
      trackFunnelEvent(9, 'completed', { demoMode: isDemo });

      // Scoutly-Conversion-Webhook: nur bei echten Leads (kein Demo) mit sl_lead-Param
      const webhookUrl = import.meta.env.VITE_SCOUTLY_WEBHOOK_URL;
      const { sourceId, utmSource, utmCampaign } = getFunnelSource();
      if (webhookUrl && sourceId && !isDemo) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sl_lead_id:   sourceId,
            utm_source:   utmSource,
            utm_campaign: utmCampaign,
            email:        data.email,
            first_name:   data.firstName,
            last_name:    data.lastName,
            event:        'voltify_conversion',
            converted_at: new Date().toISOString(),
          }),
        }).catch(() => {}); // silent — Webhook-Fehler darf nichts blockieren
      }

      setCurrentStep(9);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Übermittlung fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Key für Step7, der sich bei jeder Datenänderung ändert
  // damit React die Analyse-Komponente komplett neu mountet
  const analysisKey = `step7-${data.consumption}-${data.roofArea}-${data.storageSize}-${data.zipCode}-${data.ownership}-${data.wallbox}-${data.futureCar}-${data.heatPump}-${data.backupPower}-${data.energyApp}-${data.shading}-${data.roofOrientation}-${data.roofTilt}-${data.electricityPrice}-${data.constructionYear}`;

  const renderStep = () => {
    const props = { data, updateData };
    switch (currentStep) {
      case 1: return <Step1_Building {...props} />;
      case 2: return <Step2_Roof {...props} />;
      case 3: return <Step3_Consumption {...props} />;
      case 4: return <Step5_Options {...props} />;
      case 5: return <Step4_Storage {...props} />;
      case 6: return <Step6_Subsidies {...props} />;
      case 7: return <Step7_Analysis key={analysisKey} {...props} onNext={goNext} />;
      case 8: return <Step8_Contact {...props} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitError={submitError} companyName={branding.firmenname} />;
      case 9: return <Step9_ThankYou demoMode={isDemo} />;
      default: return null;
    }
  };

  const handleGateSubmit = (firstName: string, email: string) => {
    updateData({ firstName, email });
    trackFunnelEvent(0, 'email_captured', { email, demoMode: false });
    setGateCleared(true);
  };

  const handleGateSkip = () => {
    trackFunnelEvent(0, 'skipped_gate', { demoMode: false });
    setGateCleared(true);
  };

  if (!gateCleared) {
    return <Step0_EmailGate onSubmit={handleGateSubmit} onSkip={handleGateSkip} branding={branding} />;
  }

  return (
    <>
      <SEO
        title="Solar-Konfigurator"
        description="Konfigurieren Sie Ihre Photovoltaik-Anlage in 9 Schritten. Inkl. ROI-Berechnung, Förderungen und persönlichem Angebot."
        canonical="/konfigurator"
        noindex
      />
      <div className="min-h-screen flex flex-col">
      {/* Demo-Modus-Banner — nur bei ?demo=1 (Installateur-Preview) */}
      {isDemo && <DemoBanner label="Demo-Modus — so konfigurieren deine Kunden ihre Solaranlage" />}
      <div className="flex flex-1 min-h-0">
      {/* LEFT - Sidebar */}
      <div
        className="hidden lg:flex lg:w-[320px] xl:w-[360px] flex-col text-white relative overflow-hidden"
        style={{ backgroundColor: branding.primaryColor }}
      >
        {/* Decorative bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40" />

        <div className="relative z-10 p-8 flex flex-col h-full">
          {/* Logo / Firmenname */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-10">
            {branding.isTenant && branding.logoDataUrl ? (
              <img src={branding.logoDataUrl} alt={branding.firmenname} className="h-8 object-contain" />
            ) : (
              <>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: branding.accentColor }}
                >
                  <Zap className="w-4 h-4" style={{ color: branding.primaryColor }} fill="currentColor" />
                </div>
                <span className="text-lg font-medium">{branding.firmenname}</span>
              </>
            )}
            {branding.isTenant && !branding.logoDataUrl && (
              <span className="text-lg font-medium">{branding.firmenname}</span>
            )}
          </button>

          {/* Steps Timeline */}
          <div className="flex-1">
            <p className="text-xs text-white/50 uppercase tracking-widest mb-6">Konfigurator</p>
            <div className="flex flex-col gap-1">
              {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const isClickable = step.id <= maxVisitedStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => isClickable && goToStep(step.id)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-white/10'
                        : isClickable
                        ? 'hover:bg-white/5'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {/* Step number / check */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-[#F5A623] text-[#1A3A5C]'
                          : isActive
                          ? 'bg-white text-[#1A3A5C]'
                          : 'bg-white/20 text-white/60'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                    </div>
                    {/* Label */}
                    <span
                      className={`text-sm ${
                        isActive ? 'font-medium text-white' : 'text-white/60'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between text-xs text-white/50 mb-2">
              <span>Fortschritt</span>
              <span>{Math.round((currentStep / 9) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 9) * 100}%`, backgroundColor: branding.accentColor }}
              />
            </div>
            {branding.isTenant && branding.poweredByVoltify && (
              <p className="text-[10px] text-white/20 mt-4 text-center">Powered by Voltify</p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT - Content Area */}
      <div className="flex-1 relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/configurator-bg.jpg"
            alt="Solar houses"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Mobile Step Header */}
          <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              {branding.isTenant && branding.logoDataUrl ? (
                <img src={branding.logoDataUrl} alt={branding.firmenname} className="h-6 object-contain" />
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: branding.accentColor }}>
                    <Zap className="w-3.5 h-3.5" style={{ color: branding.primaryColor }} fill="currentColor" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: branding.primaryColor }}>{branding.firmenname}</span>
                </>
              )}
              {branding.isTenant && !branding.logoDataUrl && (
                <span className="text-sm font-medium" style={{ color: branding.primaryColor }}>{branding.firmenname}</span>
              )}
            </button>
            <span className="text-xs text-gray-500">
              Schritt {currentStep} / 9
            </span>
          </div>

          {/* Mobile Progress */}
          <div className="lg:hidden w-full h-1 bg-gray-100">
            <div
              className="h-full bg-[#F5A623] transition-all duration-500"
              style={{ width: `${(currentStep / 9) * 100}%` }}
            />
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-16 py-8 md:py-12">
            <div className="max-w-[680px] mx-auto">
              {renderStep()}
            </div>
          </div>

          {/* Navigation Buttons */}
          {currentStep < 8 && (
            <div className="px-6 md:px-12 lg:px-16 py-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
              <div className="max-w-[680px] mx-auto flex items-center justify-between">
                <button
                  onClick={goBack}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentStep === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-[#1A3A5C] hover:bg-[#1A3A5C]/5'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </button>

                {currentStep === 6 ? (
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="flex items-center gap-2 bg-[#F5A623] text-[#1A3A5C] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#E09000] transition-all"
                  >
                    Individuelles Angebot anfordern
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : currentStep < 6 && maxVisitedStep >= 6 ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goNext}
                      className="flex items-center gap-2 bg-[#1A3A5C] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#0F2440] transition-all"
                    >
                      Weiter
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentStep(6)}
                      className="flex items-center gap-2 bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#F5A623] px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#F5A623]/20 transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      Zur Analyse
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={goNext}
                    className="flex items-center gap-2 bg-[#1A3A5C] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#0F2440] transition-all"
                  >
                    Weiter
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
    </>
  );
}
