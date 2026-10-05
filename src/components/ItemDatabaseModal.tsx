import React, { useState, useMemo } from 'react';
import { useAppStore, useAllMaps } from '../store/useAppStore';
import { METIN2_ITEMS_DATABASE } from '../data/items';
import { MetinItem } from '../types';
import { ItemFilterBar } from './items/ItemFilterBar';
import { ItemCard } from './items/ItemCard';
import { X, Database } from 'lucide-react';

export const ItemDatabaseModal: React.FC = () => {
  const {
    isItemDatabaseModalOpen,
    setItemDatabaseModalOpen,
    setSelectedMapId,
    setSearchQuery,
    selectedMapId,
  } = useAppStore();

  const allMaps = useAllMaps();

  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedMapFilter, setSelectedMapFilter] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return METIN2_ITEMS_DATABASE.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Rarity filter
      if (selectedRarity !== 'all' && item.rarity !== selectedRarity) {
        return false;
      }
      // Map filter
      if (selectedMapFilter !== 'all' && !item.sourceMaps.includes(selectedMapFilter)) {
        return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchBosses = item.sourceBosses.some((b) => b.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchBosses) return false;
      }
      return true;
    });
  }, [search, selectedCategory, selectedRarity, selectedMapFilter]);

  if (!isItemDatabaseModalOpen) return null;

  const handleApplyItemFilter = (item: MetinItem) => {
    setSearchQuery(item.name);
    if (item.sourceMaps.length > 0) {
      setSelectedMapId(item.sourceMaps[0]);
    }
    setItemDatabaseModalOpen(false);
  };

  const handleSelectMapFilter = (mapId: string) => {
    setSelectedMapId(mapId);
    setItemDatabaseModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#121622] border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-gray-800 bg-[#161b28] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-metin font-bold text-base sm:text-lg text-gray-100 tracking-wide">
                  Encyklopedia & Baza Itemów Metin2
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {METIN2_ITEMS_DATABASE.length} przedmiotów
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                Przeglądaj wszystkie przedmioty, szkaty, KD, stalki i ulepszacze. Kliknij przedmiot, aby natychmiast przefiltrować bossów, z których dropi.
              </p>
            </div>
          </div>

          <button
            onClick={() => setItemDatabaseModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            title="Zamknij bazę przedmiotów"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters Toolbar */}
        <ItemFilterBar
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedRarity={selectedRarity}
          onRarityChange={setSelectedRarity}
          selectedMapFilter={selectedMapFilter}
          onMapFilterChange={setSelectedMapFilter}
          selectedMapId={selectedMapId}
          allMaps={allMaps}
        />

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Brak przedmiotów spełniających wybrane kryteria wyszukiwania.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  allMaps={allMaps}
                  selectedMapId={selectedMapId}
                  onApplyItemFilter={handleApplyItemFilter}
                  onSelectMap={handleSelectMapFilter}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
