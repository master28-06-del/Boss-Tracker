import React from 'react';
import { UserSession } from '../../types';
import { Shield, Sliders, LogIn, LogOut } from 'lucide-react';

interface UserAuthBadgeProps {
  session: UserSession | null;
  onOpenAuthModal: () => void;
  onOpenAdminModal: () => void;
  onLogout: () => void;
  compact?: boolean;
}

export const UserAuthBadge: React.FC<UserAuthBadgeProps> = ({
  session,
  onOpenAuthModal,
  onOpenAdminModal,
  onLogout,
  compact = false,
}) => {
  if (!session) {
    return (
      <button
        onClick={onOpenAuthModal}
        className={`flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold shadow-md border border-amber-300 transition-all cursor-pointer shadow-amber-950/30 shrink-0 active:scale-95 ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        }`}
        title="Zaloguj się do systemu"
      >
        <LogIn className="w-3.5 h-3.5 text-gray-950 stroke-[2.5]" />
        <span>Logowanie</span>
      </button>
    );
  }

  const isAdmin = session.role === 'admin';

  return (
    <div className="flex items-center gap-1.5 pl-0.5 shrink-0">
      {isAdmin && (
        <button
          onClick={onOpenAdminModal}
          className={`flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-bold shadow-lg border border-red-500/50 cursor-pointer shrink-0 ${
            compact ? 'px-1.5 py-1 text-[10px]' : 'px-2 xl:px-2.5 py-1.5 text-xs'
          }`}
          title="Panel Administratora"
        >
          <Sliders className="w-3 h-3" />
          <span className={compact ? '' : 'hidden xl:inline'}>Admin</span>
        </button>
      )}

      <div
        className={`flex items-center gap-1.5 bg-[#151923] rounded-lg border border-gray-700 shrink-0 ${
          compact ? 'px-2 py-1 text-[11px]' : 'px-2 py-1.5 text-xs'
        }`}
        title={`${session.username} • Rola: ${isAdmin ? 'Administrator' : 'Łowca'}${
          session.characterClass ? ` • ${session.characterClass}` : ''
        }${session.guildName ? ` • Gildia: [${session.guildName}]` : ''}`}
      >
        <Shield className={`w-3.5 h-3.5 ${isAdmin ? 'text-rose-400' : 'text-amber-400'}`} />
        <div className="flex items-center gap-1">
          {session.guildName && !compact && (
            <span className="text-[10px] text-indigo-400 font-mono hidden 2xl:inline">
              [{session.guildName}]
            </span>
          )}
          <span
            className={`font-bold text-gray-200 truncate ${
              compact ? 'max-w-[70px]' : 'max-w-[80px] xl:max-w-[100px]'
            }`}
          >
            {session.username}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="ml-1 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
          title="Wyloguj"
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
