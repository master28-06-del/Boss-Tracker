import React from 'react';
import { MetinItem, MapDefinition } from '../../types';
import { MapPin, Search, ChevronRight } from 'lucide-react';

export const RARITY_CONFIG: Record<string, { label: string; border: string; bg: string; text: string }> = {
  legendary: {
    label: 'Legenda',
    border: 'border-amber-500/60',
    bg: 'bg-gradient-to-r from-amber-950/60 to-red-950/40',
    text: 'text-amber-400',
  },
  epic: {
    label: 'Epicki',
    border: 'border-purple-500/60',
    bg: 'bg-purple-950/40',
    text: 'text-purple-300',
  },
  rare: {
    label: 'Rzadki',
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-950/40',
    text: 'text-cyan-300',
  },
  common: {
    label: 'Zwykły',
    border: 'border-gray-700',
    bg: 'bg-gray-800/40',
    text: 'text-gray-300',
  },
};

interface ItemCardProps {
  item: MetinItem;
  allMaps: MapDefinition[];
  selectedMapId: string;
  onApplyItemFilter: (item: MetinItem) => void;
  onSelectMap: (mapId: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  allMaps,
  selectedMapId,
  onApplyItemFilter,
  onSelectMap,
}) => {
  const rarityStyle = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;
  const isFromCurrentMap = item.sourceMaps.includes(selectedMapId);

  return (
    <div
      className={`p-3.5 rounded-xl border ${rarityStyle.border} ${rarityStyle.bg} flex flex-col justify-between shadow-lg hover:border-white/40 transition-all group`}
    >
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${rarityStyle.border} ${rarityStyle.text} bg-black/40`}
            >
              {rarityStyle.label}
            </span>
            {item.levelReq && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/40 text-gray-300 border border-gray-700">
                LVL {item.levelReq}
              </span>
            )}
          </div>

          {isFromCurrentMap && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              W tym obszarze
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="font-metin font-bold text-gray-100 text-sm sm:text-base tracking-wide group-hover:text-amber-300 transition-colors">
          {item.name}
        </h4>

        {/* Description */}
        <p className="text-xs text-gray-300/90 leading-relaxed mt-1.5 mb-3 line-clamp-3">
          {item.description}
        </p>

        {/* Maps info */}
        <div className="text-[11px] text-gray-400 space-y-1 mb-3 pt-2 border-t border-gray-800/80">
          <div className="flex items-center gap-1 text-gray-300">
            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">
              Obszary:{' '}
              <span className="text-gray-200">
                {item.sourceMaps
                  .map((mId) => allMaps.find((m) => m.id === mId)?.name || mId)
                  .slice(0, 3)
                  .join(', ')}
                {item.sourceMaps.length > 3 ? '...' : ''}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onApplyItemFilter(item)}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Filtruj w Rejestrze</span>
        </button>

        {item.sourceMaps.length > 0 && (
          <button
            onClick={() => onSelectMap(item.sourceMaps[0])}
            className="py-1.5 px-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition border border-gray-700 cursor-pointer"
            title="Przejdź do pierwszej mapy z tym itemem"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
