import React from 'react';
import { MapDefinition } from '../../types';
import { MapPin, Navigation, Crosshair, Trash2 } from 'lucide-react';

interface MapTopBarProps {
  currentMap: MapDefinition;
  selectedMapId: string;
  onSelectMapId: (id: string) => void;
  allMaps: MapDefinition[];
  mapBossesCount: number;
  onDeleteCurrentMap: () => void;
  canDeleteMap: boolean;
  showLandmarks: boolean;
  onToggleLandmarks: () => void;
  showSpawnZones: boolean;
  onToggleSpawnZones: () => void;
  onResetView: () => void;
}

const QUICK_MAPS = [
  { id: 'dolina_seungryong', label: 'Dolina' },
  { id: 'pustynia_yongbi', label: 'Pustynia' },
  { id: 'gora_sohan', label: 'Sohan' },
  { id: 'swiatynia_hwang', label: 'Świątynia' },
  { id: 'ognista_ziemia', label: 'Ognista' },
  { id: 'czerwony_las', label: 'Las' },
  { id: 'm1_jinno', label: 'M1 Jinno' },
  { id: 'm1_shinsoo', label: 'M1 Shinsoo' },
  { id: 'm2_jinno', label: 'M2 Bakra' },
];

export const MapTopBar: React.FC<MapTopBarProps> = ({
  currentMap,
  selectedMapId,
  onSelectMapId,
  allMaps,
  mapBossesCount,
  onDeleteCurrentMap,
  canDeleteMap,
  showLandmarks,
  onToggleLandmarks,
  showSpawnZones,
  onToggleSpawnZones,
  onResetView,
}) => {
  return (
    <div className="p-3 bg-[#11141d] border-b border-gray-800 flex flex-wrap items-center justify-between gap-2 z-10 shrink-0">
      {/* Map title & Direct Switcher */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-amber-400 font-bold font-metin text-sm leading-tight">
                {currentMap.name}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-gray-800 text-gray-300 border border-gray-700">
                {currentMap.recommendedLevel} lvl
              </span>
              {currentMap.isCustom && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ★ WŁASNA MAPA
                </span>
              )}
              {canDeleteMap && (
                <button
                  onClick={onDeleteCurrentMap}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-950/80 hover:bg-red-800 border border-red-600/80 text-red-300 hover:text-white text-[11px] font-semibold transition cursor-pointer shadow"
                  title="Usuń tę własną mapę wraz z bossami"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                  <span>Usuń mapę</span>
                </button>
              )}
              <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                ({mapBossesCount} {mapBossesCount === 1 ? 'boss' : mapBossesCount < 5 ? 'bossy' : 'bossów'})
              </span>
            </div>
          </div>
        </div>

        {/* Direct Map Switcher dropdown */}
        <select
          value={selectedMapId}
          onChange={(e) => onSelectMapId(e.target.value)}
          className="px-2.5 py-1 rounded-lg bg-[#0e111a] hover:bg-[#161a26] border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer focus:outline-none focus:border-amber-400 transition-colors shadow max-w-[170px] sm:max-w-none truncate"
          title="Szybka zmiana mapy"
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
          <optgroup label="Popularne Mapy Bossów">
            {allMaps
              .filter((m) => !m.isCustom && m.category === 'neutral')
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
          <optgroup label="Lochy i Instancje">
            {allMaps
              .filter((m) => !m.isCustom && m.category === 'dungeon')
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </optgroup>
          <optgroup label="Wszystkie Lokacje">
            {allMaps.map((m) => (
              <option key={m.id} value={m.id}>
                {m.isCustom ? `★ ${m.name}` : m.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Quick Travel Pills & Controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="hidden xl:flex items-center gap-1 bg-[#0a0d14] p-0.5 rounded-lg border border-gray-800 text-[11px]">
          {QUICK_MAPS.map((quickMap) => (
            <button
              key={quickMap.id}
              onClick={() => onSelectMapId(quickMap.id)}
              className={`px-2 py-0.5 rounded transition-colors font-medium cursor-pointer ${
                selectedMapId === quickMap.id
                  ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {quickMap.label}
            </button>
          ))}
        </div>

        <button
          onClick={onToggleLandmarks}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all shadow cursor-pointer ${
            showLandmarks
              ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
              : 'bg-[#0e111a] border-gray-700 text-gray-400 hover:text-gray-200'
          }`}
          title="Przełącz widoczność punktów orientacyjnych i portali"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Punkty Orientacyjne</span>
        </button>

        <button
          onClick={onToggleSpawnZones}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all shadow cursor-pointer ${
            showSpawnZones
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
              : 'bg-[#0e111a] border-gray-700 text-gray-400 hover:text-gray-200'
          }`}
          title="Przełącz strefy respu bossów"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Strefy Respu</span>
        </button>

        <button
          onClick={onResetView}
          className="px-2.5 py-1 rounded-lg bg-[#0e111a] hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold shadow transition-colors cursor-pointer"
          title="Wyśrodkuj widok mapy"
        >
          Wyśrodkuj
        </button>
      </div>
    </div>
  );
};
