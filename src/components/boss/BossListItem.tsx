import React from 'react';
import { BossDefinition, ChannelId, KillRecord, BossStatus } from '../../types';
import {
  Clock,
  MapPin,
  Flame,
  RotateCcw,
  Info,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BossListItemProps {
  boss: BossDefinition;
  selectedChannel: ChannelId;
  record?: KillRecord;
  kills: Record<string, KillRecord>;
  bossConfig: { respawnMinutes: number; varianceMinutes?: number };
  currentTime: number;
  mapName?: string;
  isAdmin: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onKill: (boss: BossDefinition) => void;
  onReset: (bossId: string) => void;
  onOpenDetails: (boss: BossDefinition) => void;
  onSelectMap: (mapId: string) => void;
}

export const BossListItem: React.FC<BossListItemProps> = ({
  boss,
  selectedChannel,
  record,
  kills,
  bossConfig,
  currentTime,
  mapName,
  isAdmin,
  isExpanded,
  onToggleExpand,
  onKill,
  onReset,
  onOpenDetails,
  onSelectMap,
}) => {
  const respawnDurationMs = bossConfig.respawnMinutes * 60 * 1000;

  // Calculate status and remaining seconds
  let status: BossStatus = 'alive';
  let remainingSec = 0;
  let progressPct = 100;
  let statusText = 'ŻYWY (Gotowy)';

  if (record) {
    const diff = record.respawnAt - currentTime;
    const windowStart = record.respawnAt - (bossConfig.varianceMinutes || 0) * 60 * 1000;

    if (diff <= 0) {
      const overdueMins = Math.floor(Math.abs(diff) / 60000);
      status = 'alive';
      remainingSec = 0;
      progressPct = 100;
      statusText = `ŻYWY (+${overdueMins}m)`;
    } else {
      const elapsed = currentTime - record.killedAt;
      progressPct = Math.min(100, Math.max(0, (elapsed / respawnDurationMs) * 100));
      remainingSec = Math.floor(diff / 1000);

      if (currentTime >= windowStart) {
        status = 'imminent';
        statusText = 'OKNO RESPU';
      } else {
        status = 'dead';
        statusText = 'MARTWY';
      }
    }
  }

  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="pt-2 first:pt-0 group rounded-lg bg-[#151923]/60 hover:bg-[#181d2a] border border-gray-800/80 hover:border-amber-500/40 transition-all p-3 shadow-md">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <button
            onClick={() => onOpenDetails(boss)}
            title="Kliknij, aby otworzyć szczegóły bossa i drop"
            className="w-9 h-9 rounded-lg bg-[#0e111a] border border-amber-500/40 hover:border-amber-400 flex flex-col items-center justify-center font-mono font-bold shrink-0 shadow-inner hover:scale-105 transition-transform cursor-pointer"
          >
            <span className="text-[9px] text-gray-400 uppercase leading-none">LVL</span>
            <span className="text-amber-400 text-xs leading-tight">{boss.level}</span>
          </button>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => onOpenDetails(boss)}
                className="font-bold text-sm text-gray-100 hover:text-amber-300 font-metin tracking-wide text-left transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>{boss.name}</span>
                <Info className="w-3 h-3 text-amber-500/70" />
              </button>
              {boss.isCustom && (
                <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-mono">
                  Własny
                </span>
              )}
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                  status === 'alive'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : status === 'imminent'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {statusText}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
              <button
                onClick={() => onSelectMap(boss.mapId)}
                className="hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>{mapName || boss.mapId}</span>
              </button>
              <span className="font-mono text-gray-500">
                ({boss.defaultCoords.x}, {boss.defaultCoords.y})
              </span>
            </div>
          </div>
        </div>

        {/* Channel overview dots (CH1-CH6 status dots for this boss) */}
        <div className="flex items-center gap-1 bg-[#0e111a] px-1.5 py-1 rounded border border-gray-800 shrink-0">
          {([1, 2, 3, 4, 5, 6] as ChannelId[]).map((ch) => {
            const chRecord = kills[`${boss.id}_ch${ch}`];
            const chAlive = !chRecord || chRecord.respawnAt <= currentTime;
            return (
              <div
                key={ch}
                title={`CH${ch}: ${chAlive ? 'ŻYWY' : 'Martwy'}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  ch === selectedChannel ? 'ring-1 ring-white' : ''
                } ${chAlive ? 'bg-emerald-500' : 'bg-rose-500'}`}
              />
            );
          })}
        </div>
      </div>

      {/* Live Countdown & Progress Bar */}
      <div className="mt-3 bg-[#0d1017] p-2.5 rounded-lg border border-gray-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {status === 'alive' ? 'Status odrodzenia:' : 'Następny resp za:'}
          </span>
          <span
            className={`font-bold text-sm ${
              status === 'alive'
                ? 'text-emerald-400'
                : status === 'imminent'
                ? 'text-amber-300 animate-pulse'
                : 'text-rose-400'
            }`}
          >
            {status === 'alive' ? 'READY' : formatCountdown(remainingSec)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              status === 'alive'
                ? 'bg-emerald-500'
                : status === 'imminent'
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-rose-600 to-amber-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {record && (
          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
            <span>
              Zbity: {new Date(record.killedAt).toLocaleTimeString()} ({record.killedBy})
            </span>
            <span>Respawn: {new Date(record.respawnAt).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="mt-2.5 flex items-center gap-2">
        <button
          onClick={() => onKill(boss)}
          className="flex-1 py-1.5 px-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Flame className="w-3.5 h-3.5 text-amber-200 shrink-0" />
          <span className="truncate">
            <span className="hidden sm:inline">{record ? 'ZBIJ PONOWNIE' : 'OZNACZ JAKO ZBITY'}</span>
            <span className="sm:hidden">{record ? 'ZBIJ' : 'ZBITY'}</span> (CH{selectedChannel})
          </span>
        </button>

        {/* Reset button: Protected by Admin privilege */}
        {record && (
          <button
            onClick={() => onReset(boss.id)}
            title={
              isAdmin
                ? 'Resetuj timer tego bossa (Admin)'
                : 'Resetowanie timera wymaga uprawnień Administratora'
            }
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isAdmin
                ? 'bg-gray-800 hover:bg-gray-700 text-amber-400 border-gray-700'
                : 'bg-gray-900/60 text-gray-600 border-gray-800 hover:text-gray-500'
            }`}
          >
            {isAdmin ? <RotateCcw className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Details modal launcher */}
        <button
          onClick={() => onOpenDetails(boss)}
          className="py-1.5 px-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          title="Otwórz okno szczegółów bossa, historii i dropu"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Szczegóły</span>
        </button>

        <button
          onClick={onToggleExpand}
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 border border-gray-700 transition-colors cursor-pointer"
          title="Rozwiń szybki podgląd"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Boss Lore & Drop list */}
      {isExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-800 text-xs text-gray-300 space-y-2 animate-in fade-in duration-150">
          <p className="text-[11px] text-gray-400 leading-relaxed italic">{boss.description}</p>

          {boss.spawnLocationName && (
            <div className="text-[11px] text-gray-300">
              <span className="text-gray-500 font-mono">Lokalizacja respu: </span>
              <span className="text-amber-300 font-medium">{boss.spawnLocationName}</span>
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Cenne dropy:
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {boss.notableDropsList?.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-[#0d1017] border border-amber-500/30 text-[10px] text-amber-200 font-medium"
                >
                  {item.name}
                </span>
              )) ||
                boss.drops.map((drop, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-[#0d1017] border border-gray-700/80 text-[10px] text-gray-200 font-medium"
                  >
                    {drop}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
