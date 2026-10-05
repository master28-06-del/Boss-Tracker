import { Coordinates, KillRecord, CustomMarker, BossConfigItem, SystemAnnouncement, FullSyncState, UserSession, DatabaseUser, MapDefinition, BossDefinition } from '../types';
import { useAppStore } from '../store/useAppStore';
import { playBossKilledSound, playBossReadyFanfare, playBossRespawnWarning } from '../utils/sound';

const API_BASE = '';

function getAuthHeader(): Record<string, string> {
  const session = useAppStore.getState().session;
  if (session?.token) {
    return { Authorization: `Bearer ${session.token}` };
  }
  return {};
}

export async function fetchServerState(): Promise<FullSyncState> {
  const res = await fetch(`${API_BASE}/api/state`);
  if (!res.ok) throw new Error('Nie udało się pobrać stanu serwera');
  return res.json();
}

export async function registerUser(payload: {
  username: string;
  password: string;
  characterClass?: string;
  guildName?: string;
}): Promise<UserSession> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Nie udało się zarejestrować konta');
  }
  return data.user;
}

export async function loginUser(username: string, password: string): Promise<UserSession> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Błąd logowania');
  }
  return data.user;
}

export async function submitBossKill(payload: {
  bossId: string;
  channel: number;
  killedAt?: number;
  killedBy?: string;
  notes?: string;
  coords?: Coordinates;
}): Promise<KillRecord> {
  const res = await fetch(`${API_BASE}/api/kills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Nie udało się zarejestrować zbicia');
  }
  return data.record;
}

export async function resetSingleBossKill(bossId: string, channel: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/kills/reset-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ bossId, channel }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Błąd resetowania');
  }
}

export async function adminResetTimers(channel?: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/reset-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ channel }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Błąd resetowania timerów przez admina');
  }
}

export async function adminUpdateBossConfig(config: BossConfigItem): Promise<BossConfigItem> {
  const res = await fetch(`${API_BASE}/api/admin/boss-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(config),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Błąd aktualizacji konfiguracji respawnu');
  }
  return data.config;
}

export async function addCustomMapMarker(payload: {
  title: string;
  mapId: string;
  channel: number;
  coords: Coordinates;
  createdBy?: string;
  notes?: string;
  color?: string;
}): Promise<CustomMarker> {
  const res = await fetch(`${API_BASE}/api/markers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Błąd dodawania znacznika');
  }
  return data.marker;
}

export async function deleteCustomMapMarker(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/markers/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Błąd usuwania znacznika');
  }
}

export async function adminBroadcastAnnouncement(text: string | null): Promise<SystemAnnouncement | null> {
  const res = await fetch(`${API_BASE}/api/admin/announcement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Błąd wysyłania ogłoszenia');
  }
  return data.announcement;
}

// ----------------------------------------------------
// Custom Maps & Bosses API
// ----------------------------------------------------

export async function createCustomMap(payload: {
  name: string;
  category?: 'm1' | 'm2' | 'neutral' | 'dungeon' | 'high_level' | 'custom';
  recommendedLevel?: string;
  description?: string;
  imageUrl?: string;
  theme?: MapDefinition['theme'];
  landmarks?: MapDefinition['landmarks'];
  createdBy?: string;
  initialBoss?: {
    name: string;
    level?: number;
    respawnMinutes?: number;
    varianceMinutes?: number;
    defaultCoords?: Coordinates;
    iconType?: 'beast' | 'demon' | 'undead' | 'dragon' | 'spider' | 'humanoid';
    description?: string;
    spawnLocationName?: string;
  };
}): Promise<{ map: MapDefinition; boss?: BossDefinition | null }> {
  const res = await fetch(`${API_BASE}/api/maps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Nie udało się utworzyć własnej mapy');
  }
  if (data.map) {
    useAppStore.getState().addCustomMap(data.map, data.boss);
  }
  return data;
}

export async function deleteCustomMap(id: string): Promise<{ success: boolean; mapId: string; removedBossIds: string[] }> {
  const res = await fetch(`${API_BASE}/api/maps/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Nie udało się usunąć własnej mapy');
  }
  useAppStore.getState().removeCustomMap(id, data.removedBossIds || []);
  return data;
}

export async function createCustomBoss(payload: {
  name: string;
  level?: number;
  mapId: string;
  defaultCoords?: Coordinates;
  spawnLocationName?: string;
  respawnMinutes?: number;
  varianceMinutes?: number;
  iconType?: 'beast' | 'demon' | 'undead' | 'dragon' | 'spider' | 'humanoid';
  drops?: string[];
  notableDropsList?: Array<any>;
  description?: string;
  createdBy?: string;
}): Promise<BossDefinition> {
  const res = await fetch(`${API_BASE}/api/bosses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Nie udało się dodać własnego bossa');
  }
  return data.boss;
}

export async function deleteCustomBoss(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/bosses/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Nie udało się usunąć własnego bossa');
  }
}

// ----------------------------------------------------
// SSE Real-Time Stream Hook & Manager
// ----------------------------------------------------
let eventSourceInstance: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export function initRealtimeSSE() {
  if (typeof window === 'undefined') return () => {};
  if (eventSourceInstance) {
    return () => {};
  }

  function connect() {
    const store = useAppStore.getState();
    const es = new EventSource(`${API_BASE}/api/events`);
    eventSourceInstance = es;

    es.onopen = () => {
      store.setServerConnected(true);
    };

    es.addEventListener('init', (e) => {
      try {
        const data = JSON.parse(e.data);
        store.setFullState(data);
        if (data.serverTime) {
          store.setServerTimeOffset(Date.now() - data.serverTime);
        }
      } catch (err) {
        console.error('[SSE] Error handling init:', err);
      }
    });

    es.addEventListener('kill', (e) => {
      try {
        const record: KillRecord = JSON.parse(e.data);
        store.applyKillRecord(record);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mt2_sse_kill', { detail: record }));
        }
        if (store.soundEnabled) {
          playBossKilledSound(store.soundVolume);
        }
      } catch (err) {
        console.error('[SSE] Error handling kill event:', err);
      }
    });

    es.addEventListener('reset', (e) => {
      try {
        const { key } = JSON.parse(e.data);
        store.removeKillRecord(key);
      } catch (err) {
        console.error('[SSE] Error handling reset:', err);
      }
    });

    es.addEventListener('reset_all', (e) => {
      try {
        const { channel } = JSON.parse(e.data);
        if (channel) {
          const currentKills = { ...useAppStore.getState().kills };
          Object.keys(currentKills).forEach((k) => {
            if (currentKills[k].channel === channel) {
              delete currentKills[k];
            }
          });
          store.setFullState({
            kills: currentKills,
            customMarkers: useAppStore.getState().customMarkers,
            bossConfigs: useAppStore.getState().bossConfigs,
          });
        } else {
          store.setFullState({
            kills: {},
            customMarkers: useAppStore.getState().customMarkers,
            bossConfigs: useAppStore.getState().bossConfigs,
          });
        }
      } catch (err) {
        console.error('[SSE] Error handling reset_all:', err);
      }
    });

    es.addEventListener('config', (e) => {
      try {
        const config: BossConfigItem = JSON.parse(e.data);
        store.updateBossConfig(config);
      } catch (err) {
        console.error('[SSE] Error handling config:', err);
      }
    });

    es.addEventListener('marker_add', (e) => {
      try {
        const marker: CustomMarker = JSON.parse(e.data);
        store.addCustomMarker(marker);
      } catch (err) {
        console.error('[SSE] Error handling marker_add:', err);
      }
    });

    es.addEventListener('marker_delete', (e) => {
      try {
        const { id } = JSON.parse(e.data);
        store.removeCustomMarker(id);
      } catch (err) {
        console.error('[SSE] Error handling marker_delete:', err);
      }
    });

    es.addEventListener('announcement', (e) => {
      try {
        const announcement = JSON.parse(e.data);
        store.setSystemAnnouncement(announcement);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mt2_sse_announcement', { detail: announcement }));
        }
      } catch (err) {
        console.error('[SSE] Error handling announcement:', err);
      }
    });

    es.addEventListener('map_add', (e) => {
      try {
        const { map, boss } = JSON.parse(e.data);
        store.addCustomMap(map, boss);
      } catch (err) {
        console.error('[SSE] Error handling map_add:', err);
      }
    });

    es.addEventListener('map_delete', (e) => {
      try {
        const { mapId, removedBossIds } = JSON.parse(e.data);
        store.removeCustomMap(mapId, removedBossIds);
      } catch (err) {
        console.error('[SSE] Error handling map_delete:', err);
      }
    });

    es.addEventListener('boss_add', (e) => {
      try {
        const boss = JSON.parse(e.data);
        store.addCustomBoss(boss);
      } catch (err) {
        console.error('[SSE] Error handling boss_add:', err);
      }
    });

    es.addEventListener('boss_delete', (e) => {
      try {
        const { bossId } = JSON.parse(e.data);
        store.removeCustomBoss(bossId);
      } catch (err) {
        console.error('[SSE] Error handling boss_delete:', err);
      }
    });

    es.onerror = () => {
      store.setServerConnected(false);
      es.close();
      eventSourceInstance = null;
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          connect();
        }, 3000);
      }
    };
  }

  connect();

  return () => {
    if (eventSourceInstance) {
      eventSourceInstance.close();
      eventSourceInstance = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };
}

// ----------------------------------------------------
// DATABASE USER MANAGEMENT (ADMIN)
// ----------------------------------------------------

export async function fetchDatabaseUsers(): Promise<DatabaseUser[]> {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Nie udało się pobrać listy użytkowników z bazy');
  }
  return data.users;
}

export async function updateUserRole(username: string, role: 'admin' | 'hunter'): Promise<DatabaseUser> {
  const res = await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(username)}/role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Nie udało się zmienić uprawnień użytkownika');
  }
  return data.user;
}

export async function deleteDatabaseUser(username: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Nie udało się usunąć użytkownika z bazy');
  }
}

