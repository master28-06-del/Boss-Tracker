import React from 'react';
import { Search, Tag, Sparkles, MapPin, X, Database, Package, Sword, Shield, Gem, Scroll } from 'lucide-react';
import { MapDefinition } from '../../types';

export const CATEGORY_NAMES: Record<string, { label: string; icon: any }> = {
  all: { label: 'Wszystkie kategorie', icon: Database },
  chest: { label: 'Szkatułki', icon: Package },
  weapon: { label: 'Bronie', icon: Sword },
  armor: { label: 'Zbroje i Tarcze', icon: Shield },
  stone: { label: 'Kamienie Duszy (KD)', icon: Gem },
  upgrade: { label: 'Ulepszacze i Biolog', icon: Scroll },
  special: { label: 'Przedmioty Specjalne & Zioła', icon: Sparkles },
};

interface ItemFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedRarity: string;
  onRarityChange: (value: string) => void;
  selectedMapFilter: string;
  onMapFilterChange: (value: string) => void;
  selectedMapId: string;
  allMaps: MapDefinition[];
}

export const ItemFilterBar: React.FC<ItemFilterBarProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedRarity,
  onRarityChange,
  selectedMapFilter,
  onMapFilterChange,
  selectedMapId,
  allMaps,
}) => {
  return (
    <div className="p-3 border-b border-gray-800 bg-[#0e111a] space-y-2.5 shrink-0 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Szukaj przedmiotu, bossa, opisu..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-[#151924] border border-gray-700/80 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/80"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#151924] px-2.5 py-1 rounded-lg border border-gray-700/80">
          <Tag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-transparent text-gray-200 focus:outline-none cursor-pointer"
          >
            {Object.entries(CATEGORY_NAMES).map(([key, info]) => (
              <option key={key} value={key} className="bg-[#121622]">
                {info.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rarity Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#151924] px-2.5 py-1 rounded-lg border border-gray-700/80">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <select
            value={selectedRarity}
            onChange={(e) => onRarityChange(e.target.value)}
            className="w-full bg-transparent text-gray-200 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#121622]">
              Wszystkie rzadkości
            </option>
            <option value="legendary" className="bg-[#121622]">
              Legendarne (np. Zatruty, Stalka)
            </option>
            <option value="epic" className="bg-[#121622]">
              Epickie (np. Szkatułki, Miecz Bojowy)
            </option>
            <option value="rare" className="bg-[#121622]">
              Rzadkie (np. FMS, Marmury)
            </option>
            <option value="common" className="bg-[#121622]">
              Zwykłe (np. Zęby orka, Peleryny)
            </option>
          </select>
        </div>

        {/* Map Source Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#151924] px-2.5 py-1 rounded-lg border border-gray-700/80">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <select
            value={selectedMapFilter}
            onChange={(e) => onMapFilterChange(e.target.value)}
            className="w-full bg-transparent text-gray-200 focus:outline-none cursor-pointer truncate"
          >
            <option value="all" className="bg-[#121622]">
              Wszystkie mapy
            </option>
            <option value={selectedMapId} className="bg-[#121622] font-bold text-amber-300">
              ★ Obecna mapa ({allMaps.find((m) => m.id === selectedMapId)?.name})
            </option>
            {allMaps.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#121622]">
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
        {Object.entries(CATEGORY_NAMES).map(([key, info]) => {
          const Icon = info.icon;
          const isActive = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-[#151924] text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{info.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
