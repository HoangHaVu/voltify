// PROJECT: Voltify | PURPOSE: Pure module-grid layout calculation for Solar Planner

export interface ModulePosition {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}

export interface ModuleLayout {
  moduleCount: number;
  rows: number;
  cols: number;
  moduleW: number;
  moduleH: number;
  modulesPx: ModulePosition[];
}

const MODULE_WP = 400;
const MODULE_W_M = 1.755; // meters (landscape)
const MODULE_H_M = 1.038; // meters

const CANVAS_SIZE = 640;
const USABLE_FRACTION = 0.65; // 65% of canvas used for the grid

export function calculateGrid(
  kwp: number,
  roofAreaM2: number,
  _orientation: string
): ModuleLayout {
  const safeKwp = Math.max(0.1, kwp);
  const safeArea = Math.max(1, roofAreaM2);

  const moduleCount = Math.max(1, Math.round((safeKwp * 1000) / MODULE_WP));

  // Grid shape: cols:rows ≈ module aspect ratio for a compact rectangular grid
  const aspectRatio = MODULE_W_M / MODULE_H_M; // ≈ 1.69
  const cols = Math.max(1, Math.ceil(Math.sqrt(moduleCount * aspectRatio)));
  const rows = Math.max(1, Math.ceil(moduleCount / cols));

  // Map roofArea to pixel scale: usable canvas area corresponds to roofArea
  const usablePx = CANVAS_SIZE * USABLE_FRACTION;
  const pxPerM = usablePx / Math.sqrt(safeArea);

  const moduleW = Math.max(8, Math.round(MODULE_W_M * pxPerM));
  const moduleH = Math.max(5, Math.round(MODULE_H_M * pxPerM));
  const gap = Math.max(1, Math.round(moduleW * 0.04));

  const gridW = cols * (moduleW + gap) - gap;
  const gridH = rows * (moduleH + gap) - gap;
  const startX = Math.round((CANVAS_SIZE - gridW) / 2);
  const startY = Math.round((CANVAS_SIZE - gridH) / 2);

  const modulesPx: ModulePosition[] = [];
  let placed = 0;

  for (let r = 0; r < rows && placed < moduleCount; r++) {
    for (let c = 0; c < cols && placed < moduleCount; c++) {
      modulesPx.push({
        x: startX + c * (moduleW + gap),
        y: startY + r * (moduleH + gap),
        w: moduleW,
        h: moduleH,
        rotation: 0,
      });
      placed++;
    }
  }

  return { moduleCount, rows, cols, moduleW, moduleH, modulesPx };
}
