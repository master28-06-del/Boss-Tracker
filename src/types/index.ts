export type ChannelId = 1 | 2 | 3 | 4 | 5 | 6;

export type BossStatus = 'alive' | 'imminent' | 'dead' | 'overdue';

export interface Coordinates {
  x: number;
  y: number;
}

export interface NotableDropItem {
  name: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
  category: 'chest' | 'weapon' | 'armor' | 'stone' | 'upgrade' | 'special' | 'misc';
  description?: string;
}

export interface MetinItem {
  id: string;
  name: string;
  category: 'chest' | 'weapon' | 'armor' | 'stone' | 'upgrade' | 'special' | 'misc';
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
  description: string;
  levelReq?: number;
  sourceBosses: string[]; // Boss IDs or names
  sourceMaps: string[]; // Map IDs
}

export interface BossDefinition {
  id: string;
  name: string;
  level: number;
  mapId: string;
  defaultCoords: Coordinates;
  spawnLocationName: string; // Typical spawn location description
  respawnMinutes: number;
  varianceMinutes: number; // e.g. ±5 min window
  iconType: 'beast' | 'demon' | 'undead' | 'dragon' | 'spider' | 'humanoid';
  drops: string[];
  notableDropsList: NotableDropItem[];
  description: string;
  imageUrl?: string;
  isCustom?: boolean;
  createdBy?: string;
}

export interface MapDefinition {
  id: string;
  name: string;
  category: 'm1' | 'm2' | 'neutral' | 'dungeon' | 'high_level' | 'custom';
  recommendedLevel: string;
  description: string;
  imageUrl?: string; // Optional custom map texture / image URL / data URL
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: number;
  theme: {
    bg: string;
    accent: string;
    gridColor: string;
    terrainType: 'grass' | 'desert' | 'snow' | 'dungeon' | 'dark' | 'forest' | 'water';
  };
  landmarks: {
    name: string;
    x: number;
    y: number;
    type: 'portal' | 'town' | 'boss_spot' | 'danger';
  }[];
}

export interface KillRecord {
  id: string;
  bossId: string;
  channel: ChannelId;
  killedAt: number; // Timestamp ms
  respawnAt: number; // Timestamp ms
  respawnWindowStart?: number; // Timestamp ms
  respawnWindowEnd?: number; // Timestamp ms
  killedBy: string;
  notes?: string;
  coords?: Coordinates;
}

export interface CustomMarker {
  id: string;
  title: string;
  mapId: string;
  channel: ChannelId;
  coords: Coordinates;
  createdAt: number;
  createdBy: string;
  color?: string;
  notes?: string;
}

export type MetinCharacterClass = 'Wojownik Body' | 'Wojownik Mental' | 'Sura WP' | 'Sura BM' | 'Ninja Dagger' | 'Ninja Archer' | 'Szaman Smok' | 'Szaman Healer';

export interface UserSession {
  username: string;
  role: 'admin' | 'hunter';
  token: string;
  characterClass?: string;
  guildName?: string;
  createdAt?: number;
  lastLoginAt?: number;
}

export interface DatabaseUser {
  id: string;
  username: string;
  role: 'admin' | 'hunter';
  characterClass?: string;
  guildName?: string;
  createdAt: number;
  lastLoginAt: number;
  killsCount: number;
}

export interface BossConfigItem {
  bossId: string;
  respawnMinutes: number;
  varianceMinutes: number;
}

export interface SystemAnnouncement {
  id: string;
  text: string;
  timestamp: number;
  author: string;
}

export interface FullSyncState {
  kills: Record<string, KillRecord>; // key: `${bossId}_ch${channel}`
  customMarkers: CustomMarker[];
  bossConfigs: Record<string, BossConfigItem>;
  announcement?: SystemAnnouncement | null;
  customMaps?: MapDefinition[];
  customBosses?: BossDefinition[];
  serverTime: number;
}

export interface DesktopNotificationSettings {
  enabled: boolean;
  onRespawn: boolean;
  onImminent: boolean;
  imminentMinutes: number; // e.g. 1, 2, 3, 5
  onKill: boolean;
  onAnnouncement: boolean;
  onlyCurrentMap: boolean;
  soundWithNotification: boolean;
}

export interface VoiceAnnouncementSettings {
  enabled: boolean; // Optional audio speech announcements
  volume: number; // 0.0 - 1.0
  rate: number; // 0.8 - 1.3
  pitch: number; // 0.8 - 1.2
  language: 'pl-PL' | 'en-US';
  onlyCurrentMap: boolean;
  voiceURI?: string;
  includeMapName: boolean;
}

