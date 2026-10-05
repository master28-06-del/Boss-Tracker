import React from 'react';
import { ChannelId, KillRecord } from '../../types';
import { Swords, Flame, RotateCcw } from 'lucide-react';

interface BossDetailChannelsProps {
  bossId: string;
  selectedChannel: number;
  kills: Record<string, KillRecord>;
  hasAdminRights: boolean;
  onKillOnChannel: (ch: ChannelId) => void;
  onResetOnChannel: (ch: ChannelId) => void;
}

export const BossDetailChannels: React.FC<BossDetailChannelsProps> = ({
  bossId,
  selectedChannel,
  kills,
  hasAdminRights,
  onKillOnChannel,
  onResetOnChannel,
}) => {
  const now = Date.now();

  return (
    <div className="bg-[#090c13] border border-gray-800/90 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
          <Swords className="w-4 h-4 text-amber-400" />
          <span>Stan na kanałach (CH1 - CH6)</span>
        </div>
        <span className="text-[11px] text-gray-400">
          Aktywny radar: <span className="font-bold text-amber-400 font-mono">CH{selectedChannel}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {([1, 2, 3, 4, 5, 6] as ChannelId[]).map((ch) => {
          const key = `${bossId}_ch${ch}`;
          const record = kills[key];
          const isAlive = !record || record.respawnAt <= now;
          const diff = record ? record.respawnAt - now : 0;
          const isCurrent = ch === selectedChannel;

          return (
            <div
              key={ch}
              className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                isCurrent
                  ? 'bg-[#161f30] border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-[#121622] border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-xs text-amber-400">CH{ch}</span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isAlive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {isAlive ? 'ŻYWY' : 'ZBITY'}
                </span>
              </div>

              <div className="text-[11px] font-mono">
                {isAlive ? (
                  <span className="text-emerald-400 font-bold">Może się pojawić</span>
                ) : (
                  <span className="text-rose-400">
                    Resp za: {Math.max(0, Math.ceil(diff / 60000))}m
                  </span>
                )}
              </div>

              {/* Actions per channel */}
              <div className="pt-1.5 border-t border-gray-800/80 flex items-center gap-1.5">
                <button
                  onClick={() => onKillOnChannel(ch)}
                  title={`Oznacz zbicie bossa na CH${ch}`}
                  className="flex-1 py-1 px-2 bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-white rounded-lg text-[10px] font-bold transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Flame className="w-2.5 h-2.5 text-amber-200" />
                  <span>Zbity</span>
                </button>

                {record && hasAdminRights && (
                  <button
                    onClick={() => onResetOnChannel(ch)}
                    title="Resetuj timer (Uprawnienie Admina)"
                    className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
