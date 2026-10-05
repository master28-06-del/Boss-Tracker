import React from 'react';
import { ChannelId, MapDefinition, UserSession, DesktopNotificationSettings } from '../../types';
import { ChannelSwitcher } from './ChannelSwitcher';
import { VolumeControl } from './VolumeControl';
import { UserAuthBadge } from './UserAuthBadge';
import { Flame, BellRing, BellOff, Radio, Map as MapIcon, Grid, Database, Plus, Mic } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface MobileNavProps {
  selectedChannel: ChannelId;
  onSelectChannel: (channel: ChannelId) => void;
  selectedMapId: string;
  onSelectMapId: (mapId: string) => void;
  allMaps: MapDefinition[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  soundVolume: number;
  onChangeVolume: (volume: number) => void;
  serverConnected: boolean;
  notificationSettings: DesktopNotificationSettings;
  onOpenNotifications: () => void;
  session: UserSession | null;
  onOpenAuthModal: () => void;
  onOpenAdminModal: () => void;
  onLogout: () => void;
  onOpenAddMapModal: () => void;
  onOpenMatrixModal: () => void;
  onOpenItemDatabaseModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  selectedChannel,
  onSelectChannel,
  selectedMapId,
  onSelectMapId,
  allMaps,
  soundEnabled,
  onToggleSound,
  soundVolume,
  onChangeVolume,
  serverConnected,
  notificationSettings,
  onOpenNotifications,
  session,
  onOpenAuthModal,
  onOpenAdminModal,
  onLogout,
  onOpenAddMapModal,
  onOpenMatrixModal,
  onOpenItemDatabaseModal,
}) => {
  const { voiceSettings } = useAppStore();
  const hasActiveAlerts = notificationSettings.enabled || voiceSettings.enabled;

  return (
    <div className="flex lg:hidden flex-col w-full px-2.5 sm:px-4 py-2 gap-2">
      {/* Mobile Row 1: Brand + Status / User Controls */}
      <div className="flex items-center justify-between gap-1.5 w-full">
        {/* Logo & Title */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 to-red-800 border border-amber-400/40 shadow shrink-0">
            <Flame className="w-4 h-4 text-amber-200" />
          </div>
          <h1 className="font-metin font-bold text-sm text-gray-100 tracking-wider flex items-center gap-1">
            <span>METIN2</span>
            <span className="text-amber-400 hidden sm:inline">TRACKER</span>
          </h1>
        </div>

        {/* Quick status & profile buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Sound toggle */}
          <VolumeControl
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
            soundVolume={soundVolume}
            onChangeVolume={onChangeVolume}
            compact={true}
          />

          {/* Notifications & Voice Announcements */}
          <button
            onClick={onOpenNotifications}
            className={`relative p-1.5 rounded-lg border transition-all cursor-pointer shadow-sm ${
              hasActiveAlerts
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                : 'bg-[#151923] border-gray-700 text-gray-500'
            }`}
            title="Powiadomienia pulpitowe & lektor TTS"
          >
            {voiceSettings.enabled && !notificationSettings.enabled ? (
              <Mic className="w-3.5 h-3.5 text-amber-400" />
            ) : hasActiveAlerts ? (
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <BellOff className="w-3.5 h-3.5" />
            )}
            {hasActiveAlerts && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* SSE Live status */}
          <div
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-[#151923] border border-gray-800 text-[10px] font-mono text-gray-400"
            title={serverConnected ? 'Połączono z serwerem w czasie rzeczywistym' : 'Łączenie...'}
          >
            <Radio
              className={`w-3 h-3 ${serverConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`}
            />
          </div>

          {/* User / Login */}
          <UserAuthBadge
            session={session}
            onOpenAuthModal={onOpenAuthModal}
            onOpenAdminModal={onOpenAdminModal}
            onLogout={onLogout}
            compact={true}
          />
        </div>
      </div>

      {/* Mobile Row 2: Channels CH1-CH6 + Map Select + Quick Actions */}
      <div className="flex items-center gap-1.5 w-full overflow-x-auto pb-0.5 scrollbar-none">
        {/* Channel selector */}
        <ChannelSwitcher
          selectedChannel={selectedChannel}
          onSelectChannel={onSelectChannel}
          showLabel={false}
          size="sm"
        />

        {/* Map Select */}
        <div className="relative flex-1 min-w-[120px] flex items-center">
          <MapIcon className="w-3 h-3 text-amber-400 absolute left-2 pointer-events-none" />
          <select
            value={selectedMapId}
            onChange={(e) => onSelectMapId(e.target.value)}
            className="w-full pl-6 pr-4 py-1 bg-[#151923] border border-gray-700/80 rounded-lg text-xs text-gray-200 font-semibold focus:outline-none focus:border-amber-500 truncate appearance-none cursor-pointer"
          >
            {allMaps.some((m) => m.isCustom) && (
              <optgroup label="★ Własne Mapy">
                {allMaps
                  .filter((m) => m.isCustom)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      ★ {m.name}
                    </option>
                  ))}
              </optgroup>
            )}
            <optgroup label="Popularne Mapy">
              {allMaps
                .filter((m) => !m.isCustom && m.category === 'neutral')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Lochy i Instancje">
              {allMaps
                .filter((m) => !m.isCustom && m.category === 'dungeon')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Wszystkie Lokacje">
              {allMaps.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.isCustom ? `★ ${m.name}` : m.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Quick Tools Icons on Mobile */}
        <button
          onClick={onOpenMatrixModal}
          className="p-1.5 rounded-lg bg-[#151923] hover:bg-gray-800 border border-gray-700 text-amber-400 shrink-0 cursor-pointer shadow-sm"
          title="Otwórz matrycę statusów CH1-CH6"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenItemDatabaseModal}
          className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 shrink-0 cursor-pointer shadow-sm"
          title="Baza Dropu i Itemów"
        >
          <Database className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenAddMapModal}
          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0 cursor-pointer shadow-sm"
          title="Zarządzaj i dodawaj własne mapy"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
