import React from 'react';

interface MapCompassAndRadarProps {
  selectedChannel: number;
  radarCoordsRef: React.RefObject<HTMLSpanElement | null>;
}

export const MapCompassAndRadar: React.FC<MapCompassAndRadarProps> = ({
  selectedChannel,
  radarCoordsRef,
}) => {
  return (
    <>
      {/* Metin2 In-Game Compass Rose (Top Right of map) */}
      <div className="absolute top-3 right-3 pointer-events-none z-[400] opacity-80 hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 rounded-full bg-black/70 backdrop-blur border border-amber-500/40 shadow-xl flex items-center justify-center relative">
          <span className="absolute top-0.5 text-[9px] font-bold text-amber-400 font-mono">N</span>
          <span className="absolute bottom-0.5 text-[9px] font-bold text-gray-400 font-mono">S</span>
          <span className="absolute left-1 text-[9px] font-bold text-gray-400 font-mono">W</span>
          <span className="absolute right-1 text-[9px] font-bold text-gray-400 font-mono">E</span>
          <div className="w-3 h-3 rotate-45 border-t-2 border-l-2 border-amber-400" />
        </div>
      </div>

      {/* Real-time Radar Coordinates Indicator (Metin2 radar HUD) */}
      <div className="absolute bottom-3 left-3 z-[400] pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f172a]/95 backdrop-blur-md border border-amber-500/40 shadow-xl text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-400">RADAR:</span>
          <span ref={radarCoordsRef} className="text-gray-500 italic">
            Najedź na mapę
          </span>
          <span className="text-amber-400/90 font-bold ml-1 font-mono">CH{selectedChannel}</span>
        </div>
      </div>
    </>
  );
};
