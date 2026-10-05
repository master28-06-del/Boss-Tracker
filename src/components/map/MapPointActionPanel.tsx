import React from 'react';
import { Coordinates, BossDefinition } from '../../types';
import { X, Flame, Check } from 'lucide-react';

interface MapPointActionPanelProps {
  activeClickPoint: Coordinates;
  selectedChannel: number;
  mapBosses: BossDefinition[];
  selectedBossToKill: string;
  onSelectBossToKill: (bossId: string) => void;
  onQuickKill: () => void;
  customMarkerTitle: string;
  onChangeCustomMarkerTitle: (title: string) => void;
  customMarkerNotes: string;
  onChangeCustomMarkerNotes: (notes: string) => void;
  customMarkerColor: string;
  onChangeCustomMarkerColor: (color: string) => void;
  isSavingMarker: boolean;
  onSaveCustomMarker: () => void;
  actionSuccessMsg: string | null;
  onClose: () => void;
}

const MARKER_COLORS = [
  { color: '#38bdf8', label: 'Cyan' },
  { color: '#fbbf24', label: 'Złoty' },
  { color: '#34d399', label: 'Szmaragd' },
  { color: '#f43f5e', label: 'Rubin' },
  { color: '#c084fc', label: 'Ametyst' },
];

export const MapPointActionPanel: React.FC<MapPointActionPanelProps> = ({
  activeClickPoint,
  selectedChannel,
  mapBosses,
  selectedBossToKill,
  onSelectBossToKill,
  onQuickKill,
  customMarkerTitle,
  onChangeCustomMarkerTitle,
  customMarkerNotes,
  onChangeCustomMarkerNotes,
  customMarkerColor,
  onChangeCustomMarkerColor,
  isSavingMarker,
  onSaveCustomMarker,
  actionSuccessMsg,
  onClose,
}) => {
  return (
    <div
      id="map-click-context-panel"
      className="absolute top-3 right-16 z-[450] w-80 max-w-[calc(100%-24px)] bg-[#121622]/95 backdrop-blur-md border border-amber-500/50 rounded-xl shadow-2xl p-4 text-xs pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold text-gray-100 font-metin text-sm">Współrzędne kliknięcia</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between bg-[#0a0d14] px-3 py-1.5 rounded-lg border border-gray-800 font-mono mb-3">
        <span className="text-gray-400">Punkt:</span>
        <span className="text-amber-300 font-bold">
          X: {activeClickPoint.x}, Y: {activeClickPoint.y}
        </span>
        <span className="text-gray-500 text-[11px]">CH{selectedChannel}</span>
      </div>

      {actionSuccessMsg ? (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Boss Kill Action */}
          {mapBosses.length > 0 ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block font-mono">
                Zarejestruj zbicie bossa w tym miejscu:
              </label>
              <select
                value={selectedBossToKill}
                onChange={(e) => onSelectBossToKill(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#0a0d14] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-amber-500"
              >
                {mapBosses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (LVL {b.level})
                  </option>
                ))}
              </select>
              <button
                onClick={onQuickKill}
                className="w-full mt-1 py-1.5 px-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Flame className="w-3.5 h-3.5 text-amber-200" />
                <span>Oznacz jako zbity teraz</span>
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-gray-400 italic">
              Brak przypisanych bossów na tej mapie.
            </div>
          )}

          {/* Custom Marker Action */}
          <div className="pt-2.5 border-t border-gray-800 space-y-2">
            <label className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block font-mono flex items-center justify-between">
              <span>Dodaj własny znacznik z opisem:</span>
              <span className="text-[10px] text-gray-500 font-normal">CH{selectedChannel}</span>
            </label>

            {/* Title input */}
            <div>
              <input
                type="text"
                placeholder="Nazwa znacznika (np. Metin Cienia 45lvl)"
                value={customMarkerTitle}
                onChange={(e) => onChangeCustomMarkerTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#0a0d14] border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Notes / Description textarea */}
            <div>
              <textarea
                rows={2}
                placeholder="Wpisz opis dla innych graczy (np. Widziany metin za rzeką, zrzut itemów, spot gildyjny)..."
                value={customMarkerNotes}
                onChange={(e) => onChangeCustomMarkerNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#0a0d14] border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Color selector & submit */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-mono">Kolor:</span>
                {MARKER_COLORS.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => onChangeCustomMarkerColor(c.color)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer border ${
                      customMarkerColor === c.color
                        ? 'scale-125 border-white ring-2 ring-white/30'
                        : 'border-black/50 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>

              <button
                onClick={onSaveCustomMarker}
                disabled={isSavingMarker || !customMarkerTitle.trim()}
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Postaw znacznik</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
