import React from 'react';
import { BossDefinition, ChannelId, MapDefinition, KillRecord } from '../../types';
import { MapPin, Flame, Sparkles, Clock } from 'lucide-react';

interface MatrixTableRowProps {
  boss: BossDefinition;
  mapDef?: MapDefinition;
  channels: ChannelId[];
  getBossChannelInfo: (
    bossId: string,
    channel: ChannelId
  ) => { isAlive: boolean; diffMs: number; isImminent: boolean; record?: KillRecord };
  formatTimer: (ms: number) => string;
  onCellKill: (bossId: string, channel: ChannelId) => void;
  onSelectMap: (mapId: string) => void;
}

export const MatrixTableRow: React.FC<MatrixTableRowProps> = ({
  boss,
  mapDef,
  channels,
  getBossChannelInfo,
  formatTimer,
  onCellKill,
  onSelectMap,
}) => {
  const aliveChannelsCount = channels.filter(
    (ch) => getBossChannelInfo(boss.id, ch).isAlive
  ).length;

  return (
    <tr className="hover:bg-gray-800/30 transition-colors">
      <td className="p-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-[#0e111a] border border-amber-500/30 flex items-center justify-center font-mono text-[10px] text-amber-400 font-bold shrink-0">
            {boss.level}
          </span>
          <div>
            <div className="font-bold text-gray-200 font-metin">{boss.name}</div>
            <div className="text-[10px] text-gray-500 font-mono md:hidden">{mapDef?.name}</div>
            {boss.drops && boss.drops.length > 0 && (
              <div className="text-[10px] text-gray-400 truncate max-w-[180px] sm:max-w-xs hidden lg:block">
                Drop: {boss.drops.slice(0, 2).join(', ')}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="p-3 text-gray-400 hidden md:table-cell">
        <button
          onClick={() => onSelectMap(boss.mapId)}
          className="hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
          title="Przejdź do tej mapy"
        >
          <MapPin className="w-3 h-3 text-amber-500" />
          <span>{mapDef?.name || boss.mapId}</span>
        </button>
      </td>

      {/* Summary alive badge */}
      <td className="p-3 text-center hidden sm:table-cell">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
            aliveChannelsCount === 6
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              : aliveChannelsCount > 0
              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
          }`}
        >
          {aliveChannelsCount} / 6 ŻYWYCH
        </span>
      </td>

      {channels.map((ch) => {
        const { isAlive, diffMs, isImminent } = getBossChannelInfo(boss.id, ch);

        return (
          <td key={ch} className="p-2 text-center">
            {isAlive ? (
              <button
                onClick={() => onCellKill(boss.id, ch)}
                title={`CH${ch} ŻYWY - Kliknij by oznaczyć jako zbity`}
                className="w-full py-1.5 px-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1 cursor-pointer group shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>ŻYWY</span>
                <Flame className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-300 transition-opacity" />
              </button>
            ) : isImminent ? (
              <button
                onClick={() => onCellKill(boss.id, ch)}
                title={`CH${ch} Okno Respu! Kliknij by zarejestrować nowe zbicie`}
                className="w-full py-1.5 px-2 rounded-lg bg-amber-950/50 hover:bg-amber-900/70 border border-amber-500/50 text-amber-300 text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm animate-pulse"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{formatTimer(diffMs)}</span>
              </button>
            ) : (
              <button
                onClick={() => onCellKill(boss.id, ch)}
                title={`CH${ch} Zbity. Kliknij by odnowić czas zbicia`}
                className="w-full py-1.5 px-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-600/40 text-rose-300 text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
              >
                <Clock className="w-3 h-3 text-rose-400" />
                <span>{formatTimer(diffMs)}</span>
              </button>
            )}
          </td>
        );
      })}
    </tr>
  );
};
