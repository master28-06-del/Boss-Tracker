import React from 'react';
import { MapDefinition, BossDefinition } from '../../types';
import { MapPin, Skull, Trash2, ArrowUpRight, Plus, Calendar, User } from 'lucide-react';

interface CustomMapsListTabProps {
  customMaps: MapDefinition[];
  customBosses: BossDefinition[];
  onSelectMap: (mapId: string) => void;
  onRequestDelete: (map: MapDefinition) => void;
  onSwitchToCreate: () => void;
}

export const CustomMapsListTab: React.FC<CustomMapsListTabProps> = ({
  customMaps,
  customBosses,
  onSelectMap,
  onRequestDelete,
  onSwitchToCreate,
}) => {
  if (customMaps.length === 0) {
    return (
      <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <MapPin className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="font-metin font-bold text-lg text-stone-200">
            Brak własnych map graczy
          </h3>
          <p className="text-xs text-stone-400">
            Nie dodano jeszcze żadnej niestandardowej krainy. Możesz wgrać własną mapę, ustawić teksturę oraz zdefiniować bossa z czasem respawnu.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs shadow-lg shadow-amber-950/50 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Utwórz pierwszą własną mapę</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Zarządzaj Własnymi Mapami ({customMaps.length})
          </h3>
          <p className="text-[11px] text-stone-400">
            Wybierz mapę, aby ją otworzyć w radarze, lub usuń niepotrzebną mapę wraz z jej bossami.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Dodaj nową</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
        {customMaps.map((map) => {
          const assignedBosses = customBosses.filter((b) => b.mapId === map.id);

          return (
            <div
              key={map.id}
              className="group relative flex flex-col justify-between p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 hover:border-amber-500/50 transition-all shadow-md"
            >
              <div className="flex gap-3">
                {/* Thumbnail / Theme icon */}
                <div
                  className="w-16 h-16 rounded-lg shrink-0 overflow-hidden border border-stone-700 relative flex items-center justify-center bg-stone-900"
                  style={{
                    backgroundColor: map.theme?.bg || '#1c1917',
                  }}
                >
                  {map.imageUrl ? (
                    <img
                      src={map.imageUrl}
                      alt={map.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MapPin
                      className="w-6 h-6"
                      style={{ color: map.theme?.accent || '#f59e0b' }}
                    />
                  )}
                  <span className="absolute bottom-0 right-0 px-1 py-0.5 text-[8px] font-bold font-mono bg-black/80 text-amber-300 rounded-tl">
                    CUSTOM
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-metin font-bold text-sm text-stone-100 truncate group-hover:text-amber-300 transition">
                      ★ {map.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-stone-900 border border-stone-800 text-stone-300">
                      {map.recommendedLevel || '1 - 99 lvl'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      {map.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Skull className="w-3 h-3 text-red-400" />
                      <span>{assignedBosses.length} {assignedBosses.length === 1 ? 'boss' : 'bossów'}</span>
                    </span>
                  </div>

                  {map.description && (
                    <p className="text-[11px] text-stone-400 line-clamp-1">
                      {map.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-0.5 text-[10px] text-stone-500 font-mono">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{map.createdBy || 'Gracz'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onRequestDelete(map)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 hover:border-red-600 text-red-400 hover:text-red-200 text-xs font-semibold transition cursor-pointer"
                  title="Usuń tę mapę bezpowrotnie"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Usuń mapę</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectMap(map.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 text-xs font-semibold transition cursor-pointer"
                >
                  <span>Otwórz na radarze</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
