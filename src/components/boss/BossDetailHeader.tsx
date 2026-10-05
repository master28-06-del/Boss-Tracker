import React, { useState, useEffect } from 'react';
import { BossDefinition, MapDefinition } from '../../types';
import { MapPin, ExternalLink, X, Flame, Skull, Ghost, Bug, Sparkles, Crown, Mic, Volume2 } from 'lucide-react';
import { speakBossOneMinuteCountdown, isSpeechSynthesisSupported } from '../../utils/speech';
import { useAppStore } from '../../store/useAppStore';

export const getFamilyInfo = (iconType: string) => {
  switch (iconType) {
    case 'dragon':
      return { label: 'Smok (Dragon)', icon: Flame, color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
    case 'demon':
      return { label: 'Diabeł (Demon)', icon: Skull, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' };
    case 'undead':
      return { label: 'Nieumarły (Undead)', icon: Ghost, color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' };
    case 'spider':
      return { label: 'Pajęczak (Spider)', icon: Bug, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
    case 'humanoid':
      return { label: 'Mistyk / Ezoteryk', icon: Sparkles, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
    case 'beast':
    default:
      return { label: 'Zwierzę / Bestia', icon: Crown, color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' };
  }
};

interface BossDetailHeaderProps {
  boss: BossDefinition;
  mapDef?: MapDefinition;
  selectedChannel: number;
  onShowOnMap: () => void;
  onClose: () => void;
}

export const BossDetailHeader: React.FC<BossDetailHeaderProps> = ({
  boss,
  mapDef,
  selectedChannel,
  onShowOnMap,
  onClose,
}) => {
  const family = getFamilyInfo(boss.iconType);
  const FamilyIcon = family.icon;
  const { voiceSettings } = useAppStore();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const canSpeak = isSpeechSynthesisSupported();

  const handlePreviewVoice = () => {
    if (!canSpeak) return;
    setIsSpeaking(true);
    speakBossOneMinuteCountdown({
      bossName: boss.name,
      channel: selectedChannel,
      mapName: voiceSettings.includeMapName ? mapDef?.name : undefined,
      volume: voiceSettings.volume,
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      lang: voiceSettings.language,
      voiceURI: voiceSettings.voiceURI,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <div className="relative p-4 sm:p-5 bg-gradient-to-r from-[#141926] via-[#1c2436] to-[#141926] border-b border-gray-800 flex items-start justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        {/* Visual Portrait / Image container */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#090c12] border-2 border-amber-500/50 flex items-center justify-center shrink-0 overflow-hidden shadow-xl ring-2 ring-amber-500/30">
          {boss.imageUrl ? (
            <img
              src={boss.imageUrl}
              alt={boss.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-amber-950/40 to-[#090c12]">
              <FamilyIcon className="w-8 h-8 text-amber-400 drop-shadow-md" />
              <span className="text-[9px] font-mono font-bold text-amber-500/90 uppercase mt-0.5">
                LVL {boss.level}
              </span>
            </div>
          )}
          {/* Level badge pill */}
          <div className="absolute bottom-0 inset-x-0 bg-black/90 py-0.5 text-center text-[10px] font-mono font-black text-amber-400 border-t border-amber-500/40">
            Lvl {boss.level}
          </div>
        </div>

        {/* Title & Classification */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase flex items-center gap-1 ${family.color}`}
            >
              <FamilyIcon className="w-3 h-3" />
              {family.label}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gray-800 text-gray-300 border border-gray-700">
              CH{selectedChannel}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-100 font-metin tracking-wide truncate">
            {boss.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-amber-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {mapDef?.name || boss.mapId}
            </span>
            <span className="text-gray-600">•</span>
            <span className="font-mono text-gray-400">
              Radar: X: {boss.defaultCoords?.x || 500}, Y: {boss.defaultCoords?.y || 500}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {canSpeak && (
          <button
            onClick={handlePreviewVoice}
            title="Odsłuchaj zapowiedź głosową (1 min) dla tego bossa"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500 text-gray-950 border-amber-400 animate-pulse shadow-md'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isSpeaking ? 'Mówi...' : 'Odsłuchaj'}
            </span>
          </button>
        )}

        <button
          onClick={onShowOnMap}
          title="Pokaż na radarze mapy"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Pokaż na mapie</span>
        </button>
        <button
          id="close-boss-detail-modal-btn"
          onClick={onClose}
          className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
