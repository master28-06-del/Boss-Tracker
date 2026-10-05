import L from 'leaflet';
import { BossDefinition, KillRecord, ChannelId, BossStatus } from '../../types';

// Coordinate conversions between Metin2/SVG plane (0..1000 with (0,0) at top-left)
// and Leaflet CRS.Simple (where latitude 0 is at bottom and latitude 1000 is at top)
export const toLatLng = (x: number, y: number): [number, number] => [1000 - y, x];

export const fromLatLng = (latlng: L.LatLng): { x: number; y: number } => ({
  x: Math.round(Math.max(0, Math.min(1000, latlng.lng))),
  y: Math.round(Math.max(0, Math.min(1000, 1000 - latlng.lat))),
});

export const formatSeconds = (sec: number): string => {
  if (sec <= 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export interface BossMarkerRenderData {
  boss: BossDefinition;
  record: KillRecord | undefined;
  status: BossStatus;
  remainingSeconds: number;
  statusText: string;
  selectedChannel: ChannelId;
  respawnMinutes: number;
  isAdmin: boolean;
}

export const createBossMarkerHtml = (data: BossMarkerRenderData): string => {
  const { boss, status, remainingSeconds, selectedChannel } = data;

  let statusColor = '#10b981'; // green alive
  let ringGlow = 'ring-emerald-500/50 shadow-emerald-500/30';

  if (status === 'dead') {
    statusColor = '#ef4444'; // red dead
    ringGlow = 'ring-rose-500/50 shadow-rose-500/30';
  } else if (status === 'imminent') {
    statusColor = '#f59e0b'; // amber window
    ringGlow = 'ring-amber-500/50 shadow-amber-500/30 animate-pulse';
  }

  return `
    <div class="relative group cursor-pointer select-none" id="marker-boss-${boss.id}">
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#161b26] border-2 shadow-lg ${ringGlow} transform transition-all duration-200 group-hover:scale-125" style="border-color: ${statusColor}">
        <span class="text-xs font-black text-amber-300 font-mono">${boss.level}</span>
      </div>
      <!-- Channel indicator pill -->
      <div class="absolute -top-2 -right-2 px-1 py-0.5 rounded text-[9px] font-bold bg-[#0f172a] text-amber-400 border border-amber-500/40 leading-none">
        CH${selectedChannel}
      </div>
      <!-- Label below marker -->
      <div class="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-black/90 text-[11px] font-medium text-gray-200 border border-gray-700/80 pointer-events-none shadow-md">
        <span class="text-amber-300 font-bold">${boss.name}</span>
        ${
          status !== 'alive'
            ? `<span class="ml-1.5 font-mono text-[10px] text-rose-300 font-bold marker-countdown" data-boss-id="${boss.id}">${formatSeconds(
                remainingSeconds
              )}</span>`
            : ''
        }
      </div>
    </div>
  `;
};

export const createBossPopupHtml = (
  data: BossMarkerRenderData,
  coords: { x: number; y: number }
): string => {
  const { boss, record, remainingSeconds, statusText, status, selectedChannel, respawnMinutes, isAdmin } = data;

  let statusBg = 'bg-emerald-500';
  if (status === 'dead') {
    statusBg = 'bg-rose-600';
  } else if (status === 'imminent') {
    statusBg = 'bg-amber-500';
  }

  return `
    <div class="p-3.5 min-w-[250px] text-gray-200 bg-[#141824] border border-gray-700/80 rounded-xl shadow-2xl" id="popup-content-${boss.id}">
      <div class="flex items-start justify-between gap-2 border-b border-gray-700/80 pb-2">
        <div>
          <div class="text-[10px] uppercase tracking-wider text-amber-400 font-bold font-mono">POZIOM ${boss.level} • CH${selectedChannel}</div>
          <h4 class="font-bold text-base text-gray-100 font-metin">${boss.name}</h4>
        </div>
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${statusBg}">
          ${statusText}
        </span>
      </div>

      <div class="py-2.5 space-y-1.5 text-xs">
        <div class="flex items-center justify-between text-gray-400">
          <span>Współrzędne:</span>
          <span class="font-mono text-gray-200 font-semibold">X: ${coords.x}, Y: ${coords.y}</span>
        </div>
        <div class="flex items-center justify-between text-gray-400">
          <span>Czas odrodzenia:</span>
          <span class="font-mono text-amber-300 font-bold">${respawnMinutes} min</span>
        </div>
        ${
          record
            ? `
          <div class="flex items-center justify-between text-gray-400">
            <span>Zbity przez:</span>
            <span class="text-gray-300 font-medium">${record.killedBy}</span>
          </div>
          <div class="flex items-center justify-between text-gray-400">
            <span>Pozostały czas:</span>
            <span class="font-mono font-bold text-rose-400 text-sm popup-countdown" data-boss-id="${boss.id}">${formatSeconds(remainingSeconds)}</span>
          </div>
        `
            : ''
        }
      </div>

      <!-- Actions -->
      <div class="pt-2 border-t border-gray-700/80 space-y-1.5">
        <div class="flex items-center gap-1.5">
          <button
            id="btn-kill-${boss.id}"
            class="flex-1 py-1.5 px-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <span>${record ? 'ZBIJ PONOWNIE' : 'OZNACZ JAKO ZBITY'}</span>
          </button>

          ${
            record && isAdmin
              ? `
            <button
              id="btn-reset-${boss.id}"
              class="py-1.5 px-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 font-medium text-xs rounded-lg transition-colors cursor-pointer"
              title="Zresetuj licznik do stanu żywy"
            >
              Reset
            </button>
          `
              : ''
          }
        </div>

        <button
          id="btn-info-${boss.id}"
          class="w-full py-1 px-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs rounded border border-gray-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>Szczegóły & Drop Przedmiotów</span>
        </button>
      </div>
    </div>
  `;
};
