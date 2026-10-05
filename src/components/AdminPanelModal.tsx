import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { METIN2_BOSSES } from '../data/bosses';
import {
  adminResetTimers,
  adminUpdateBossConfig,
  deleteCustomMapMarker,
  adminBroadcastAnnouncement,
  fetchDatabaseUsers,
  updateUserRole,
  deleteDatabaseUser,
} from '../services/api';
import { DatabaseUser } from '../types';
import {
  Sliders,
  RotateCcw,
  Clock,
  Trash2,
  Megaphone,
  X,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { AdminResetTab } from './admin/AdminResetTab';
import { AdminCooldownsTab, ConfigFormData } from './admin/AdminCooldownsTab';
import { AdminMarkersTab } from './admin/AdminMarkersTab';
import { AdminBroadcastTab } from './admin/AdminBroadcastTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminMapsTab } from './admin/AdminMapsTab';
import { Map as MapIcon } from 'lucide-react';

export const AdminPanelModal: React.FC = () => {
  const {
    isAdminModalOpen,
    setAdminModalOpen,
    session,
    bossConfigs,
    customMarkers,
    systemAnnouncement,
    customMaps,
    customBosses,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'reset' | 'cooldowns' | 'markers' | 'broadcast' | 'users' | 'maps'>('reset');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState(systemAnnouncement?.text || '');

  // User database state
  const [usersList, setUsersList] = useState<DatabaseUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userOpFeedback, setUserOpFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const [selectedBossToEdit, setSelectedBossToEdit] = useState<string>(METIN2_BOSSES[0].id);

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const users = await fetchDatabaseUsers();
      setUsersList(users);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUserOpFeedback({ text: err.message, isError: true });
      }
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminModalOpen) {
      loadUsers();
    }
  }, [isAdminModalOpen, loadUsers]);

  const handleToggleRole = async (username: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'hunter' : 'admin';
    try {
      await updateUserRole(username, nextRole as 'admin' | 'hunter');
      setUserOpFeedback({
        text: `Zmieniono uprawnienia użytkownika ${username} na: ${
          nextRole === 'admin' ? 'ADMINISTRATOR' : 'ŁOWCA'
        }`,
      });
      await loadUsers();
      setTimeout(() => setUserOpFeedback(null), 3500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUserOpFeedback({ text: err.message, isError: true });
      }
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username.toLowerCase() === 'admin') {
      setUserOpFeedback({ text: 'Konto głównego administratora jest chronione', isError: true });
      return;
    }
    if (!window.confirm(`Czy na pewno chcesz bezpowrotnie usunąć konto gracza "${username}" z bazy danych?`)) {
      return;
    }
    try {
      await deleteDatabaseUser(username);
      setUserOpFeedback({ text: `Użytkownik ${username} został usunięty z bazy danych` });
      await loadUsers();
      setTimeout(() => setUserOpFeedback(null), 3500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUserOpFeedback({ text: err.message, isError: true });
      }
    }
  };

  if (!isAdminModalOpen || session?.role !== 'admin') return null;

  const handleResetChannel = async (channel?: number) => {
    try {
      await adminResetTimers(channel);
      setStatusFeedback(
        channel ? `Zresetowano timery dla CH${channel}` : 'Zresetowano WSZYSTKIE timery globalnie'
      );
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const onSaveConfig = async (data: ConfigFormData) => {
    try {
      await adminUpdateBossConfig(data);
      const bossDef = METIN2_BOSSES.find((b) => b.id === data.bossId);
      setStatusFeedback(`Zaktualizowano czas respawnu dla: ${bossDef?.name || data.bossId}`);
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMarker = async (id: string) => {
    try {
      await deleteCustomMapMarker(id);
      setStatusFeedback('Usunięto błędny znacznik');
      setTimeout(() => setStatusFeedback(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async (clear = false) => {
    try {
      await adminBroadcastAnnouncement(clear ? null : announcementText);
      if (clear) {
        setAnnouncementText('');
        setStatusFeedback('Ogłoszenie zostało wyczyszczone');
      } else {
        setStatusFeedback('Ogłoszenie wysłane do wszystkich połączonych graczy');
      }
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#121622] border border-red-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 bg-gradient-to-r from-red-950/40 via-[#161b28] to-red-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-rose-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-metin font-bold text-lg sm:text-xl text-gray-100 tracking-wide">
                  Panel Administratora
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600/30 text-rose-300 border border-red-500/40">
                  ROOT ACCESS
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Zarządzanie cooldownami, czyszczenie błędnych znaczników, reset timerów i ogłoszenia.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAdminModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Feedback Alert */}
        {statusFeedback && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 shadow animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-gray-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('reset')}
            className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reset'
                ? 'border-red-500 text-red-400 font-bold bg-red-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Timerów</span>
          </button>

          <button
            onClick={() => setActiveTab('cooldowns')}
            className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cooldowns'
                ? 'border-red-500 text-red-400 font-bold bg-red-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Edycja Czasów Respawnu</span>
          </button>

          <button
            onClick={() => setActiveTab('markers')}
            className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'markers'
                ? 'border-red-500 text-red-400 font-bold bg-red-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Usuwanie Znaczników ({customMarkers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'broadcast'
                ? 'border-red-500 text-red-400 font-bold bg-red-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Ogłoszenie Serwerowe</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('users');
              loadUsers();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-red-500 text-red-400 font-bold bg-red-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Baza Użytkowników {usersList.length > 0 ? `(${usersList.length})` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('maps')}
            className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'maps'
                ? 'border-red-500 text-red-400 font-bold bg-red-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Własne Mapy {customMaps.length > 0 ? `(${customMaps.length})` : ''}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-gray-300">
          {activeTab === 'reset' && (
            <AdminResetTab onResetChannel={handleResetChannel} />
          )}

          {activeTab === 'cooldowns' && (
            <AdminCooldownsTab
              selectedBossToEdit={selectedBossToEdit}
              onSelectBossToEdit={setSelectedBossToEdit}
              bossConfigs={bossConfigs}
              onSaveConfig={onSaveConfig}
            />
          )}

          {activeTab === 'markers' && (
            <AdminMarkersTab
              customMarkers={customMarkers}
              onDeleteMarker={handleDeleteMarker}
            />
          )}

          {activeTab === 'broadcast' && (
            <AdminBroadcastTab
              announcementText={announcementText}
              onChangeAnnouncementText={setAnnouncementText}
              onBroadcast={handleBroadcast}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              usersList={usersList}
              isLoadingUsers={isLoadingUsers}
              onRefreshUsers={loadUsers}
              userOpFeedback={userOpFeedback}
              session={session}
              onToggleRole={handleToggleRole}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'maps' && (
            <AdminMapsTab
              customMaps={customMaps}
              customBosses={customBosses}
            />
          )}
        </div>
      </div>
    </div>
  );
};
