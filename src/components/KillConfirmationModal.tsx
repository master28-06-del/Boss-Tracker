import React, { useState } from 'react';
import { useAppStore, useAllBosses, useAllMaps } from '../store/useAppStore';
import { submitBossKill, addCustomMapMarker } from '../services/api';
import { playBossKilledSound } from '../utils/sound';
import { X, Flame, MapPin, Crosshair } from 'lucide-react';
import { KillForm, KillFormData } from './kill/KillForm';
import { CustomMarkerForm, MarkerFormData } from './kill/CustomMarkerForm';

export const KillConfirmationModal: React.FC = () => {
  const {
    isKillModalOpen,
    closeKillModal,
    killModalPayload,
    selectedChannel,
    selectedMapId,
    session,
    soundEnabled,
    soundVolume,
    applyOptimisticKill,
    bossConfigs,
  } = useAppStore();

  const allBosses = useAllBosses();
  const allMaps = useAllMaps();

  const [mode, setMode] = useState<'kill' | 'marker'>('kill');

  const defaultBossId =
    killModalPayload?.bossId ||
    allBosses.find((b) => b.mapId === selectedMapId)?.id ||
    allBosses[0]?.id ||
    '';
  const defaultCoords = killModalPayload?.defaultCoords || { x: 500, y: 500 };

  if (!isKillModalOpen) return null;

  const onKillSubmit = async (data: KillFormData) => {
    const killedAt = Date.now() - data.timeOffsetMinutes * 60 * 1000;
    const boss = allBosses.find((b) => b.id === data.bossId);
    if (!boss) return;

    const config = bossConfigs[boss.id] || {
      respawnMinutes: boss.respawnMinutes,
      varianceMinutes: boss.varianceMinutes,
    };
    const respawnMs = config.respawnMinutes * 60 * 1000;

    applyOptimisticKill({
      id: `kill_${Date.now()}`,
      bossId: data.bossId,
      channel: data.channel as any,
      killedAt,
      respawnAt: killedAt + respawnMs,
      respawnWindowStart: killedAt + respawnMs - (config.varianceMinutes || 0) * 60 * 1000,
      respawnWindowEnd: killedAt + respawnMs + (config.varianceMinutes || 0) * 60 * 1000,
      killedBy: data.killerName || session?.username || 'Gracz',
      notes: data.notes,
      coords: { x: data.coordX, y: data.coordY },
    });

    if (soundEnabled) {
      playBossKilledSound(soundVolume);
    }

    try {
      await submitBossKill({
        bossId: data.bossId,
        channel: data.channel as any,
        killedAt,
        killedBy: data.killerName || session?.username || 'Gracz',
        notes: data.notes,
        coords: { x: data.coordX, y: data.coordY },
      });
    } catch (err) {
      console.error(err);
    }
    closeKillModal();
  };

  const onMarkerSubmit = async (data: MarkerFormData) => {
    try {
      await addCustomMapMarker({
        title: data.title,
        mapId: selectedMapId,
        channel: data.channel as any,
        coords: { x: data.coordX, y: data.coordY },
        createdBy: session?.username || 'Gracz',
        notes: data.notes,
        color: data.color,
      });
    } catch (err) {
      console.error(err);
    }
    closeKillModal();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141824] border border-gray-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-metin font-bold text-lg text-gray-100">
                {mode === 'kill' ? 'Rejestracja Zbicia Bossa' : 'Dodaj Znacznik Mapy'}
              </h3>
              <p className="text-xs text-gray-400">
                Współrzędne: X: {defaultCoords.x}, Y: {defaultCoords.y}
              </p>
            </div>
          </div>
          <button
            onClick={closeKillModal}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 my-4 bg-[#0e111a] p-1 rounded-xl border border-gray-800">
          <button
            type="button"
            onClick={() => setMode('kill')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'kill'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Zbicie Bossa (Timer)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('marker')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'marker'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Własny Znacznik (Metin / Spot)</span>
          </button>
        </div>

        {/* Content */}
        {mode === 'kill' ? (
          <KillForm
            allBosses={allBosses}
            selectedMapId={selectedMapId}
            defaultBossId={defaultBossId}
            defaultCoords={defaultCoords}
            selectedChannel={selectedChannel}
            initialKillerName={session?.username || 'Gracz'}
            onSubmit={onKillSubmit}
          />
        ) : (
          <CustomMarkerForm
            defaultCoords={defaultCoords}
            selectedChannel={selectedChannel}
            onSubmit={onMarkerSubmit}
          />
        )}
      </div>
    </div>
  );
};
