import React from 'react';
import { MapDefinition } from '../../types';
import { Search, Filter, ArrowUpDown, RotateCcw } from 'lucide-react';

export type StatusFilterType = 'all' | 'any_alive' | 'all_alive' | 'imminent' | 'all_dead';
export type LevelFilterType = 'all' | '1-50' | '51-75' | '76-90' | '91+';
export type SortByType = 'default' | 'level_desc' | 'level_asc' | 'name_asc' | 'alive_desc';

interface MatrixFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedMapFilter: string;
  setSelectedMapFilter: (m: string) => void;
  statusFilter: StatusFilterType;
  setStatusFilter: (s: StatusFilterType) => void;
  levelFilter: LevelFilterType;
  setLevelFilter: (l: LevelFilterType) => void;
  channelFilter: string;
  setChannelFilter: (c: string) => void;
  sortBy: SortByType;
  setSortBy: (s: SortByType) => void;
  allMaps: MapDefinition[];
  totalBossesCount: number;
  filteredBossesCount: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const MatrixFilterBar: React.FC<MatrixFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedMapFilter,
  setSelectedMapFilter,
  statusFilter,
  setStatusFilter,
  levelFilter,
  setLevelFilter,
  channelFilter,
  setChannelFilter,
  sortBy,
  setSortBy,
  allMaps,
  totalBossesCount,
  filteredBossesCount,
  hasActiveFilters,
  onResetFilters,
}) => {
  const channels = [1, 2, 3, 4, 5, 6];

  return (
    <div className="p-3 sm:p-4 bg-[#0d1017] border-b border-gray-800 space-y-2.5 text-xs">
      {/* Row 1: Search + Map dropdown + Channel dropdown + Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj bossa, poziomu, dropu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#151924] rounded-lg border border-gray-700/80 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Map filter */}
        <div className="flex items-center gap-1.5 bg-[#151924] px-2.5 py-1 rounded-lg border border-gray-700/80">
          <Filter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <select
            value={selectedMapFilter}
            onChange={(e) => setSelectedMapFilter(e.target.value)}
            className="w-full bg-transparent text-gray-200 focus:outline-none cursor-pointer truncate"
          >
            <option value="all" className="bg-[#121622]">
              Wszystkie mapy ({allMaps.length})
            </option>
            {allMaps.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#121622]">
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Channel Focus Filter */}
        <div className="flex items-center gap-1.5 bg-[#151924] px-2.5 py-1 rounded-lg border border-gray-700/80">
          <span className="text-[10px] text-gray-400 font-mono font-bold uppercase shrink-0">Kanał:</span>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-full bg-transparent text-gray-200 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#121622]">
              Wszystkie kanały CH1-CH6
            </option>
            {channels.map((ch) => (
              <option key={ch} value={ch.toString()} className="bg-[#121622]">
                Tylko żywy na CH{ch}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-1.5 bg-[#151924] px-2.5 py-1 rounded-lg border border-gray-700/80">
          <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortByType)}
            className="w-full bg-transparent text-gray-200 focus:outline-none cursor-pointer"
          >
            <option value="default" className="bg-[#121622]">
              Domyślne sortowanie
            </option>
            <option value="level_desc" className="bg-[#121622]">
              Poziom: od najwyższego
            </option>
            <option value="level_asc" className="bg-[#121622]">
              Poziom: od najniższego
            </option>
            <option value="name_asc" className="bg-[#121622]">
              Nazwa: A do Z
            </option>
            <option value="alive_desc" className="bg-[#121622]">
              Najwięcej żywych CH
            </option>
          </select>
        </div>
      </div>

      {/* Row 2: Status Pills + Level Range Pills + Counter & Reset */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
        {/* Status Pills */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-gray-400 font-mono uppercase mr-1">Status:</span>
          {[
            { id: 'all', label: 'Wszystkie' },
            { id: 'any_alive', label: 'Min. 1 żywy' },
            { id: 'all_alive', label: 'Wszystkie 6 żywe' },
            { id: 'imminent', label: 'Wkrótce resp' },
            { id: 'all_dead', label: 'Wszystkie martwe' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as StatusFilterType)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                statusFilter === pill.id
                  ? 'bg-amber-500 text-gray-950 font-bold shadow'
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Level range pills */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-gray-400 font-mono uppercase mr-1">Lvl:</span>
          {(['all', '1-50', '51-75', '76-90', '91+'] as LevelFilterType[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                levelFilter === lvl
                  ? 'bg-cyan-500 text-gray-950 font-bold shadow'
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {lvl === 'all' ? 'Każdy' : lvl}
            </button>
          ))}
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-gray-400 text-xs font-mono">
            Wyświetlono: <strong className="text-amber-400">{filteredBossesCount}</strong> z {totalBossesCount}
          </span>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-amber-300 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              title="Wyczyść wszystkie filtry"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Wyczyść filtry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
