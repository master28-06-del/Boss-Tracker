import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Shield, User, X, UserPlus } from 'lucide-react';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto p-2.5 sm:p-4 flex items-center justify-center min-h-full bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-md bg-[#141822] border border-gray-700/90 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto flex flex-col max-h-[92dvh] overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-metin font-bold text-base sm:text-lg text-gray-100 flex items-center gap-2">
                <span>{mode === 'login' ? 'Logowanie Łowcy' : 'Rejestracja Konta'}</span>
                <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DB Synced
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                {mode === 'login'
                  ? 'Wprowadź dane konta z bazy danych użytkowników'
                  : 'Stwórz nowe konto łowcy w bazie danych serwera'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            title="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0b0e14] rounded-xl border border-gray-800 my-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Logowanie</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Rejestracja</span>
          </button>
        </div>

        {/* Scrollable Form Body - Guarantees full accessibility on small mobile screens */}
        <div className="overflow-y-auto pr-0.5 space-y-3 flex-1 scrollbar-thin">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleClose}
              onSwitchToRegister={() => setMode('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={handleClose}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
