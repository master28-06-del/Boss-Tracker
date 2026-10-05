import React from 'react';
import { Megaphone } from 'lucide-react';

interface AdminBroadcastTabProps {
  announcementText: string;
  onChangeAnnouncementText: (text: string) => void;
  onBroadcast: (clear?: boolean) => Promise<void>;
}

export const AdminBroadcastTab: React.FC<AdminBroadcastTabProps> = ({
  announcementText,
  onChangeAnnouncementText,
  onBroadcast,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold text-gray-300 mb-1.5">
          Treść ogłoszenia na górnym pasku:
        </label>
        <textarea
          rows={3}
          value={announcementText}
          onChange={(e) => onChangeAnnouncementText(e.target.value)}
          placeholder="np. Przerwa konserwacyjna o 14:00. Wszystkie bossy zrespią się po restarcie!"
          className="w-full p-3 bg-[#0e111a] border border-gray-700 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onBroadcast(false)}
          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <Megaphone className="w-4 h-4" />
          <span>Wyślij Ogłoszenie Serwerowe</span>
        </button>

        <button
          type="button"
          onClick={() => onBroadcast(true)}
          className="py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-colors cursor-pointer border border-gray-700"
        >
          Wyczyść
        </button>
      </div>
    </div>
  );
};
