import React from 'react';
import { Bell } from 'lucide-react';
import { SystemAnnouncement } from '../../types';

interface AnnouncementBannerProps {
  announcement: SystemAnnouncement | null;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcement }) => {
  if (!announcement) return null;

  return (
    <div className="bg-gradient-to-r from-amber-950 via-red-950 to-amber-950 border-b border-amber-600/40 px-3 py-1 flex items-center justify-between text-xs text-amber-200">
      <div className="flex items-center gap-2 max-w-7xl mx-auto overflow-hidden text-ellipsis whitespace-nowrap w-full">
        <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
        <span className="font-bold text-amber-400 font-mono text-[11px]">OGŁOSZENIE:</span>
        <span className="font-medium truncate text-xs">{announcement.text}</span>
        <span className="text-[10px] text-amber-500/80 font-mono shrink-0">
          ({announcement.author})
        </span>
      </div>
    </div>
  );
};
