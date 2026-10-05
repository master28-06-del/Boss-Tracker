import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore, useAllBosses, useAllMaps } from '../store/useAppStore';
import { ChannelId } from '../types';
import { submitBossKill } from '../services/api';
import { playBossKilledSound } from '../utils/sound';
import { X, Grid, AlertTriangle } from 'lucide-react';
import {
  MatrixFilterBar,
  StatusFilterType,
  LevelFilterType,
  SortByType,
} from './matrix/MatrixFilterBar';
import { MatrixTableRow } from './matrix/MatrixTableRow';

export const ChannelMatrixModal: React.FC = () => {
  const {
    isMatrixModalOpen,
    setMatrixModalOpen,
    kills,
    bossConfigs,
    setSelectedMapId,
    soundEnabled,
    soundVolume,
    session,
    applyOptimisticKill,
    rollbackOptimisticKill,
  } = useAppStore();

  const allBosses = useAllBosses();
  const allMaps = useAllMaps();

  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const channels: ChannelId[] = [1, 2, 3, 4, 5, 6];

  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMapFilter, setSelectedMapFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilterType>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortByType>('default');

  useEffect(() => {
    if (!isMatrixModalOpen) return;
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isMatrixModalOpen]);

  // Boss status calculation per channel
  const getBossChannelInfo = (bossId: string, channel: ChannelId) => {
    const key = `${bossId}_ch${channel}`;
    const record = kills[key];
    const isAlive = !record || record.respawnAt <= currentTime;
    const diffMs = record ? record.respawnAt - currentTime : 0;

    let isImminent = false;
    if (record && !isAlive) {
      const boss = allBosses.find((b) => b.id === bossId);
      const config = bossConfigs[bossId] || {
        respawnMinutes: boss?.respawnMinutes || 120,
        varianceMinutes: boss?.varianceMinutes || 5,
      };
      const windowStart = record.respawnAt - (config.varianceMinutes || 0) * 60 * 1000;
      isImminent = currentTime >= windowStart;
    }

    return { isAlive, diffMs, isImminent, record };
  };

  // Compute live matrix counts
  const matrixStats = useMemo(() => {
    const totalCells = allBosses.length * channels.length;
    let totalAlive = 0;
    let totalDead = 0;

    allBosses.forEach((b) => {
      channels.forEach((ch) => {
        const key = `${b.id}_ch${ch}`;
        const rec = kills[key];
        if (!rec || rec.respawnAt <= currentTime) {
          totalAlive++;
        } else {
          totalDead++;
        }
      });
    });

    return { totalCells, totalAlive, totalDead };
  }, [allBosses, kills, currentTime]);

  // Filter & Sort bosses
  const filteredBosses = useMemo(() => {
    return allBosses
      .filter((boss) => {
        // 1. Map filter
        if (selectedMapFilter !== 'all' && boss.mapId !== selectedMapFilter) {
          return false;
        }

        // 2. Level filter
        if (levelFilter === '1-50' && boss.level > 50) return false;
        if (levelFilter === '51-75' && (boss.level <= 50 || boss.level > 75)) return false;
        if (levelFilter === '76-90' && (boss.level <= 75 || boss.level > 90)) return false;
        if (levelFilter === '91+' && boss.level <= 90) return false;

        // 3. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = boss.name.toLowerCase().includes(q);
          const matchLevel = boss.level.toString().includes(q);
          const matchDrops = boss.drops.some((d) => d.toLowerCase().includes(q));
          const mapDef = allMaps.find((m) => m.id === boss.mapId);
          const matchMap = mapDef?.name.toLowerCase().includes(q);
          if (!matchName && !matchLevel && !matchDrops && !matchMap) return false;
        }

        // 4. Channel specific filter
        if (channelFilter !== 'all') {
          const chNum = Number(channelFilter) as ChannelId;
          const { isAlive } = getBossChannelInfo(boss.id, chNum);
          if (!isAlive) return false;
        }

        // 5. Status filter
        if (statusFilter !== 'all') {
          let aliveCount = 0;
          let hasImminent = false;

          channels.forEach((ch) => {
            const { isAlive, isImminent } = getBossChannelInfo(boss.id, ch);
            if (isAlive) aliveCount++;
            if (isImminent) hasImminent = true;
          });

          if (statusFilter === 'any_alive' && aliveCount === 0) return false;
          if (statusFilter === 'all_alive' && aliveCount < 6) return false;
          if (statusFilter === 'all_dead' && aliveCount > 0) return false;
          if (statusFilter === 'imminent' && !hasImminent) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'level_desc') return b.level - a.level;
        if (sortBy === 'level_asc') return a.level - b.level;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'pl');
        if (sortBy === 'alive_desc') {
          const aliveA = channels.filter((ch) => getBossChannelInfo(a.id, ch).isAlive).length;
          const aliveB = channels.filter((ch) => getBossChannelInfo(b.id, ch).isAlive).length;
          return aliveB - aliveA;
        }
        return 0; // default order in database
      });
  }, [
    allBosses,
    allMaps,
    selectedMapFilter,
    levelFilter,
    searchQuery,
    channelFilter,
    statusFilter,
    sortBy,
    kills,
    currentTime,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedMapFilter !== 'all' ||
    statusFilter !== 'all' ||
    levelFilter !== 'all' ||
    channelFilter !== 'all' ||
    sortBy !== 'default';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMapFilter('all');
    setStatusFilter('all');
    setLevelFilter('all');
    setChannelFilter('all');
    setSortBy('default');
  };

  if (!isMatrixModalOpen) return null;

  const handleCellKill = async (bossId: string, channel: ChannelId) => {
    const boss = allBosses.find((b) => b.id === bossId);
    if (!boss) return;

    const key = `${boss.id}_ch${channel}`;
    const previousRecord = kills[key];
    const now = Date.now();
    const config = bossConfigs[boss.id] || {
      respawnMinutes: boss.respawnMinutes,
      varianceMinutes: boss.varianceMinutes,
    };
    const respawnMs = config.respawnMinutes * 60 * 1000;
    const varianceMs = (config.varianceMinutes || 0) * 60 * 1000;

    applyOptimisticKill({
      id: `quick_${Date.now()}`,
      bossId,
      channel,
      killedAt: now,
      respawnAt: now + respawnMs,
      respawnWindowStart: now + respawnMs - varianceMs,
      respawnWindowEnd: now + respawnMs + varianceMs,
      killedBy: session?.username || 'Gracz',
      coords: boss.defaultCoords,
    });

    if (soundEnabled) {
      playBossKilledSound(soundVolume);
    }

    try {
      await submitBossKill({
        bossId,
        channel,
        killedAt: now,
        killedBy: session?.username || 'Gracz',
        coords: boss.defaultCoords,
      });
    } catch (err) {
      console.error('[Matrix] Kill submission failed:', err);
      rollbackOptimisticKill(key, previousRecord);
    }
  };

  const formatTimer = (diffMs: number) => {
    if (diffMs <= 0) return 'READY';
    const totalSec = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}g ${mins}m`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectMap = (mapId: string) => {
    setSelectedMapId(mapId);
    setMatrixModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col bg-[#121622] border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-gray-800 bg-[#161b28] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-metin font-bold text-base sm:text-lg text-gray-100 tracking-wide">
                  Matryca Statusów CH1 – CH6
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Żywych: {matrixStats.totalAlive} / {matrixStats.totalCells}
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                Zaawansowane filtrowanie, statusy w czasie rzeczywistym i szybkie zbicia na każdym kanale.
              </p>
            </div>
          </div>
          <button
            onClick={() => setMatrixModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter bar */}
        <MatrixFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedMapFilter={selectedMapFilter}
          setSelectedMapFilter={setSelectedMapFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          channelFilter={channelFilter}
          setChannelFilter={setChannelFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          allMaps={allMaps}
          totalBossesCount={allBosses.length}
          filteredBossesCount={filteredBosses.length}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />

        {/* Matrix Table */}
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          {filteredBosses.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-800 flex items-center justify-center text-gray-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-gray-300 font-semibold">
                Nie znaleziono bossów spełniających wybrane kryteria
              </div>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Zmień filtry, wyszukiwane słowo lub zresetuj kryteria wyszukiwania, aby zobaczyć pozostałych bossów.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-950 font-bold text-xs transition cursor-pointer"
              >
                Resetuj wszystkie filtry
              </button>
            </div>
          ) : (
            <table className="w-full min-w-[620px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-[#0e111a] sticky top-0 z-10">
                  <th className="p-3 text-gray-400 font-bold uppercase tracking-wider font-mono">Boss</th>
                  <th className="p-3 text-gray-400 font-bold uppercase tracking-wider font-mono hidden md:table-cell">
                    Mapa
                  </th>
                  <th className="p-3 text-center text-gray-400 font-bold uppercase tracking-wider font-mono hidden sm:table-cell">
                    Status
                  </th>
                  {channels.map((ch) => (
                    <th key={ch} className="p-3 text-center font-mono font-bold text-amber-400">
                      CH{ch}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredBosses.map((boss) => {
                  const mapDef = allMaps.find((m) => m.id === boss.mapId);
                  return (
                    <MatrixTableRow
                      key={boss.id}
                      boss={boss}
                      mapDef={mapDef}
                      channels={channels}
                      getBossChannelInfo={getBossChannelInfo}
                      formatTimer={formatTimer}
                      onCellKill={handleCellKill}
                      onSelectMap={handleSelectMap}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
