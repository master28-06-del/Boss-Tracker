import React from 'react';
import { useAppStore, useAllMaps } from '../store/useAppStore';
import { canResetTimers } from '../utils/permissions';
import { submitBossKill, resetSingleBossKill } from '../services/api';
import { playBossKilledSound } from '../utils/sound';
import { ChannelId, KillRecord } from '../types';
import { BossDetailHeader } from './boss/BossDetailHeader';
import { BossDetailSpecsAndLore } from './boss/BossDetailSpecsAndLore';
import { BossDetailDrops } from './boss/BossDetailDrops';
import { BossDetailChannels } from './boss/BossDetailChannels';

export const BossDetailModal: React.FC = () => {
  // Always call ALL hooks at the top unconditionally (React Rules of Hooks)
  const allMaps = useAllMaps();
  const {
    isBossDetailModalOpen,
    selectedBossForDetails,
    closeBossDetailModal,
    selectedChannel,
    setSelectedMapId,
    kills,
    bossConfigs,
    session,
    soundEnabled,
    soundVolume,
    applyOptimisticKill,
    rollbackOptimisticKill,
  } = useAppStore();

  // Early return only after all hooks have been invoked
  if (!isBossDetailModalOpen || !selectedBossForDetails) {
    return null;
  }

  const boss = selectedBossForDetails;
  const mapDef = allMaps.find((m) => m.id === boss.mapId);
  const config = bossConfigs[boss.id] || {
    respawnMinutes: boss.respawnMinutes || 120,
    varianceMinutes: boss.varianceMinutes || 5,
  };

  const hasAdminRights = canResetTimers(session);

  const handleShowOnMap = () => {
    if (boss.mapId) {
      setSelectedMapId(boss.mapId);
    }
    closeBossDetailModal();
  };

  const handleKillOnChannel = async (ch: ChannelId) => {
    const key = `${boss.id}_ch${ch}`;
    const previousRecord = kills[key];
    const killTime = Date.now();
    const respawnMs = (config.respawnMinutes || 120) * 60 * 1000;
    const varianceMs = (config.varianceMinutes || 0) * 60 * 1000;

    const optimisticRecord: KillRecord = {
      id: `temp_${Date.now()}`,
      bossId: boss.id,
      channel: ch,
      killedAt: killTime,
      respawnAt: killTime + respawnMs,
      respawnWindowStart: killTime + respawnMs - varianceMs,
      respawnWindowEnd: killTime + respawnMs + varianceMs,
      killedBy: session?.username || 'Gracz',
      coords: boss.defaultCoords || { x: 500, y: 500 },
    };

    applyOptimisticKill(optimisticRecord);
    if (soundEnabled) {
      playBossKilledSound(soundVolume);
    }

    try {
      await submitBossKill({
        bossId: boss.id,
        channel: ch,
        killedAt: killTime,
        killedBy: session?.username || 'Gracz',
        coords: boss.defaultCoords || { x: 500, y: 500 },
      });
    } catch (err) {
      console.error(err);
      rollbackOptimisticKill(key, previousRecord);
      alert('Nie udało się zapisać zbicia bossa na serwerze.');
    }
  };

  const handleResetOnChannel = async (ch: ChannelId) => {
    if (!hasAdminRights) {
      alert('Tylko Administrator może resetować timery bossów.');
      return;
    }
    try {
      await resetSingleBossKill(boss.id, ch);
    } catch (err) {
      console.error(err);
      alert('Błąd resetowania timera.');
    }
  };

  return (
    <div
      id="boss-detail-modal-backdrop"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeBossDetailModal();
      }}
    >
      <div
        id="boss-detail-modal-card"
        className="bg-[#10141e] border border-amber-500/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-gray-200 my-auto ring-1 ring-amber-500/20"
      >
        {/* Universal Top Header with Metin2 flair and Portrait image */}
        <BossDetailHeader
          boss={boss}
          mapDef={mapDef}
          selectedChannel={selectedChannel}
          onShowOnMap={handleShowOnMap}
          onClose={closeBossDetailModal}
        />

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <BossDetailSpecsAndLore
            boss={boss}
            mapDef={mapDef}
            config={config}
            onShowOnMap={handleShowOnMap}
          />

          <BossDetailDrops boss={boss} />

          <BossDetailChannels
            bossId={boss.id}
            selectedChannel={selectedChannel}
            kills={kills}
            hasAdminRights={hasAdminRights}
            onKillOnChannel={handleKillOnChannel}
            onResetOnChannel={handleResetOnChannel}
          />
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-[#0a0d14] border-t border-gray-800 flex items-center justify-between text-xs text-gray-400 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-mono">Rola:</span>
            <span
              className={`font-bold font-mono text-[10px] px-2 py-0.5 rounded border ${
                hasAdminRights
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {hasAdminRights ? 'ADMINISTRATOR' : 'GRACZ / ŁOWCA'}
            </span>
          </div>

          <button
            onClick={closeBossDetailModal}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium text-xs transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
