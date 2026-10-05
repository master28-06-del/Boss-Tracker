import React from 'react';
import { ChannelId } from '../../types';

interface ChannelSwitcherProps {
  selectedChannel: ChannelId;
  onSelectChannel: (channel: ChannelId) => void;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const CHANNELS: ChannelId[] = [1, 2, 3, 4, 5, 6];

export const ChannelSwitcher: React.FC<ChannelSwitcherProps> = ({
  selectedChannel,
  onSelectChannel,
  showLabel = true,
  size = 'md',
}) => {
  return (
    <div className={`flex items-center bg-[#151923] rounded-xl border border-gray-800 shadow-inner shrink-0 ${
      size === 'sm' ? 'p-0.5 gap-0.5' : 'p-1 gap-0.5 xl:gap-1'
    }`}>
      {showLabel && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 font-mono hidden xl:inline">
          KANAŁ:
        </span>
      )}
      <div className={`flex items-center ${size === 'sm' ? 'gap-0.5' : 'gap-0.5 xl:gap-1'}`}>
        {CHANNELS.map((ch) => {
          const isActive = selectedChannel === ch;
          return (
            <button
              key={ch}
              onClick={() => onSelectChannel(ch)}
              className={`font-mono font-bold transition-all cursor-pointer ${
                size === 'sm'
                  ? 'px-2 py-1 rounded text-xs'
                  : 'px-2 xl:px-2.5 py-1 rounded-lg text-xs'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 shadow-md scale-105 border border-amber-300'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              CH{ch}
            </button>
          );
        })}
      </div>
    </div>
  );
};
