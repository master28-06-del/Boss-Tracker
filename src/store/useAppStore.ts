import { useMemo } from 'react';
import { create } from 'zustand';
import { ChannelId, Coordinates, KillRecord, CustomMarker, BossConfigItem, SystemAnnouncement, UserSession, BossDefinition, MapDefinition, DesktopNotificationSettings, VoiceAnnouncementSettings } from '../types';
import { METIN2_MAPS } from '../data/maps';
import { METIN2_BOSSES } from '../data/bosses';

interface AppState {
  // Navigation & filters
  selectedChannel: ChannelId;
  selectedMapId: string;
  searchQuery: string;
  statusFilter: 'all' | 'alive' | 'dead' | 'imminent';
  
  // Audio & Notification settings
  soundEnabled: boolean;
  soundVolume: number;
  voiceSettings: VoiceAnnouncementSettings;
  notificationSettings: DesktopNotificationSettings;
  isNotificationModalOpen: boolean;

  // Custom maps and bosses
  customMaps: MapDefinition[];
  customBosses: BossDefinition[];

  // Real-time synchronization data
  kills: Record<string, KillRecord>;
  customMarkers: CustomMarker[];
  bossConfigs: Record<string, BossConfigItem>;
  systemAnnouncement: SystemAnnouncement | null;
  serverConnected: boolean;
  serverTimeOffset: number; // local - server

  // User authentication
  session: UserSession | null;

  // Modals state
  isAuthModalOpen: boolean;
  isAdminModalOpen: boolean;
  isMatrixModalOpen: boolean;
  isKillModalOpen: boolean;
  killModalPayload: { bossId?: string; defaultCoords?: Coordinates } | null;
  isAddMapModalOpen: boolean;
  isItemDatabaseModalOpen: boolean;

  // Boss detailed view modal
  isBossDetailModalOpen: boolean;
  selectedBossForDetails: BossDefinition | null;

  // In-map click interaction pin (clean, non-blocking)
  activeMapPin: Coordinates | null;

  // Actions
  setSelectedChannel: (ch: ChannelId) => void;
  setSelectedMapId: (mapId: string) => void;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (filter: 'all' | 'alive' | 'dead' | 'imminent') => void;
  
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setVoiceSettings: (settings: Partial<VoiceAnnouncementSettings>) => void;
  setNotificationSettings: (settings: Partial<DesktopNotificationSettings>) => void;
  setNotificationModalOpen: (open: boolean) => void;

  setSession: (session: UserSession | null) => void;
  setServerConnected: (connected: boolean) => void;
  setServerTimeOffset: (offset: number) => void;

  // Data update handlers
  setFullState: (payload: {
    kills: Record<string, KillRecord>;
    customMarkers: CustomMarker[];
    bossConfigs: Record<string, BossConfigItem>;
    announcement?: SystemAnnouncement | null;
    customMaps?: MapDefinition[];
    customBosses?: BossDefinition[];
    serverTime?: number;
  }) => void;
  
  applyOptimisticKill: (record: KillRecord) => void;
  rollbackOptimisticKill: (key: string, previousRecord?: KillRecord) => void;
  applyKillRecord: (record: KillRecord) => void;
  removeKillRecord: (key: string) => void;
  updateBossConfig: (config: BossConfigItem) => void;
  setCustomMarkers: (markers: CustomMarker[]) => void;
  addCustomMarker: (marker: CustomMarker) => void;
  removeCustomMarker: (id: string) => void;
  setSystemAnnouncement: (announcement: SystemAnnouncement | null) => void;

  // Custom Maps & Bosses Actions
  addCustomMap: (map: MapDefinition, boss?: BossDefinition | null) => void;
  removeCustomMap: (mapId: string, removedBossIds?: string[]) => void;
  addCustomBoss: (boss: BossDefinition) => void;
  removeCustomBoss: (bossId: string) => void;

  // Modal toggles
  setAuthModalOpen: (open: boolean) => void;
  setAdminModalOpen: (open: boolean) => void;
  setMatrixModalOpen: (open: boolean) => void;
  setAddMapModalOpen: (open: boolean) => void;
  setItemDatabaseModalOpen: (open: boolean) => void;
  openKillModal: (payload?: { bossId?: string; defaultCoords?: Coordinates }) => void;
  closeKillModal: () => void;
  openBossDetailModal: (boss: BossDefinition) => void;
  closeBossDetailModal: () => void;
  setActiveMapPin: (coords: Coordinates | null) => void;
}

function getInitialSession(): UserSession | null {
  try {
    const raw = localStorage.getItem('mt2_tracker_session');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore error
  }
  return null;
}

function getInitialVoiceSettings(): VoiceAnnouncementSettings {
  const defaults: VoiceAnnouncementSettings = {
    enabled: false,
    volume: 0.8,
    rate: 1.05,
    pitch: 1.0,
    language: 'pl-PL',
    onlyCurrentMap: false,
    includeMapName: false,
  };
  try {
    const raw = localStorage.getItem('mt2_tracker_voice_settings');
    if (raw) {
      return { ...defaults, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore error
  }
  return defaults;
}

function getInitialNotificationSettings(): DesktopNotificationSettings {
  const defaults: DesktopNotificationSettings = {
    enabled: false,
    onRespawn: true,
    onImminent: true,
    imminentMinutes: 2,
    onKill: true,
    onAnnouncement: true,
    onlyCurrentMap: false,
    soundWithNotification: true,
  };
  try {
    const raw = localStorage.getItem('mt2_tracker_notifications');
    if (raw) {
      return { ...defaults, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore error
  }
  return defaults;
}

export const useAppStore = create<AppState>((set) => ({
  selectedChannel: 1,
  selectedMapId: 'dolina_seungryong',
  searchQuery: '',
  statusFilter: 'all',

  soundEnabled: true,
  soundVolume: 0.6,
  voiceSettings: getInitialVoiceSettings(),
  notificationSettings: getInitialNotificationSettings(),
  isNotificationModalOpen: false,

  customMaps: [],
  customBosses: [],

  kills: {},
  customMarkers: [],
  bossConfigs: {},
  systemAnnouncement: null,
  serverConnected: false,
  serverTimeOffset: 0,

  session: getInitialSession(),

  isAuthModalOpen: false,
  isAdminModalOpen: false,
  isMatrixModalOpen: false,
  isKillModalOpen: false,
  killModalPayload: null,
  isAddMapModalOpen: false,
  isItemDatabaseModalOpen: false,

  isBossDetailModalOpen: false,
  selectedBossForDetails: null,
  activeMapPin: null,

  setSelectedChannel: (ch) => set({ selectedChannel: ch }),
  setSelectedMapId: (mapId) => set({ selectedMapId: mapId }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),

  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setSoundVolume: (volume) => set({ soundVolume: volume }),

  setVoiceSettings: (newSettings) =>
    set((state) => {
      const updated = { ...state.voiceSettings, ...newSettings };
      try {
        localStorage.setItem('mt2_tracker_voice_settings', JSON.stringify(updated));
      } catch (err) {
        // Ignore error
      }
      return { voiceSettings: updated };
    }),

  setNotificationSettings: (newSettings) =>
    set((state) => {
      const updated = { ...state.notificationSettings, ...newSettings };
      try {
        localStorage.setItem('mt2_tracker_notifications', JSON.stringify(updated));
      } catch (err) {
        // Ignore error
      }
      return { notificationSettings: updated };
    }),
  setNotificationModalOpen: (open) => set({ isNotificationModalOpen: open }),

  setSession: (session) => {
    try {
      if (session) {
        localStorage.setItem('mt2_tracker_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('mt2_tracker_session');
      }
    } catch {
      // Ignore error
    }
    set({ session });
  },
  setServerConnected: (connected) => set({ serverConnected: connected }),
  setServerTimeOffset: (offset) => set({ serverTimeOffset: offset }),

  setFullState: (payload) => set((state) => ({
    kills: payload.kills || {},
    customMarkers: payload.customMarkers || [],
    bossConfigs: payload.bossConfigs || {},
    systemAnnouncement: payload.announcement !== undefined ? payload.announcement : state.systemAnnouncement,
    customMaps: payload.customMaps || [],
    customBosses: payload.customBosses || [],
  })),

  applyOptimisticKill: (record) => set((state) => {
    const key = `${record.bossId}_ch${record.channel}`;
    return {
      kills: {
        ...state.kills,
        [key]: record,
      },
    };
  }),

  rollbackOptimisticKill: (key, previousRecord) => set((state) => {
    const newKills = { ...state.kills };
    if (previousRecord) {
      newKills[key] = previousRecord;
    } else {
      delete newKills[key];
    }
    return { kills: newKills };
  }),

  applyKillRecord: (record) => set((state) => {
    const key = `${record.bossId}_ch${record.channel}`;
    return {
      kills: {
        ...state.kills,
        [key]: record,
      },
    };
  }),

  removeKillRecord: (key) => set((state) => {
    const newKills = { ...state.kills };
    delete newKills[key];
    return { kills: newKills };
  }),

  updateBossConfig: (config) => set((state) => ({
    bossConfigs: {
      ...state.bossConfigs,
      [config.bossId]: config,
    },
  })),

  setCustomMarkers: (markers) => set({ customMarkers: markers }),
  
  addCustomMarker: (marker) => set((state) => ({
    customMarkers: [...state.customMarkers.filter(m => m.id !== marker.id), marker],
  })),

  removeCustomMarker: (id) => set((state) => ({
    customMarkers: state.customMarkers.filter((m) => m.id !== id),
  })),

  setSystemAnnouncement: (announcement) => set({ systemAnnouncement: announcement }),

  addCustomMap: (map, boss) => set((state) => ({
    customMaps: [...state.customMaps.filter((m) => m.id !== map.id), map],
    customBosses: boss
      ? [...state.customBosses.filter((b) => b.id !== boss.id), boss]
      : state.customBosses,
    selectedMapId: map.id,
  })),

  removeCustomMap: (mapId, removedBossIds = []) => set((state) => {
    const remainingMaps = state.customMaps.filter((m) => m.id !== mapId);
    const remainingBosses = state.customBosses.filter(
      (b) => b.mapId !== mapId && !removedBossIds.includes(b.id)
    );
    const newKills = { ...state.kills };
    Object.keys(newKills).forEach((k) => {
      if (removedBossIds.includes(newKills[k].bossId)) {
        delete newKills[k];
      }
    });

    const remainingMarkers = state.customMarkers.filter((m) => m.mapId !== mapId);
    const nextSelectedMap = state.selectedMapId === mapId ? 'dolina_seungryong' : state.selectedMapId;

    return {
      customMaps: remainingMaps,
      customBosses: remainingBosses,
      customMarkers: remainingMarkers,
      kills: newKills,
      selectedMapId: nextSelectedMap,
    };
  }),

  addCustomBoss: (boss) => set((state) => ({
    customBosses: [...state.customBosses.filter((b) => b.id !== boss.id), boss],
  })),

  removeCustomBoss: (bossId) => set((state) => {
    const remainingBosses = state.customBosses.filter((b) => b.id !== bossId);
    const newKills = { ...state.kills };
    Object.keys(newKills).forEach((k) => {
      if (newKills[k].bossId === bossId) {
        delete newKills[k];
      }
    });
    return {
      customBosses: remainingBosses,
      kills: newKills,
    };
  }),

  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setAdminModalOpen: (open) => set({ isAdminModalOpen: open }),
  setMatrixModalOpen: (open) => set({ isMatrixModalOpen: open }),
  setAddMapModalOpen: (open) => set({ isAddMapModalOpen: open }),
  setItemDatabaseModalOpen: (open) => set({ isItemDatabaseModalOpen: open }),
  openKillModal: (payload) => set({ isKillModalOpen: true, killModalPayload: payload || null }),
  closeKillModal: () => set({ isKillModalOpen: false, killModalPayload: null }),
  openBossDetailModal: (boss) => set({ isBossDetailModalOpen: true, selectedBossForDetails: boss }),
  closeBossDetailModal: () => set({ isBossDetailModalOpen: false, selectedBossForDetails: null }),
  setActiveMapPin: (coords) => set({ activeMapPin: coords }),
}));

// Helper selector hooks for components
export function useAllMaps(): MapDefinition[] {
  const customMaps = useAppStore((s) => s.customMaps);
  return useMemo(() => [...METIN2_MAPS, ...customMaps], [customMaps]);
}

export function useAllBosses(): BossDefinition[] {
  const customBosses = useAppStore((s) => s.customBosses);
  return useMemo(() => [...METIN2_BOSSES, ...customBosses], [customBosses]);
}
