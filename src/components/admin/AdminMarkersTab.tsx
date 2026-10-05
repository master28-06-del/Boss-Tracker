import React from 'react';
import { CustomMarker } from '../../types';
import { Trash2 } from 'lucide-react';

interface AdminMarkersTabProps {
  customMarkers: CustomMarker[];
  onDeleteMarker: (id: string) => void;
}

export const AdminMarkersTab: React.FC<AdminMarkersTabProps> = ({
  customMarkers,
  onDeleteMarker,
}) => {
  return (
    <div className="space-y-3">
      <p className="text-gray-400 text-xs">
        Lista znaczników postawionych na mapie przez graczy. Administrator może usunąć trollujące lub błędne pozycje.
      </p>

      {customMarkers.length === 0 ? (
        <div className="py-8 text-center text-gray-500">Brak niestandardowych znaczników na mapach.</div>
      ) : (
        <div className="divide-y divide-gray-800/80 border border-gray-800 rounded-xl overflow-hidden bg-[#0e111a]">
          {customMarkers.map((m) => (
            <div key={m.id} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-800/30">
              <div>
                <div className="font-bold text-gray-200 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color || '#38bdf8' }} />
                  <span>{m.title}</span>
                  <span className="text-[10px] font-mono text-amber-400">CH{m.channel}</span>
                </div>
                {m.notes && (
                  <div className="mt-1 text-xs text-amber-200/90 italic bg-amber-950/20 border border-amber-500/20 px-2 py-0.5 rounded max-w-lg">
                    „{m.notes}”
                  </div>
                )}
                <div className="text-[11px] text-gray-400 mt-1">
                  Mapa: <span className="text-gray-300">{m.mapId}</span> | Współrzędne:{' '}
                  <span className="font-mono text-gray-300">
                    X: {m.coords.x}, Y: {m.coords.y}
                  </span>{' '}
                  | Dodał: <span className="text-cyan-300 font-semibold">{m.createdBy}</span>
                </div>
              </div>

              <button
                onClick={() => onDeleteMarker(m.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Usuń</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
