import React from 'react';
import { ChannelId, MapDefinition, UserSession, DesktopNotificationSettings } from '../../types';
import { ChannelSwitcher } from './ChannelSwitcher';
import { MapSelectDropdown } from './MapSelectDropdown';
import { VolumeControl } from './VolumeControl';
import { UserAuthBadge } from './UserAuthBadge';
import { Flame, Plus, Grid, Database, BellRing, BellOff, Radio, Mic } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface DesktopNavProps {
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

export const DesktopNav: React.FC<DesktopNavProps> = ({
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
    <div className="hidden lg:flex max-w-[1700px] w-full mx-auto px-3 xl:px-5 py-2 items-center justify-between gap-2 xl:gap-3 2xl:gap-4 overflow-x-visible">
      {/* Zone 1: Brand & Logo */}
      <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 xl:w-9 xl:h-9 rounded-lg bg-gradient-to-br from-amber-600 to-red-800 border border-amber-400/40 shadow-lg shadow-amber-950/50 shrink-0">
          <Flame className="w-4 h-4 xl:w-5 xl:h-5 text-amber-200" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-metin font-bold text-base xl:text-lg text-gray-100 tracking-wider flex items-center gap-1">
              <span>METIN2</span>
              <span className="text-amber-400">TRACKER</span>
            </h1>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden 2xl:inline">
              PROD v2.5
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Channels Switcher + Map Selector */}
      <div className="flex items-center gap-2 xl:gap-3 shrink-0">
        <ChannelSwitcher
          selectedChannel={selectedChannel}
          onSelectChannel={onSelectChannel}
          showLabel={true}
          size="md"
        />
        <MapSelectDropdown
          selectedMapId={selectedMapId}
          onSelectMapId={onSelectMapId}
          allMaps={allMaps}
          widthClass="w-36 xl:w-44 2xl:w-56"
        />
      </div>

      {/* Zone 3: Action Controls + Audio + SSE + High-Priority Login/User */}
      <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
        {/* Add / Manage Custom Maps Button */}
        <button
          onClick={onOpenAddMapModal}
          className="flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 transition shadow cursor-pointer shrink-0"
          title="Zarządzaj i dodawaj własne mapy"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden 2xl:inline">Własne Mapy</span>
        </button>

        {/* Matrix CH1-CH6 Modal Trigger */}
        <button
          onClick={onOpenMatrixModal}
          className="flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-lg bg-[#151923] hover:bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-300 transition-colors shadow cursor-pointer shrink-0"
          title="Matryca statusów CH1 - CH6"
        >
          <Grid className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Matryca</span>
        </button>

        {/* Item Database Modal Trigger */}
        <button
          onClick={onOpenItemDatabaseModal}
          className="flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-700/50 text-xs font-semibold text-cyan-300 transition-colors shadow cursor-pointer shrink-0"
          title="Baza Wszystkich Przedmiotów i Dropów"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline">Baza Itemów</span>
        </button>

        {/* Sound Controls */}
        <VolumeControl
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          soundVolume={soundVolume}
          onChangeVolume={onChangeVolume}
          compact={false}
        />

        {/* Desktop Notifications & Speech Synthesis TTS Settings Trigger */}
        <button
          onClick={onOpenNotifications}
          className={`relative p-2 rounded-lg border transition-all cursor-pointer shadow shrink-0 ${
            hasActiveAlerts
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
              : 'bg-[#151923] border-gray-700 text-gray-500 hover:text-gray-400'
          }`}
          title={
            hasActiveAlerts
              ? `Centrum powiadomień aktywne (${[
                  notificationSettings.enabled ? 'Desktop' : null,
                  voiceSettings.enabled ? 'Lektor TTS' : null,
                ]
                  .filter(Boolean)
                  .join(' + ')})`
              : 'Konfiguracja powiadomień pulpitowych i lektora mowy (1 min)'
          }
        >
          {voiceSettings.enabled && !notificationSettings.enabled ? (
            <Mic className="w-3.5 h-3.5 text-amber-400" />
          ) : hasActiveAlerts ? (
            <BellRing className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <BellOff className="w-3.5 h-3.5" />
          )}

          {hasActiveAlerts && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#121620] animate-pulse" />
          )}
        </button>

        {/* Real-time SSE Connection Indicator */}
        <div
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#151923] border border-gray-800 text-[10px] font-mono text-gray-400 shrink-0"
          title={serverConnected ? 'Połączono w czasie rzeczywistym (SSE Synced)' : 'Łączenie z serwerem...'}
        >
          <Radio className={`w-3 h-3 ${serverConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span className="hidden 2xl:inline">{serverConnected ? 'LIVE' : 'SYNC...'}</span>
        </div>

        {/* Admin / Login - HIGH PRIORITY ALWAYS VISIBLE */}
        <UserAuthBadge
          session={session}
          onOpenAuthModal={onOpenAuthModal}
          onOpenAdminModal={onOpenAdminModal}
          onLogout={onLogout}
          compact={false}
        />
      </div>
    </div>
  );
};
