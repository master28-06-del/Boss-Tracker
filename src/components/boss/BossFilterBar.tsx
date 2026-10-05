import React from 'react';
import { Search, X, Filter, Sparkles, ArrowUpDown, Swords } from 'lucide-react';

export type FilterMapScope = 'current_map' | 'all_maps';
export type StatusFilter = 'all' | 'alive' | 'dead';
export type SortOption = 'level_desc' | 'level_asc' | 'respawn_asc' | 'name_asc' | 'name_desc';

interface BossFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterMapScope: FilterMapScope;
  onFilterMapScopeChange: (scope: FilterMapScope) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
  searchItemFilter: string | null;
  onClearItemFilter: () => void;
  totalBossesCount: number;
  aliveBossesCount: number;
  filteredCount: number;
}

export const BossFilterBar: React.FC<BossFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filterMapScope,
  onFilterMapScopeChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  searchItemFilter,
  onClearItemFilter,
  totalBossesCount,
  aliveBossesCount,
  filteredCount,
}) => {
  return (
    <div className="space-y-2">
      {/* Search Input & Sort row */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Szukaj bossa, poziomu lub przedmiotu..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-[#0e111a] border border-gray-700/80 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500/80"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortOption)}
            className="pl-6 pr-2 py-1.5 bg-[#0e111a] border border-gray-700/80 rounded-lg text-[11px] text-gray-300 font-semibold focus:outline-none focus:border-amber-500/80 cursor-pointer appearance-none"
            title="Sortuj listę bossów"
          >
            <option value="level_desc">Poziom (najwyższy)</option>
            <option value="level_asc">Poziom (najniższy)</option>
            <option value="respawn_asc">Czas do odrodzenia</option>
            <option value="name_asc">Nazwa (A - Z)</option>
            <option value="name_desc">Nazwa (Z - A)</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-amber-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Active Item Drop Filter Badge */}
      {searchItemFilter && (
        <div className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-cyan-950/40 border border-cyan-700/50 text-xs text-cyan-300">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[11px] text-gray-300">Filtrowanie dropu:</span>
            <span className="font-bold font-mono text-cyan-200 truncate">{searchItemFilter}</span>
          </div>
          <button
            onClick={onClearItemFilter}
            className="text-[10px] text-cyan-400 hover:text-white underline cursor-pointer ml-2 shrink-0"
          >
            Usuń filtr
          </button>
        </div>
      )}

      {/* Filter chips (Map Scope & Status) */}
      <div className="flex items-center justify-between gap-1 text-[11px] pt-0.5 flex-wrap gap-y-1.5">
        <div className="flex items-center gap-1 bg-[#0e111a] p-0.5 rounded-lg border border-gray-800">
          <button
            onClick={() => onFilterMapScopeChange('current_map')}
            className={`px-2 py-1 rounded transition-colors font-medium cursor-pointer ${
              filterMapScope === 'current_map'
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Ta mapa
          </button>
          <button
            onClick={() => onFilterMapScopeChange('all_maps')}
            className={`px-2 py-1 rounded transition-colors font-medium cursor-pointer ${
              filterMapScope === 'all_maps'
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Wszystkie ({totalBossesCount})
          </button>
        </div>

        <div className="flex items-center gap-1">
          {(['all', 'alive', 'dead'] as const).map((st) => (
            <button
              key={st}
              onClick={() => onStatusFilterChange(st)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer capitalize ${
                statusFilter === st
                  ? 'bg-gray-700 text-white font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {st === 'all' ? 'Wsz.' : st === 'alive' ? `Żywe (${aliveBossesCount})` : 'Zbite'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
