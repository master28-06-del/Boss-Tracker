import React, { useState } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface VolumeControlProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  soundVolume: number;
  onChangeVolume: (volume: number) => void;
  compact?: boolean;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  soundEnabled,
  onToggleSound,
  soundVolume,
  onChangeVolume,
  compact = false,
}) => {
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const { voiceSettings, setVoiceSettings, setNotificationModalOpen } = useAppStore();

  return (
    <div className="relative shrink-0">
      <button
        onClick={onToggleSound}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowVolumePopup(!showVolumePopup);
        }}
        className={`rounded-lg border transition-colors cursor-pointer shadow ${
          compact ? 'p-1.5' : 'p-2'
        } ${
          soundEnabled
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            : 'bg-[#151923] border-gray-700 text-gray-500 hover:text-gray-400'
        }`}
        title={
          soundEnabled
            ? 'Dźwięki włączone (PPM - zmiana głośności & lektor)'
            : 'Dźwięki wyciszone (PPM - suwak)'
        }
      >
        {soundEnabled ? (
          <Volume2 className={compact ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5'} />
        ) : (
          <VolumeX className={compact ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5'} />
        )}
      </button>

      {showVolumePopup && (
        <div className="absolute right-0 top-11 p-3 bg-[#161b26] border border-gray-700 rounded-xl shadow-2xl z-50 w-52 space-y-3 animate-in fade-in zoom-in-95 duration-100">
          {/* Master volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-300">
              <span className="font-semibold">Głośność:</span>
              <span className="font-mono text-amber-400">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Voice announcements quick toggle */}
          <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-300">
              {voiceSettings.enabled ? (
                <Mic className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <MicOff className="w-3.5 h-3.5 text-gray-500" />
              )}
              <span className="text-[11px] font-medium">Lektor (1 min)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={voiceSettings.enabled}
                onChange={(e) => setVoiceSettings({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Quick link to detailed voice & notification settings */}
          <button
            onClick={() => {
              setShowVolumePopup(false);
              setNotificationModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-[11px] text-gray-300 hover:text-white border border-gray-700/60 transition cursor-pointer"
          >
            <Settings className="w-3 h-3 text-amber-400" />
            <span>Więcej opcji lektora</span>
          </button>
        </div>
      )}
    </div>
  );
};
