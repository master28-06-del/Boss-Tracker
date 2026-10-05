import React from 'react';
import { MapDefinition } from '../../types';
import { Map as MapIcon } from 'lucide-react';

interface MapSelectDropdownProps {
  selectedMapId: string;
  onSelectMapId: (mapId: string) => void;
  allMaps: MapDefinition[];
  widthClass?: string;
}

export const MapSelectDropdown: React.FC<MapSelectDropdownProps> = ({
  selectedMapId,
  onSelectMapId,
  allMaps,
  widthClass = 'w-36 xl:w-44 2xl:w-56',
}) => {
  return (
    <div className="relative flex items-center shrink-0">
      <MapIcon className="w-3.5 h-3.5 text-amber-400 absolute left-2 pointer-events-none" />
      <select
        value={selectedMapId}
        onChange={(e) => onSelectMapId(e.target.value)}
        className={`pl-7 pr-4 py-1.5 bg-[#151923] hover:bg-[#1a202d] border border-gray-700/80 rounded-lg text-xs text-gray-200 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer appearance-none shadow truncate ${widthClass}`}
        title="Wybierz lokację / mapę"
      >
        {allMaps.some((m) => m.isCustom) && (
          <optgroup label="★ Własne Mapy Graczy">
            {allMaps
              .filter((m) => m.isCustom)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  ★ {m.name}
                </option>
              ))}
          </optgroup>
        )}
        <optgroup label="Mapy Neutralne & Bossy">
          {allMaps
            .filter((m) => !m.isCustom && m.category === 'neutral')
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
        </optgroup>
        <optgroup label="Lochy & Wieża Demonów">
          {allMaps
            .filter((m) => !m.isCustom && m.category === 'dungeon')
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
        </optgroup>
        <optgroup label="Wysoki Poziom & AV1/AV2">
          {allMaps
            .filter((m) => !m.isCustom && m.category === 'high_level')
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
        </optgroup>
        <optgroup label="Miasta Pierwsze (M1)">
          {allMaps
            .filter((m) => !m.isCustom && m.category === 'm1')
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
        </optgroup>
        <optgroup label="Miasta Drugie (M2)">
          {allMaps
            .filter((m) => !m.isCustom && m.category === 'm2' && m.id !== 'm2_bakra')
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
        </optgroup>
      </select>
    </div>
  );
};
