import React, { useState } from 'react';
import { MapDefinition, BossDefinition } from '../../types';
import { MapPin, Skull, Trash2, AlertCircle } from 'lucide-react';
import { DeleteMapConfirmModal } from '../map/DeleteMapConfirmModal';

interface AdminMapsTabProps {
  customMaps: MapDefinition[];
  customBosses: BossDefinition[];
}

export const AdminMapsTab: React.FC<AdminMapsTabProps> = ({
  customMaps,
  customBosses,
}) => {
  const [mapToDelete, setMapToDelete] = useState<MapDefinition | null>(null);

  if (customMaps.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500">
          <MapPin className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-gray-400">
          Brak własnych map w bazie serwera
        </p>
        <p className="text-xs text-gray-500 max-w-sm">
          Gracze nie dodali jeszcze żadnych niestandardowych krain.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            Zarządzanie Własnymi Mapami ({customMaps.length})
          </h4>
          <p className="text-[11px] text-gray-400">
            Jako administrator możesz usunąć niechciane lub testowe mapy dodane przez graczy.
          </p>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
        {customMaps.map((map) => {
          const mapBosses = customBosses.filter((b) => b.mapId === map.id);

          return (
            <div
              key={map.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#0e111a] border border-gray-800 hover:border-gray-700 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-12 h-12 rounded-lg shrink-0 overflow-hidden border border-gray-700 flex items-center justify-center bg-gray-900"
                  style={{ backgroundColor: map.theme?.bg || '#11141d' }}
                >
                  {map.imageUrl ? (
                    <img
                      src={map.imageUrl}
                      alt={map.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MapPin className="w-5 h-5 text-amber-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300 text-sm truncate font-metin">
                      ★ {map.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-gray-800 text-gray-300">
                      ID: {map.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-0.5">
                    <span>Autor: <strong className="text-gray-300">{map.createdBy || 'Gracz'}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Skull className="w-3 h-3 text-red-400" />
                      <span>{mapBosses.length} bossów</span>
                    </span>
                    <span>•</span>
                    <span>{map.recommendedLevel}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMapToDelete(map)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-400 hover:text-red-200 text-xs font-semibold transition cursor-pointer shrink-0 ml-3"
                title="Usuń tę mapę z serwera"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Usuń</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <DeleteMapConfirmModal
        map={mapToDelete}
        isOpen={Boolean(mapToDelete)}
        onClose={() => setMapToDelete(null)}
      />
    </div>
  );
};
