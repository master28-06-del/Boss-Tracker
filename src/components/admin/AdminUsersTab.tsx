import React from 'react';
import { DatabaseUser, UserSession } from '../../types';
import { ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2, Swords, Trash2 } from 'lucide-react';

interface AdminUsersTabProps {
  usersList: DatabaseUser[];
  isLoadingUsers: boolean;
  onRefreshUsers: () => void;
  userOpFeedback: { text: string; isError?: boolean } | null;
  session: UserSession | null;
  onToggleRole: (username: string, currentRole: string) => Promise<void>;
  onDeleteUser: (username: string) => Promise<void>;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  usersList,
  isLoadingUsers,
  onRefreshUsers,
  userOpFeedback,
  session,
  onToggleRole,
  onDeleteUser,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-3.5 rounded-xl bg-[#0e121b] border border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-gray-100 text-sm">Baza Danych Kont Graczy</h4>
            <p className="text-[11px] text-gray-400">
              Plik: <span className="font-mono text-gray-300">data/users.json</span> • Haszowanie Scrypt + Salt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700">
            Konta: <strong className="text-white">{usersList.length}</strong>
          </span>
          <button
            type="button"
            onClick={onRefreshUsers}
            disabled={isLoadingUsers}
            className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 border border-gray-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
            <span>Odśwież</span>
          </button>
        </div>
      </div>

      {/* Feedback alert */}
      {userOpFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
            userOpFeedback.isError
              ? 'bg-rose-950/60 border-rose-600/50 text-rose-300'
              : 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
          }`}
        >
          {userOpFeedback.isError ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span>{userOpFeedback.text}</span>
        </div>
      )}

      {/* Users list */}
      {isLoadingUsers && usersList.length === 0 ? (
        <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
          <span>Pobieranie bazy danych użytkowników...</span>
        </div>
      ) : usersList.length === 0 ? (
        <div className="py-10 text-center text-gray-500 bg-[#0c1017] rounded-xl border border-gray-800">
          Brak zarejestrowanych użytkowników w bazie danych.
        </div>
      ) : (
        <div className="space-y-2.5">
          {usersList.map((user) => {
            const isRootAdmin = user.username.toLowerCase() === 'admin';
            const isSelf = user.username.toLowerCase() === session?.username.toLowerCase();

            return (
              <div
                key={user.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  user.role === 'admin'
                    ? 'bg-gradient-to-r from-[#181119] to-[#121622] border-red-900/40'
                    : 'bg-[#0f131d] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      user.role === 'admin'
                        ? 'bg-red-500/20 border-red-500/40 text-red-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}
                  >
                    {user.role === 'admin' ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <Swords className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-100 text-sm font-metin">{user.username}</span>

                      {isSelf && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/40 font-semibold">
                          Ty
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-red-900/50 text-red-200 border border-red-500/50'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {user.role === 'admin' ? 'Administrator' : 'Łowca'}
                      </span>

                      {user.characterClass && (
                        <span className="text-[11px] text-gray-300 bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700">
                          {user.characterClass}
                        </span>
                      )}

                      {user.guildName && (
                        <span className="text-[11px] text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-700/40">
                          Gildia: {user.guildName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1 flex-wrap">
                      <span>
                        Rejestracja:{' '}
                        <strong className="text-gray-300 font-mono">
                          {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Ostatnie logowanie:{' '}
                        <strong className="text-gray-300 font-mono">
                          {new Date(user.lastLoginAt).toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Zbicia bossów:{' '}
                        <strong className="text-amber-400 font-mono">{user.killsCount || 0}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {/* Toggle role button */}
                  <button
                    type="button"
                    onClick={() => onToggleRole(user.username, user.role)}
                    disabled={isRootAdmin}
                    title={
                      isRootAdmin
                        ? 'Główny administrator nie może zmienić roli'
                        : `Zmień rolę na ${user.role === 'admin' ? 'Łowca' : 'Admin'}`
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                      isRootAdmin
                        ? 'opacity-40 cursor-not-allowed bg-gray-800 text-gray-500 border-gray-700'
                        : user.role === 'admin'
                        ? 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border-amber-700/40'
                        : 'bg-red-950/40 hover:bg-red-900/50 text-red-200 border-red-700/40'
                    }`}
                  >
                    {user.role === 'admin' ? 'Degraduj do Łowcy' : 'Promuj na Admina'}
                  </button>

                  {/* Delete user button */}
                  <button
                    type="button"
                    onClick={() => onDeleteUser(user.username)}
                    disabled={isRootAdmin || isSelf}
                    title={
                      isRootAdmin
                        ? 'Nie można usunąć głównego konta administratora'
                        : isSelf
                        ? 'Nie możesz usunąć własnego aktywnego konta'
                        : 'Usuń użytkownika z bazy danych'
                    }
                    className={`p-1.5 rounded-lg text-xs transition-all border ${
                      isRootAdmin || isSelf
                        ? 'opacity-30 cursor-not-allowed bg-gray-800 text-gray-500 border-gray-700'
                        : 'bg-rose-950/50 hover:bg-rose-900 text-rose-300 border-rose-700/50 cursor-pointer'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
