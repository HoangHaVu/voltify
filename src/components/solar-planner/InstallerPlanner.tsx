// PROJECT: Voltify | PURPOSE: Installer Solar Planner modal — satellite view + module overlay canvas
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, MapPin, Zap, Loader2, AlertCircle, Save, Download, RotateCcw,
} from 'lucide-react';
import { geocodeAddress, type GeoCoords } from '../../services/geocoding';
import { calculateGrid } from '../../lib/moduleLayout';
import type { ModuleLayoutJson } from '../../types/solarPlanner';

interface Props {
  leadId: string;
  leadName: string;
  kwp: number | null;
  roofAreaM2: number | null;
  orientation: string | null;
  zip: string | null;
  onSave: (layout: ModuleLayoutJson) => Promise<void>;
  onClose: () => void;
}

type Status = 'idle' | 'geocoding' | 'drawing' | 'ready' | 'error';

const CANVAS_SIZE = 600;
const PREVIEW_SIZE = 120;
const MODULE_FILL = 'rgba(30, 90, 200, 0.72)';
const MODULE_STROKE = 'rgba(100, 180, 255, 0.9)';
const DOT_COLOR = 'rgba(255,255,255,0.85)';

function drawModules(
  ctx: CanvasRenderingContext2D,
  modules: ReturnType<typeof calculateGrid>['modulesPx'],
  scale: number = 1,
) {
  for (const m of modules) {
    const x = m.x * scale;
    const y = m.y * scale;
    const w = m.w * scale;
    const h = m.h * scale;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate((m.rotation * Math.PI) / 180);
    ctx.fillStyle = MODULE_FILL;
    ctx.strokeStyle = MODULE_STROKE;
    ctx.lineWidth = Math.max(0.8, scale);
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.fill();
    ctx.stroke();
    const dotR = Math.max(1.5, Math.min(3, w * 0.06));
    ctx.fillStyle = DOT_COLOR;
    ctx.beginPath();
    ctx.arc(0, 0, dotR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export default function InstallerPlanner({
  leadName, kwp, roofAreaM2, orientation, zip, onSave, onClose,
}: Props) {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zipInput, setZipInput] = useState(zip ?? '');
  const [moduleOverride, setModuleOverride] = useState<number | null>(null);
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasApiKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const safeKwp = kwp ?? 5.0;
  const safeArea = roofAreaM2 ?? 60;
  const safeOrientation = orientation ?? 'S';
  const layout = calculateGrid(safeKwp, safeArea, safeOrientation);
  const effectiveModuleCount = moduleOverride ?? layout.moduleCount;
  const effectiveKwp = ((effectiveModuleCount * 400) / 1000).toFixed(1);

  const buildMapUrl = useCallback((lat: number, lng: number) => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=20&size=640x640&maptype=satellite&key=${key}`;
  }, []);

  const renderCanvas = useCallback((imageUrl: string, coords: GeoCoords) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const currentLayout = calculateGrid(safeKwp, safeArea, safeOrientation);
      const modules = moduleOverride != null
        ? currentLayout.modulesPx.slice(0, moduleOverride)
        : currentLayout.modulesPx;

      // Scale from internal 640px coordinates to canvas display size
      const scale = CANVAS_SIZE / 640;
      drawModules(ctx, modules, scale);
      setStatus('ready');
    };
    img.onerror = () => {
      setErrorMsg('Satellitenbild konnte nicht geladen werden.');
      setStatus('error');
    };
    img.src = imageUrl;
  }, [safeKwp, safeArea, safeOrientation, moduleOverride]);

  // Re-draw when module count changes and we already have coords
  useEffect(() => {
    if (status === 'ready' && coords) {
      renderCanvas(buildMapUrl(coords.lat, coords.lng), coords);
    }
  }, [moduleOverride]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSatellite = async () => {
    if (!street.trim() || !zipInput.trim()) return;
    setStatus('geocoding');
    setErrorMsg('');
    try {
      const c = await geocodeAddress(street, zipInput, city || undefined);
      setCoords(c);
      setStatus('drawing');
      renderCanvas(buildMapUrl(c.lat, c.lng), c);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Adresse nicht gefunden');
      setStatus('error');
    }
  };

  const generatePreviewPng = (): string => {
    const offscreen = document.createElement('canvas');
    offscreen.width = PREVIEW_SIZE;
    offscreen.height = PREVIEW_SIZE;
    const ctx = offscreen.getContext('2d');
    if (!ctx || !canvasRef.current) return '';
    ctx.drawImage(canvasRef.current, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    return offscreen.toDataURL('image/png');
  };

  const handleSave = async () => {
    if (!coords) return;
    setIsSaving(true);
    try {
      const currentLayout = calculateGrid(safeKwp, safeArea, safeOrientation);
      const modules = moduleOverride != null
        ? currentLayout.modulesPx.slice(0, moduleOverride)
        : currentLayout.modulesPx;

      const layout: ModuleLayoutJson = {
        address: city ? `${street}, ${zipInput} ${city}` : `${street}, ${zipInput}`,
        coords,
        kwp: parseFloat(effectiveKwp),
        moduleCount: effectiveModuleCount,
        roofAreaM2: safeArea,
        orientation: safeOrientation,
        modules,
        previewPng: generatePreviewPng(),
        savedAt: new Date().toISOString(),
      };
      await onSave(layout);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `solar-planung-${leadName.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  const handleReset = () => {
    setModuleOverride(null);
    setCoords(null);
    setStatus('idle');
    setErrorMsg('');
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-lg">Solar-Planung</h2>
            <p className="text-gray-400 text-xs mt-0.5">{leadName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row gap-0 overflow-hidden flex-1 min-h-0">

          {/* Left — Controls */}
          <div className="lg:w-72 shrink-0 p-5 flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto">

            {/* Address */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Adresse</p>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Straße & Hausnr."
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="PLZ"
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                  />
                  <input
                    type="text"
                    placeholder="Ort (opt.)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                  />
                </div>
                <button
                  onClick={loadSatellite}
                  disabled={!street.trim() || !zipInput.trim() || status === 'geocoding' || !hasApiKey}
                  className="flex items-center justify-center gap-2 bg-[#1A3A5C] hover:bg-[#0F2440] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
                >
                  {status === 'geocoding' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Lädt…</>
                  ) : (
                    <><MapPin className="w-4 h-4" /> Satellitenbild laden</>
                  )}
                </button>
                {!hasApiKey && (
                  <p className="text-[11px] text-amber-400">VITE_GOOGLE_MAPS_API_KEY fehlt</p>
                )}
              </div>
            </div>

            {/* System data */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Anlage</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Dachfläche</span>
                  <span className="text-white font-medium">{safeArea} m²</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ausrichtung</span>
                  <span className="text-white font-medium">{safeOrientation}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Leistung</span>
                  <span className="text-[#F5A623] font-bold">{effectiveKwp} kWp</span>
                </div>
              </div>
            </div>

            {/* Module count slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Module</p>
                <span className="text-white text-sm font-bold">{effectiveModuleCount}</span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(effectiveModuleCount + 10, 50)}
                value={effectiveModuleCount}
                onChange={(e) => setModuleOverride(Number(e.target.value))}
                className="w-full accent-[#F5A623]"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                <span>1</span>
                <span>{Math.max(effectiveModuleCount + 10, 50)}</span>
              </div>
            </div>

            {/* Status messages */}
            {status === 'error' && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{errorMsg}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-auto pt-2">
              <button
                onClick={handleSave}
                disabled={status !== 'ready' || isSaving}
                className="flex items-center justify-center gap-2 bg-[#F5A623] hover:bg-[#E09000] disabled:opacity-40 disabled:cursor-not-allowed text-[#1A3A5C] font-bold text-sm rounded-lg px-4 py-2.5 transition-colors"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Planung speichern
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportPng}
                  disabled={status !== 'ready'}
                  className="flex items-center justify-center gap-1.5 bg-[#1A1A1A] hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 text-gray-300 text-xs font-medium rounded-lg px-3 py-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> PNG
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 text-gray-300 text-xs font-medium rounded-lg px-3 py-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right — Canvas */}
          <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] relative min-h-0 p-4">
            {(status === 'idle' || status === 'error') && !coords && (
              <div className="flex flex-col items-center gap-3 text-center">
                <MapPin className="w-12 h-12 text-gray-700" />
                <p className="text-gray-500 text-sm max-w-xs">
                  Adresse eingeben und Satellitenbild laden, um die Planung zu starten.
                </p>
              </div>
            )}

            {status === 'geocoding' && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
                <p className="text-gray-400 text-sm">Koordinaten werden abgerufen…</p>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="rounded-xl max-w-full max-h-full"
              style={{
                display: status === 'ready' || status === 'drawing' ? 'block' : 'none',
                aspectRatio: '1 / 1',
              }}
            />

            {/* Badge overlay */}
            {status === 'ready' && (
              <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-[#1A3A5C]/90 backdrop-blur-sm text-white rounded-full px-3 py-1.5 border border-white/10">
                <Zap className="w-3.5 h-3.5 text-[#F5A623]" />
                <span className="text-xs font-bold">{effectiveModuleCount} Module · {effectiveKwp} kWp</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
