// PROJECT: Voltify | PURPOSE: Solar planning section card for Lead and Project detail pages
import { useState } from 'react';
import { Map, Pencil, Zap, FileImage } from 'lucide-react';
import InstallerPlanner from './InstallerPlanner';
import type { ModuleLayoutJson } from '../../types/solarPlanner';
import { updateLeadFields } from '../../services/data';

interface Props {
  leadId: string;
  leadName: string;
  kwp: number | null;
  roofAreaM2: number | null;
  orientation: string | null;
  zip: string | null;
  existingLayout: ModuleLayoutJson | null | undefined;
  onSaved?: (layout: ModuleLayoutJson) => void;
  /** Pass a planningPng data-URL to include in next PDF generation */
  onPdfReady?: (pngDataUrl: string) => void;
}

export default function SolarPlanningSection({
  leadId, leadName, kwp, roofAreaM2, orientation, zip,
  existingLayout, onSaved, onPdfReady,
}: Props) {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<ModuleLayoutJson | null | undefined>(existingLayout);

  const handleSave = async (newLayout: ModuleLayoutJson) => {
    await updateLeadFields(leadId, { module_layout: newLayout } as never);
    setLayout(newLayout);
    onSaved?.(newLayout);
    onPdfReady?.(newLayout.previewPng);
  };

  return (
    <>
      <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Solar-Planung</h2>
          {layout && (
            <span className="flex items-center gap-1 text-[11px] font-bold bg-[#F5A623]/10 text-[#F5A623] px-2.5 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              {layout.moduleCount} Module · {layout.kwp} kWp
            </span>
          )}
        </div>

        {!layout ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-14 h-14 rounded-xl bg-[#252525] flex items-center justify-center">
              <Map className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              Noch keine Planung erstellt. Öffne den Planer um das Dach auf dem Satellitenbild zu planen.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-[#1A3A5C] hover:bg-[#0F2440] text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
            >
              <Map className="w-4 h-4" />
              Planung starten
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-start">
            {/* Thumbnail */}
            {layout.previewPng ? (
              <img
                src={layout.previewPng}
                alt="Solar-Planung Vorschau"
                className="w-[88px] h-[88px] rounded-lg object-cover border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-[88px] h-[88px] rounded-lg bg-[#252525] border border-white/10 flex items-center justify-center shrink-0">
                <FileImage className="w-5 h-5 text-gray-600" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{layout.address}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {layout.roofAreaM2} m² · {layout.orientation} · {layout.moduleCount} × 400 Wp
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Gespeichert {new Date(layout.savedAt).toLocaleDateString('de-DE')}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setOpen(true)}
                  className="flex items-center gap-1.5 bg-[#252525] hover:bg-[#2E2E2E] border border-white/10 text-gray-300 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Bearbeiten
                </button>
                {layout.previewPng && (
                  <button
                    onClick={() => onPdfReady?.(layout.previewPng)}
                    className="flex items-center gap-1.5 bg-[#F5A623]/10 hover:bg-[#F5A623]/20 border border-[#F5A623]/20 text-[#F5A623] text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <FileImage className="w-3.5 h-3.5" /> In Angebot
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {open && (
        <InstallerPlanner
          leadId={leadId}
          leadName={leadName}
          kwp={kwp}
          roofAreaM2={roofAreaM2}
          orientation={orientation}
          zip={zip}
          onSave={handleSave}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
