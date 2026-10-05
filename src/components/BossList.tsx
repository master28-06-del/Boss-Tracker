import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore, useAllBosses, useAllMaps } from '../store/useAppStore';
import { BossDefinition, KillRecord, MetinItem } from '../types';
import { submitBossKill, resetSingleBossKill } from '../services/api';
import { playBossKilledSound } from '../utils/sound';
import { canResetTimers } from '../utils/permissions';
import { getItemsForMap, getItemSuggestions, doesBossDropItem } from '../data/items';
import { BossListItem } from './boss/BossListItem';
import {
  Search,
  Swords,
  Database,
  Tag,
  X,
  BellRing,
  Flame,
  LogIn,
} from 'lucide-react';

export const BossList: React.FC = () => {
  const {
    selectedChannel,
    selectedMapId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    kills,
    bossConfigs,
    soundEnabled,
    soundVolume,
    setSelectedMapId,
    applyOptimisticKill,
    rollbackOptimisticKill,
    session,
    openBossDetailModal,
    setItemDatabaseModalOpen,
    notificationSettings,
    setNotificationModalOpen,
    setAuthModalOpen,
  } = useAppStore();

  const allBosses = useAllBosses();
  const allMaps = useAllMaps();

  const [filterMapScope, setFilterMapScope] = useState<'current_map' | 'all_maps'>('current_map');
  const [expandedBossId, setExpandedBossId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isAdmin = canResetTimers(session);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep live second-by-second ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Items from current area / map
  const currentMapItems = useMemo(() => {
    return getItemsForMap(selectedMapId);
  }, [selectedMapId]);

  // Autocomplete item suggestions
  const itemSuggestions = useMemo(() => {
    return getItemSuggestions(searchQuery, selectedMapId, 7);
  }, [searchQuery, selectedMapId]);

  // Compute filtered bosses
  const timeFilterKey = statusFilter === 'all' ? 0 : Math.floor(currentTime / 1000);
  const filteredBosses = useMemo(() => {
    return allBosses.filter((boss) => {
      if (filterMapScope === 'current_map' && boss.mapId !== selectedMapId) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = boss.name.toLowerCase().includes(query);
        const matchDrops = boss.drops.some((d) => d.toLowerCase().includes(query));
        const matchMap = allMaps.find((m) => m.id === boss.mapId)?.name.toLowerCase().includes(query);
        const matchItemDb = doesBossDropItem(boss.id, boss.name, boss.drops, query);
        if (!matchName && !matchDrops && !matchMap && !matchItemDb) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const key = `${boss.id}_ch${selectedChannel}`;
        const record = kills[key];
        const now = currentTime;

        if (statusFilter === 'alive') {
          if (record && record.respawnAt > now) return false;
        } else if (statusFilter === 'dead') {
          if (!record || record.respawnAt <= now) return false;
        } else if (statusFilter === 'imminent') {
          if (!record) return false;
          const config = bossConfigs[boss.id] || {
            respawnMinutes: boss.respawnMinutes,
            varianceMinutes: boss.varianceMinutes,
          };
          const windowStart = record.respawnAt - (config.varianceMinutes || 0) * 60 * 1000;
          if (now < windowStart || now > record.respawnAt) return false;
        }
      }

      return true;
    });
  }, [
    allBosses,
    allMaps,
    selectedMapId,
    filterMapScope,
    searchQuery,
    statusFilter,
    kills,
    selectedChannel,
    timeFilterKey,
    bossConfigs,
    currentTime,
  ]);

  // Optimistic Kill Action
  const handleKillBoss = async (boss: BossDefinition) => {
    const key = `${boss.id}_ch${selectedChannel}`;
    const previousRecord = kills[key];
    const now = Date.now();
    const config = bossConfigs[boss.id] || {
      respawnMinutes: boss.respawnMinutes,
      varianceMinutes: boss.varianceMinutes,
    };
    const respawnMs = config.respawnMinutes * 60 * 1000;
    const varianceMs = (config.varianceMinutes || 0) * 60 * 1000;

    const optimisticRecord: KillRecord = {
      id: `temp_${Date.now()}`,
      bossId: boss.id,
      channel: selectedChannel,
      killedAt: now,
      respawnAt: now + respawnMs,
      respawnWindowStart: now + respawnMs - varianceMs,
      respawnWindowEnd: now + respawnMs + varianceMs,
      killedBy: session?.username || 'Gracz',
      coords: boss.defaultCoords,
    };

    // 1. Optimistically update local store immediately
    applyOptimisticKill(optimisticRecord);
    if (soundEnabled) {
      playBossKilledSound(soundVolume);
    }

    // 2. Transmit to server
    try {
      await submitBossKill({
        bossId: boss.id,
        channel: selectedChannel,
        killedAt: now,
        killedBy: session?.username || 'Gracz',
        coords: boss.defaultCoords,
      });
    } catch (err) {
      console.error('[Optimistic Update Failed]', err);
      // 3. Rollback on failure
      rollbackOptimisticKill(key, previousRecord);
      alert('Nie udało się zapisać zbicia bossa. Sprawdź połączenie z serwerem.');
    }
  };

  // Reset timer (Administrator only)
  const handleResetBoss = async (bossId: string) => {
    if (!isAdmin) {
      alert('Resetowanie timerów wymaga uprawnień Administratora. Zaloguj się na konto administratora (admin / admin123!).');
      return;
    }
    try {
      await resetSingleBossKill(bossId, selectedChannel);
    } catch (err) {
      console.error(err);
      alert('Błąd podczas resetowania timera.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121620] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header & Controls */}
      <div className="p-3 sm:p-3.5 border-b border-gray-800 bg-[#171c28]/90 backdrop-blur space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-gray-100 font-metin tracking-wide text-base">Rejestr Bossów</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setItemDatabaseModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-[11px] font-bold transition-all shadow-sm cursor-pointer"
              title="Otwórz encyklopedię wszystkich dropów i itemów"
            >
              <Database className="w-3 h-3" />
              <span className="hidden xs:inline">Baza Dropu</span>
            </button>

            <button
              onClick={() => setNotificationModalOpen(true)}
              className={`p-1 rounded-lg border transition-all cursor-pointer shadow-sm ${
                notificationSettings.enabled
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-[#151923] border-gray-700 text-gray-400 hover:text-gray-300'
              }`}
              title="Ustawienia powiadomień"
            >
              <BellRing className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search input with live item suggestions */}
        <div ref={searchContainerRef} className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Szukaj bossa, poziomu lub dropu (np. Zatruty Miecz, Kamień)..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              className="w-full pl-9 pr-8 py-2 bg-[#0e111a] border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown Popup */}
          {isSearchFocused && itemSuggestions.length > 0 && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#141822] border border-amber-500/40 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
              <div className="p-1.5 bg-[#0e111a] border-b border-gray-800 text-[10px] font-bold text-amber-400 flex items-center justify-between">
                <span>Podpowiedzi z bazy przedmiotów:</span>
                <span className="text-gray-500 font-normal">kliknij by przefiltrować</span>
              </div>
              {itemSuggestions.map((item: MetinItem) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSearchQuery(item.name);
                    setIsSearchFocused(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-800/80 transition-colors border-b border-gray-800/40 flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-gray-200 group-hover:text-amber-300">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-400 line-clamp-1">{item.description}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-900 text-cyan-300 border border-cyan-800/40 shrink-0">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Map Quick Item Chips */}
        {currentMapItems.length > 0 && !searchQuery && (
          <div className="pt-0.5">
            <div className="text-[10px] text-gray-400 flex items-center gap-1 mb-1">
              <Tag className="w-2.5 h-2.5 text-amber-500" />
              <span>Częste dropy na tej mapie:</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {currentMapItems.map((item) => {
                const isActive = searchQuery.toLowerCase() === item.name.toLowerCase();
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isActive) {
                        setSearchQuery('');
                      } else {
                        setSearchQuery(item.name);
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap transition-all font-medium cursor-pointer border ${
                      isActive
                        ? 'bg-amber-500 text-gray-950 font-bold border-amber-400 shadow-sm'
                        : 'bg-[#0e111a] hover:bg-gray-800 text-gray-300 border-gray-800 hover:border-gray-700'
                    }`}
                    title={item.description}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter chips */}
        <div className="flex items-center justify-between gap-1 text-[11px] pt-0.5 flex-wrap gap-y-1.5">
          <div className="flex items-center gap-1 bg-[#0e111a] p-0.5 rounded-lg border border-gray-800">
            <button
              onClick={() => setFilterMapScope('current_map')}
              className={`px-2 py-1 rounded transition-colors font-medium cursor-pointer ${
                filterMapScope === 'current_map' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Ta mapa
            </button>
            <button
              onClick={() => setFilterMapScope('all_maps')}
              className={`px-2 py-1 rounded transition-colors font-medium cursor-pointer ${
                filterMapScope === 'all_maps' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Wszystkie ({allBosses.length})
            </button>
          </div>

          <div className="flex items-center gap-1">
            {(['all', 'alive', 'dead'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer capitalize ${
                  statusFilter === st
                    ? 'bg-gray-700 text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {st === 'all' ? 'Wsz.' : st === 'alive' ? 'Żywe' : 'Zbite'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prominent Login Callout if user is not logged in */}
      {!session && (
        <div className="mx-3 mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-2 text-xs animate-in fade-in shrink-0">
          <div className="flex items-center gap-2 text-amber-200">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="text-[11px] leading-tight">
              Zaloguj się, aby oznaczać zbite bossy i synchronizować czasy na żywo!
            </span>
          </div>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-xs shrink-0 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5 text-gray-950 stroke-[2.5]" />
            <span>Zaloguj się</span>
          </button>
        </div>
      )}

      {/* Boss Cards Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-gray-800/40">
        {filteredBosses.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            Brak bossów spełniających wybrane kryteria filtrowania.
          </div>
        ) : (
          filteredBosses.map((boss) => {
            const key = `${boss.id}_ch${selectedChannel}`;
            const record = kills[key];
            const config = bossConfigs[boss.id] || {
              respawnMinutes: boss.respawnMinutes,
              varianceMinutes: boss.varianceMinutes,
            };
            const mapDef = allMaps.find((m) => m.id === boss.mapId);

            return (
              <BossListItem
                key={boss.id}
                boss={boss}
                selectedChannel={selectedChannel}
                record={record}
                kills={kills}
                bossConfig={config}
                currentTime={currentTime}
                mapName={mapDef?.name}
                isAdmin={isAdmin}
                isExpanded={expandedBossId === boss.id}
                onToggleExpand={() =>
                  setExpandedBossId(expandedBossId === boss.id ? null : boss.id)
                }
                onKill={handleKillBoss}
                onReset={handleResetBoss}
                onOpenDetails={openBossDetailModal}
                onSelectMap={setSelectedMapId}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
