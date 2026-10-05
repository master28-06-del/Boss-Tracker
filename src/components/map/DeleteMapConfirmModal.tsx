import React, { useState } from 'react';
import { MapDefinition } from '../../types';
import { deleteCustomMap } from '../../services/api';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

interface DeleteMapConfirmModalProps {
  map: MapDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: (deletedMapId: string) => void;
}

export const DeleteMapConfirmModal: React.FC<DeleteMapConfirmModalProps> = ({
  map,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !map) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await deleteCustomMap(map.id);
      if (onDeleted) {
        onDeleted(map.id);
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || 'Wystąpił błąd podczas usuwania mapy.');
      } else {
        setErrorMsg('Wystąpił nieoczekiwany błąd podczas usuwania mapy.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-[#131620] border-2 border-red-600/70 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden text-stone-200"
        style={{
          boxShadow: '0 0 35px rgba(220, 38, 38, 0.35), inset 0 0 20px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-red-950/60 via-[#181c2b] to-red-950/60 border-b border-red-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-metin font-bold text-base sm:text-lg text-white tracking-wide">
                Usuń Własną Mapę
              </h3>
              <p className="text-[11px] text-gray-400">
                Potwierdzenie usunięcia krainy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-stone-800 transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-[#0c0f17] border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Nazwa mapy:</span>
              <span className="font-bold text-amber-300 font-metin text-sm">
                ★ {map.name}
              </span>
            </div>
            {map.category && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Kategoria:</span>
                <span className="text-gray-200 uppercase text-[11px] font-mono">
                  {map.category}
                </span>
              </div>
            )}
            {map.recommendedLevel && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Zalecany poziom:</span>
                <span className="text-gray-300 font-mono text-[11px]">
                  {map.recommendedLevel}
                </span>
              </div>
            )}
            {map.createdBy && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Twórca:</span>
                <span className="text-amber-400/90 text-xs">
                  {map.createdBy}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-rose-200/90 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <p>
              Czy na pewno chcesz usunąć tę mapę? Ta akcja jest{' '}
              <strong className="text-rose-300 underline">nieodwracalna</strong>.
              Zostaną bezpowrotnie usunięte wszystkie przypisane do niej bossy,
              ich timery zbić na wszystkich kanałach (CH1–CH6) oraz znaczniki.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#0e111a] border-t border-gray-800/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-950/60 transition cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Usuwanie...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Tak, usuń mapę</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
