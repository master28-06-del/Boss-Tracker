import React from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

interface AdminResetTabProps {
  onResetChannel: (channel?: number) => void;
}

export const AdminResetTab: React.FC<AdminResetTabProps> = ({ onResetChannel }) => {
  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-200 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Awaryjny reset timerów</div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            Przydatne po restarcie serwera gry, przerwie technicznej lub zbugowaniu timerów w gildii.
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-200 mb-2">Resetuj wybrany kanał:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((ch) => (
            <button
              key={ch}
              onClick={() => onResetChannel(ch)}
              className="p-2.5 rounded-xl bg-[#171c29] hover:bg-red-950/50 border border-gray-700 hover:border-red-500/50 text-gray-200 font-bold flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Wyczyść CH{ch}</span>
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-800">
        <button
          onClick={() => onResetChannel(undefined)}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-700 hover:to-rose-800 text-white font-bold shadow-xl border border-red-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>RESETUJ WSZYSTKIE TIMER-Y NA WSZYSTKICH KANAŁACH (GLOBALNIE)</span>
        </button>
      </div>
    </div>
  );
};
