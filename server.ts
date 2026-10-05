import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'metin2-boss-tracker-secret-key-2026';
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tracker-state.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'hunter';
  characterClass?: string;
  guildName?: string;
  createdAt: number;
  lastLoginAt: number;
  killsCount: number;
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  try {
    const computed = hashPassword(password, salt);
    const a = Buffer.from(computed, 'hex');
    const b = Buffer.from(hash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Safe atomic JSON file writer (prevents corrupted 0-byte files on interruption)
function safeWriteJsonFile(filePath: string, data: unknown): void {
  const content = JSON.stringify(data, null, 2);
  const tempPath = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  try {
    fs.writeFileSync(tempPath, content, 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`[Server] Failed to safely write file ${filePath}:`, err);
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {
      // ignore unlink error
    }
  }
}

let usersDatabase: StoredUser[] = [];

function persistUsers() {
  safeWriteJsonFile(USERS_FILE, usersDatabase);
}

function initUsersDatabase() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      usersDatabase = JSON.parse(raw);
      console.log(`[Server] Loaded ${usersDatabase.length} registered users from database`);
      return;
    } catch (e) {
      console.error('[Server] Could not parse users.json, re-seeding:', e);
    }
  }

  // Pre-seed default accounts with secure salts
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const user1Salt = crypto.randomBytes(16).toString('hex');
  const user2Salt = crypto.randomBytes(16).toString('hex');

  usersDatabase = [
    {
      id: 'usr_admin',
      username: 'admin',
      passwordHash: hashPassword('admin123!', adminSalt),
      salt: adminSalt,
      role: 'admin',
      characterClass: 'Wojownik Body',
      guildName: 'Administracja',
      createdAt: Date.now() - 30 * 24 * 3600 * 1000,
      lastLoginAt: Date.now(),
      killsCount: 42,
    },
    {
      id: 'usr_shinsoo',
      username: 'shinsoo_pro',
      passwordHash: hashPassword('metin2026', user1Salt),
      salt: user1Salt,
      role: 'hunter',
      characterClass: 'Sura WP',
      guildName: 'Husaria',
      createdAt: Date.now() - 14 * 24 * 3600 * 1000,
      lastLoginAt: Date.now() - 3600 * 1000,
      killsCount: 19,
    },
    {
      id: 'usr_jinno',
      username: 'jinno_boss',
      passwordHash: hashPassword('metin2026', user2Salt),
      salt: user2Salt,
      role: 'hunter',
      characterClass: 'Ninja Dagger',
      guildName: 'DragonArmy',
      createdAt: Date.now() - 7 * 24 * 3600 * 1000,
      lastLoginAt: Date.now() - 7200 * 1000,
      killsCount: 12,
    },
  ];

  persistUsers();
  console.log('[Server] Initialized users database with default accounts (admin, shinsoo_pro, jinno_boss)');
}

initUsersDatabase();

interface KillRecord {
  id: string;
  bossId: string;
  channel: number;
  killedAt: number;
  respawnAt: number;
  respawnWindowStart?: number;
  respawnWindowEnd?: number;
  killedBy: string;
  notes?: string;
  coords?: { x: number; y: number };
}

interface CustomMarker {
  id: string;
  title: string;
  mapId: string;
  channel: number;
  coords: { x: number; y: number };
  createdAt: number;
  createdBy: string;
  color?: string;
  notes?: string;
}

interface BossConfigItem {
  bossId: string;
  respawnMinutes: number;
  varianceMinutes: number;
}

interface SystemAnnouncement {
  id: string;
  text: string;
  timestamp: number;
  author: string;
}

interface CustomMapDefinition {
  id: string;
  name: string;
  category: 'm1' | 'm2' | 'neutral' | 'dungeon' | 'high_level' | 'custom';
  recommendedLevel: string;
  description: string;
  imageUrl?: string;
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

interface CustomBossDefinition {
  id: string;
  name: string;
  level: number;
  mapId: string;
  defaultCoords: { x: number; y: number };
  spawnLocationName: string;
  respawnMinutes: number;
  varianceMinutes: number;
  iconType: 'beast' | 'demon' | 'undead' | 'dragon' | 'spider' | 'humanoid';
  drops: string[];
  notableDropsList: Array<{
    name: string;
    rarity: 'legendary' | 'epic' | 'rare' | 'common';
    category: 'chest' | 'weapon' | 'armor' | 'stone' | 'upgrade' | 'special' | 'misc';
    description?: string;
  }>;
  description: string;
  isCustom?: boolean;
  createdBy?: string;
}

interface ServerState {
  kills: Record<string, KillRecord>;
  customMarkers: CustomMarker[];
  bossConfigs: Record<string, BossConfigItem>;
  announcement: SystemAnnouncement | null;
  customMaps: CustomMapDefinition[];
  customBosses: CustomBossDefinition[];
}

// Initial defaults
const defaultBossConfigs: Record<string, BossConfigItem> = {
  wodz_orkow: { bossId: 'wodz_orkow', respawnMinutes: 120, varianceMinutes: 5 },
  odrodzony_wodz_orkow: { bossId: 'odrodzony_wodz_orkow', respawnMinutes: 120, varianceMinutes: 5 },
  ezot_przyzywacz: { bossId: 'ezot_przyzywacz', respawnMinutes: 60, varianceMinutes: 5 },
  pustynny_zolw: { bossId: 'pustynny_zolw', respawnMinutes: 120, varianceMinutes: 10 },
  lord_malp: { bossId: 'lord_malp', respawnMinutes: 60, varianceMinutes: 5 },
  wodz_rozbojnikow: { bossId: 'wodz_rozbojnikow', respawnMinutes: 90, varianceMinutes: 5 },
  krolowa_pajakow: { bossId: 'krolowa_pajakow', respawnMinutes: 240, varianceMinutes: 10 },
  elitarna_krolowa_pajakow: { bossId: 'elitarna_krolowa_pajakow', respawnMinutes: 180, varianceMinutes: 10 },
  dziewiec_ogonow: { bossId: 'dziewiec_ogonow', respawnMinutes: 120, varianceMinutes: 5 },
  krolowa_mrozu: { bossId: 'krolowa_mrozu', respawnMinutes: 120, varianceMinutes: 10 },
  zjawa_tygrysa: { bossId: 'zjawa_tygrysa', respawnMinutes: 120, varianceMinutes: 5 },
  krol_demonow: { bossId: 'krol_demonow', respawnMinutes: 60, varianceMinutes: 5 },
  umarly_rozpruwacz: { bossId: 'umarly_rozpruwacz', respawnMinutes: 120, varianceMinutes: 10 },
  olbrzymi_duch_drzewa: { bossId: 'olbrzymi_duch_drzewa', respawnMinutes: 120, varianceMinutes: 10 },
  wladca_pniarzy: { bossId: 'wladca_pniarzy', respawnMinutes: 90, varianceMinutes: 5 },
  lodowa_wiedzma: { bossId: 'lodowa_wiedzma', respawnMinutes: 480, varianceMinutes: 15 },
  dowodca_setaou: { bossId: 'dowodca_setaou', respawnMinutes: 120, varianceMinutes: 10 },
  general_yonghan: { bossId: 'general_yonghan', respawnMinutes: 180, varianceMinutes: 10 },
  general_huashin: { bossId: 'general_huashin', respawnMinutes: 180, varianceMinutes: 10 },
  beran_setaou: { bossId: 'beran_setaou', respawnMinutes: 60, varianceMinutes: 0 },
  best_kapitan: { bossId: 'best_kapitan', respawnMinutes: 30, varianceMinutes: 3 },
  best_specjalista: { bossId: 'best_specjalista', respawnMinutes: 30, varianceMinutes: 3 },
  mahon: { bossId: 'mahon', respawnMinutes: 20, varianceMinutes: 2 },
  bera: { bossId: 'bera', respawnMinutes: 30, varianceMinutes: 3 },
  lykos: { bossId: 'lykos', respawnMinutes: 30, varianceMinutes: 3 },
  scrofa: { bossId: 'scrofa', respawnMinutes: 30, varianceMinutes: 3 },
};

let state: ServerState = {
  kills: {},
  customMarkers: [],
  bossConfigs: { ...defaultBossConfigs },
  announcement: {
    id: 'welcome',
    text: 'Metin2 Boss Tracker aktywny na kanałach CH1 - CH6. Kliknij bossa lub mapę, by zarejestrować zbicie.',
    timestamp: Date.now(),
    author: 'Serwer MT2',
  },
  customMaps: [],
  customBosses: [],
};

// Load saved state if exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    state = {
      kills: parsed.kills || {},
      customMarkers: parsed.customMarkers || [],
      bossConfigs: { ...defaultBossConfigs, ...(parsed.bossConfigs || {}) },
      announcement: parsed.announcement || state.announcement,
      customMaps: parsed.customMaps || [],
      customBosses: parsed.customBosses || [],
    };
    console.log('[Server] Loaded persisted state successfully');
  } catch (err) {
    console.error('[Server] Could not parse saved state:', err);
  }
}

// ----------------------------------------------------
// DATABASE & STORAGE SUBSYSTEM: Write-Ahead Log, Automated Snapshots & Self-Healing
// ----------------------------------------------------

const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const AUDIT_LOG_FILE = path.join(DATA_DIR, 'audit-log.jsonl');

if (!fs.existsSync(BACKUPS_DIR)) {
  try {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  } catch (err) {
    console.error('[Server] Failed to create backups dir:', err);
  }
}

// Global monotonic state version for ETag caching & horizontal sync
let stateVersion = 1;
let auditLogCounter = 0;

interface AuditEvent {
  id: number;
  type: string;
  timestamp: number;
  author: string;
  details: unknown;
}

function appendAuditLog(type: string, author: string, details: unknown): void {
  try {
    auditLogCounter++;
    const entry: AuditEvent = {
      id: auditLogCounter,
      type,
      timestamp: Date.now(),
      author: author || 'system',
      details,
    };
    fs.appendFileSync(AUDIT_LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err) {
    console.error('[AuditLog] Failed to append entry:', err);
  }
}

function createDatabaseSnapshot(): void {
  try {
    const timestamp = Date.now();
    const snapshotPath = path.join(BACKUPS_DIR, `snapshot_${timestamp}.json`);
    const snapshotData = {
      timestamp,
      stateVersion,
      state,
      usersCount: usersDatabase.length,
    };
    safeWriteJsonFile(snapshotPath, snapshotData);

    // Prune snapshots, keeping only the 15 newest
    const files = fs.readdirSync(BACKUPS_DIR).filter((f) => f.startsWith('snapshot_') && f.endsWith('.json'));
    if (files.length > 15) {
      files.sort().slice(0, files.length - 15).forEach((oldFile) => {
        try {
          fs.unlinkSync(path.join(BACKUPS_DIR, oldFile));
        } catch {}
      });
    }
    console.log(`[Backup] Created automated database snapshot (${snapshotPath})`);
  } catch (err) {
    console.error('[Backup] Snapshot failed:', err);
  }
}

// Snapshot backup every 10 minutes
setInterval(createDatabaseSnapshot, 10 * 60 * 1000);

// Graceful shutdown snapshot
process.on('SIGTERM', () => {
  createDatabaseSnapshot();
  process.exit(0);
});
process.on('SIGINT', () => {
  createDatabaseSnapshot();
  process.exit(0);
});

// Self-healing & integrity verification
function verifyAndHealDatabase(): void {
  let healedCount = 0;
  for (const [key, record] of Object.entries(state.kills)) {
    if (!record || typeof record.killedAt !== 'number' || typeof record.respawnAt !== 'number') {
      delete state.kills[key];
      healedCount++;
    }
  }
  state.customMarkers = state.customMarkers.filter(
    (m) => m && m.id && m.coords && typeof m.coords.x === 'number' && typeof m.coords.y === 'number'
  );
  if (healedCount > 0) {
    console.warn(`[SelfHealing] Repaired ${healedCount} corrupted state records`);
    persistState();
  }
}

verifyAndHealDatabase();

function persistState() {
  safeWriteJsonFile(DATA_FILE, state);
}

// ----------------------------------------------------
// REAL-TIME SYNCHRONIZATION: Buffered Event Stream & Resync
// ----------------------------------------------------

interface BufferedSSEEvent {
  id: number;
  type: string;
  data: unknown;
  timestamp: number;
}

let sseEventId = 1;
const eventRingBuffer: BufferedSSEEvent[] = [];
const MAX_RING_BUFFER = 200;

// Active Server-Sent Events subscribers
const sseClients: Response[] = [];

function broadcastSSE(eventType: string, data: unknown, author?: string) {
  stateVersion++;
  const eventId = sseEventId++;
  const eventObj: BufferedSSEEvent = {
    id: eventId,
    type: eventType,
    data,
    timestamp: Date.now(),
  };

  eventRingBuffer.push(eventObj);
  if (eventRingBuffer.length > MAX_RING_BUFFER) {
    eventRingBuffer.shift();
  }

  appendAuditLog(eventType, author || 'system', data);

  const payload = `id: ${eventId}\nevent: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Security headers middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Rate limiter map for authentication endpoints to prevent brute-force attacks
const authRateLimits = new Map<string, { count: number; resetAt: number }>();
function authRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = authRateLimits.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= 20) {
      res.status(429).json({ error: 'Zbyt wiele prób logowania lub rejestracji. Odczekaj 60 sekund.' });
      return;
    }
    entry.count++;
  } else {
    authRateLimits.set(ip, { count: 1, resetAt: now + 60000 });
  }
  next();
}

// Clean up stale rate limits every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of authRateLimits.entries()) {
    if (now >= entry.resetAt) {
      authRateLimits.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Middleware with higher limits for custom map image textures
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Auth middleware
interface AuthenticatedRequest extends Request {
  user?: { username: string; role: 'admin' | 'hunter' };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Brak autoryzacji' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ error: 'Nieprawidłowy lub wygasły token' });
      return;
    }
    req.user = decoded as { username: string; role: 'admin' | 'hunter' };
    next();
  });
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Wymagane uprawnienia administratora' });
    return;
  }
  next();
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    serverTime: Date.now(),
    uptimeSeconds: Math.floor(process.uptime()),
    connectedClients: sseClients.length,
    stateVersion,
  });
});

// Detailed system and storage metrics
app.get('/api/metrics', (_req, res) => {
  let snapshotCount = 0;
  if (fs.existsSync(BACKUPS_DIR)) {
    try {
      snapshotCount = fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith('.json')).length;
    } catch {}
  }

  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    stateVersion,
    activeSseClients: sseClients.length,
    trackedKills: Object.keys(state.kills).length,
    customMarkers: state.customMarkers.length,
    customMaps: state.customMaps.length,
    customBosses: state.customBosses.length,
    registeredUsers: usersDatabase.length,
    persistence: {
      engine: 'Atomic-WAL-Snapshots',
      snapshotsCount: snapshotCount,
      walEventsCount: auditLogCounter,
      integrity: 'verified',
    },
    memory: {
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  });
});

// Audit log query endpoint
app.get('/api/audit-logs', authenticateToken, (_req: AuthenticatedRequest, res) => {
  try {
    if (!fs.existsSync(AUDIT_LOG_FILE)) {
      res.json([]);
      return;
    }
    const lines = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8').trim().split('\n').filter(Boolean);
    const last100 = lines
      .slice(-100)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();
    res.json(last100);
  } catch {
    res.status(500).json({ error: 'Błąd odczytu logów audytu' });
  }
});

// SSE Stream for Real-Time synchronization with Last-Event-ID catch-up support
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const lastEventIdHeader = req.headers['last-event-id'] || req.query.lastEventId;
  const lastEventId = lastEventIdHeader ? parseInt(String(lastEventIdHeader), 10) : NaN;

  // If client is reconnecting and has a valid lastEventId, replay missed events from ring buffer
  if (!isNaN(lastEventId) && lastEventId > 0) {
    const missedEvents = eventRingBuffer.filter((ev) => ev.id > lastEventId);
    if (missedEvents.length > 0) {
      for (const ev of missedEvents) {
        res.write(`id: ${ev.id}\nevent: ${ev.type}\ndata: ${JSON.stringify(ev.data)}\n\n`);
      }
    }
  }

  // Send handshake with stateVersion and full state
  const initialPayload = {
    type: 'init',
    stateVersion,
    kills: state.kills,
    customMarkers: state.customMarkers,
    bossConfigs: state.bossConfigs,
    announcement: state.announcement,
    customMaps: state.customMaps,
    customBosses: state.customBosses,
    serverTime: Date.now(),
  };
  res.write(`id: ${sseEventId}\nevent: init\ndata: ${JSON.stringify(initialPayload)}\n\n`);

  sseClients.push(res);

  // Keep-alive heartbeat every 20s
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// Full state fetch with ETag / If-None-Match caching
app.get('/api/state', (req, res) => {
  const etag = `W/"state-v${stateVersion}"`;
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'no-cache');

  if (req.headers['if-none-match'] === etag) {
    res.status(304).end();
    return;
  }

  res.json({
    stateVersion,
    kills: state.kills,
    customMarkers: state.customMarkers,
    bossConfigs: state.bossConfigs,
    announcement: state.announcement,
    customMaps: state.customMaps,
    customBosses: state.customBosses,
    serverTime: Date.now(),
  });
});

// ----------------------------------------------------
// AUTH & USER DATABASE ROUTES
// ----------------------------------------------------

// User Registration
app.post('/api/auth/register', authRateLimiter, (req, res) => {
  const { username, password, characterClass, guildName } = req.body;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'Nazwa gracza (login) jest wymagana' });
    return;
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 3 || trimmedUsername.length > 24) {
    res.status(400).json({ error: 'Nazwa gracza musi mieć od 3 do 24 znaków' });
    return;
  }

  if (!/^[a-zA-Z0-9_\-ąćęłńóśźżĄĆĘŁŃÓŚŹŻ ]+$/.test(trimmedUsername)) {
    res.status(400).json({ error: 'Nazwa gracza zawiera niedozwolone znaki' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 4) {
    res.status(400).json({ error: 'Hasło musi mieć co najmniej 4 znaki' });
    return;
  }

  // Check unique username in database (case-insensitive)
  const existing = usersDatabase.find(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
  );
  if (existing) {
    res.status(409).json({ error: `Konto o nazwie "${trimmedUsername}" już istnieje w bazie danych` });
    return;
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: trimmedUsername,
    passwordHash,
    salt,
    role: 'hunter',
    characterClass: characterClass || 'Wojownik Body',
    guildName: guildName?.trim() || undefined,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    killsCount: 0,
  };

  usersDatabase.push(newUser);
  persistUsers();

  const token = jwt.sign(
    {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      characterClass: newUser.characterClass,
      guildName: newUser.guildName,
    },
    JWT_SECRET,
    { expiresIn: '14d' }
  );

  res.status(201).json({
    success: true,
    message: 'Konto zarejestrowane w bazie danych',
    user: {
      username: newUser.username,
      role: newUser.role,
      characterClass: newUser.characterClass,
      guildName: newUser.guildName,
      createdAt: newUser.createdAt,
      lastLoginAt: newUser.lastLoginAt,
      token,
    },
  });
});

// User Login with database authentication
app.post('/api/auth/login', authRateLimiter, (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'Nazwa użytkownika jest wymagana' });
    return;
  }

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Wprowadź hasło, aby się zalogować' });
    return;
  }

  const trimmedUsername = username.trim();
  const user = usersDatabase.find(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
  );

  if (!user) {
    res.status(401).json({ error: 'Nie znaleziono takiego użytkownika w bazie danych. Sprawdź login lub zarejestruj konto.' });
    return;
  }

  const isValidPassword = verifyPassword(password, user.salt, user.passwordHash);
  if (!isValidPassword) {
    res.status(401).json({ error: 'Nieprawidłowe hasło dla tego konta' });
    return;
  }

  user.lastLoginAt = Date.now();
  persistUsers();

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      characterClass: user.characterClass,
      guildName: user.guildName,
    },
    JWT_SECRET,
    { expiresIn: '14d' }
  );

  res.json({
    success: true,
    user: {
      username: user.username,
      role: user.role,
      characterClass: user.characterClass,
      guildName: user.guildName,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      token,
    },
  });
});

// Current user profile
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  const username = req.user?.username;
  const user = usersDatabase.find((u) => u.username.toLowerCase() === username?.toLowerCase());
  if (!user) {
    res.status(404).json({ error: 'Użytkownik nie istnieje w bazie' });
    return;
  }
  res.json({
    username: user.username,
    role: user.role,
    characterClass: user.characterClass,
    guildName: user.guildName,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    killsCount: user.killsCount || 0,
  });
});

// Admin: list all database users
app.get('/api/admin/users', authenticateToken, requireAdmin, (_req, res) => {
  const publicUsers = usersDatabase.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    characterClass: u.characterClass,
    guildName: u.guildName,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    killsCount: u.killsCount || 0,
  }));
  res.json({ success: true, users: publicUsers });
});

// Admin: change user role
app.post('/api/admin/users/:username/role', authenticateToken, requireAdmin, (req, res) => {
  const { username } = req.params;
  const { role } = req.body;

  if (username.toLowerCase() === 'admin' && role !== 'admin') {
    res.status(400).json({ error: 'Główny administrator nie może zostać zdegradowany' });
    return;
  }

  if (role !== 'admin' && role !== 'hunter') {
    res.status(400).json({ error: 'Dozwolone role to: admin, hunter' });
    return;
  }

  const user = usersDatabase.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    res.status(404).json({ error: 'Nie znaleziono użytkownika w bazie' });
    return;
  }

  user.role = role;
  persistUsers();

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      characterClass: user.characterClass,
      guildName: user.guildName,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      killsCount: user.killsCount || 0,
    },
  });
});

// Admin: delete user from database
app.delete('/api/admin/users/:username', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { username } = req.params;

  if (username.toLowerCase() === 'admin') {
    res.status(400).json({ error: 'Konto administratora głównego (admin) nie może zostać usunięte' });
    return;
  }

  if (req.user?.username.toLowerCase() === username.toLowerCase()) {
    res.status(400).json({ error: 'Nie możesz usunąć aktualnie zalogowanego konta' });
    return;
  }

  const index = usersDatabase.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());
  if (index === -1) {
    res.status(404).json({ error: 'Nie znaleziono użytkownika w bazie' });
    return;
  }

  usersDatabase.splice(index, 1);
  persistUsers();

  res.json({ success: true, message: `Użytkownik "${username}" został trwale usunięty z bazy danych` });
});

// Mark Boss as Killed
app.post('/api/kills', (req, res) => {
  const { bossId, channel, killedAt, killedBy, notes, coords } = req.body;

  if (!bossId || !channel || channel < 1 || channel > 6) {
    res.status(400).json({ error: 'Nieprawidłowe ID bossa lub kanał (1-6)' });
    return;
  }

  const now = Date.now();
  const actualKilledAt = Number(killedAt) || now;
  const config = state.bossConfigs[bossId] || defaultBossConfigs[bossId] || { respawnMinutes: 120, varianceMinutes: 5 };

  const respawnMs = config.respawnMinutes * 60 * 1000;
  const varianceMs = (config.varianceMinutes || 0) * 60 * 1000;

  const respawnAt = actualKilledAt + respawnMs;
  const respawnWindowStart = respawnAt - varianceMs;
  const respawnWindowEnd = respawnAt + varianceMs;

  const key = `${bossId}_ch${channel}`;
  const record: KillRecord = {
    id: `kill_${key}_${actualKilledAt}`,
    bossId,
    channel: Number(channel),
    killedAt: actualKilledAt,
    respawnAt,
    respawnWindowStart,
    respawnWindowEnd,
    killedBy: killedBy || 'Gracz',
    notes: notes || undefined,
    coords: coords || undefined,
  };

  state.kills[key] = record;
  persistState();

  // Increment kills count in user database if killed by a registered user
  if (killedBy) {
    const killerUser = usersDatabase.find(
      (u) => u.username.toLowerCase() === killedBy.trim().toLowerCase()
    );
    if (killerUser) {
      killerUser.killsCount = (killerUser.killsCount || 0) + 1;
      persistUsers();
    }
  }

  broadcastSSE('kill', record, killedBy || 'Gracz');
  res.json({ success: true, record });
});

// Reset single boss timer (Admin only privilege)
app.post('/api/kills/reset-single', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { bossId, channel } = req.body;
  if (!bossId || !channel) {
    res.status(400).json({ error: 'Wymagane bossId i channel' });
    return;
  }

  const key = `${bossId}_ch${channel}`;
  delete state.kills[key];
  persistState();

  broadcastSSE('reset', { key, bossId, channel }, req.user?.username || 'admin');
  res.json({ success: true, key });
});

// Admin: Reset all timers on channel or all channels
app.post('/api/admin/reset-all', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { channel } = req.body;

  if (channel) {
    // Reset specific channel
    const chNum = Number(channel);
    Object.keys(state.kills).forEach((key) => {
      if (state.kills[key].channel === chNum) {
        delete state.kills[key];
      }
    });
  } else {
    // Reset completely
    state.kills = {};
  }

  persistState();
  broadcastSSE('reset_all', { channel: channel ? Number(channel) : null }, req.user?.username || 'admin');
  res.json({ success: true });
});

// Admin: Edit Boss respawn configs
app.post('/api/admin/boss-config', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { bossId, respawnMinutes, varianceMinutes } = req.body;

  if (!bossId || typeof respawnMinutes !== 'number' || respawnMinutes <= 0) {
    res.status(400).json({ error: 'Nieprawidłowe dane konfiguracji respawnu' });
    return;
  }

  const item: BossConfigItem = {
    bossId,
    respawnMinutes: Math.max(1, Math.round(respawnMinutes)),
    varianceMinutes: Math.max(0, Math.round(varianceMinutes || 0)),
  };

  state.bossConfigs[bossId] = item;
  persistState();

  broadcastSSE('config', item, req.user?.username || 'admin');
  res.json({ success: true, config: item });
});

// Add custom map marker (e.g. metin stone, spotted boss location)
app.post('/api/markers', (req, res) => {
  const { title, mapId, channel, coords, createdBy, notes, color } = req.body;

  if (!title || !mapId || !coords) {
    res.status(400).json({ error: 'Brak tytułu, mapy lub współrzędnych' });
    return;
  }

  const marker: CustomMarker = {
    id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    mapId,
    channel: Number(channel) || 1,
    coords,
    createdAt: Date.now(),
    createdBy: createdBy || 'Anonim',
    notes,
    color: color || '#38bdf8',
  };

  state.customMarkers.push(marker);
  persistState();

  broadcastSSE('marker_add', marker, createdBy || 'Anonim');
  res.json({ success: true, marker });
});

// Delete custom marker (Admin privilege to remove inaccurate markers)
app.delete('/api/markers/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const initialLen = state.customMarkers.length;
  state.customMarkers = state.customMarkers.filter((m) => m.id !== id);

  if (state.customMarkers.length !== initialLen) {
    persistState();
    broadcastSSE('marker_delete', { id }, req.user?.username || 'admin');
  }

  res.json({ success: true, id });
});

// Admin announcement
app.post('/api/admin/announcement', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { text } = req.body;

  if (text === null || text === '') {
    state.announcement = null;
  } else {
    state.announcement = {
      id: `ann_${Date.now()}`,
      text: String(text).trim(),
      timestamp: Date.now(),
      author: req.user?.username || 'Administrator',
    };
  }

  persistState();
  broadcastSSE('announcement', state.announcement, req.user?.username || 'admin');
  res.json({ success: true, announcement: state.announcement });
});

// ----------------------------------------------------
// CUSTOM MAPS & CUSTOM BOSSES ROUTES
// ----------------------------------------------------

// Get all custom maps
app.get('/api/maps', (_req, res) => {
  res.json({ success: true, maps: state.customMaps });
});

// Add a new custom map
app.post('/api/maps', (req, res) => {
  const {
    name,
    category = 'custom',
    recommendedLevel = '1 - 99',
    description = '',
    imageUrl,
    theme,
    landmarks = [],
    createdBy = 'Gracz',
    initialBoss,
  } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Nazwa mapy jest wymagana' });
    return;
  }

  // Create a clean slug-based ID with timestamp
  const sanitizedSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 20);

  const mapId = `custom_map_${sanitizedSlug}_${Date.now().toString(36)}`;

  const defaultTheme = {
    bg: '#142516',
    accent: '#4ade80',
    gridColor: 'rgba(74, 222, 128, 0.15)',
    terrainType: 'grass' as const,
  };

  const newMap: CustomMapDefinition = {
    id: mapId,
    name: name.trim(),
    category: category || 'custom',
    recommendedLevel: recommendedLevel.trim() || '1 - 99',
    description: description.trim() || `Własna kraina stworzona przez gracza: ${createdBy}`,
    imageUrl: imageUrl || undefined,
    isCustom: true,
    createdBy,
    createdAt: Date.now(),
    theme: theme || defaultTheme,
    landmarks: Array.isArray(landmarks) ? landmarks : [],
  };

  state.customMaps.push(newMap);

  let newBoss: CustomBossDefinition | null = null;
  if (initialBoss && initialBoss.name && initialBoss.name.trim()) {
    const bossSlug = initialBoss.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 16);

    const bossId = `custom_boss_${bossSlug}_${Date.now().toString(36)}`;
    const respawnMinutes = Math.max(1, Number(initialBoss.respawnMinutes) || 120);
    const varianceMinutes = Math.max(0, Number(initialBoss.varianceMinutes) || 5);

    newBoss = {
      id: bossId,
      name: initialBoss.name.trim(),
      level: Math.max(1, Number(initialBoss.level) || 75),
      mapId,
      defaultCoords: initialBoss.defaultCoords || { x: 500, y: 500 },
      spawnLocationName: initialBoss.spawnLocationName || newMap.name,
      respawnMinutes,
      varianceMinutes,
      iconType: initialBoss.iconType || 'beast',
      drops: initialBoss.drops || ['Szkatułka Władcy Mapy', 'Kamień Duszy +4', 'Zbroja 66-70 lvl', 'Broń 65-75 lvl', 'Zwój Błogosławieństwa'],
      notableDropsList: [
        {
          name: 'Szkatułka Władcy Mapy',
          rarity: 'legendary',
          category: 'chest',
          description: 'Cenna szkatułka zawierająca potężny ekwipunek.',
        },
        {
          name: 'Kamień Duszy +4',
          rarity: 'epic',
          category: 'stone',
          description: 'Magiczny kamień zwiększający siłę w walce.',
        },
      ],
      description: initialBoss.description || `Legendarny władca strzegący mapy ${newMap.name}.`,
      isCustom: true,
      createdBy,
    };

    state.customBosses.push(newBoss);
    state.bossConfigs[bossId] = {
      bossId,
      respawnMinutes,
      varianceMinutes,
    };
  }

  persistState();

  broadcastSSE('map_add', { map: newMap, boss: newBoss }, createdBy || 'Gracz');
  res.json({ success: true, map: newMap, boss: newBoss });
});

// Delete a custom map
app.delete('/api/maps/:id', (req, res) => {
  const { id } = req.params;
  const initialMapCount = state.customMaps.length;
  state.customMaps = state.customMaps.filter((m) => m.id !== id);

  if (state.customMaps.length === initialMapCount) {
    res.status(404).json({ error: 'Nie znaleziono własnej mapy o podanym ID' });
    return;
  }

  // Find and remove associated bosses
  const bossesToRemove = state.customBosses.filter((b) => b.mapId === id);
  const bossIdsToRemove = bossesToRemove.map((b) => b.id);
  state.customBosses = state.customBosses.filter((b) => b.mapId !== id);

  // Clean up kill records for these bosses
  Object.keys(state.kills).forEach((key) => {
    if (bossIdsToRemove.includes(state.kills[key].bossId)) {
      delete state.kills[key];
    }
  });

  // Clean up custom markers on this map
  state.customMarkers = state.customMarkers.filter((m) => m.mapId !== id);

  persistState();

  broadcastSSE('map_delete', { mapId: id, removedBossIds: bossIdsToRemove }, 'admin');
  res.json({ success: true, mapId: id, removedBossIds: bossIdsToRemove });
});

// Add a custom boss to any map
app.post('/api/bosses', (req, res) => {
  const {
    name,
    level = 75,
    mapId,
    defaultCoords = { x: 500, y: 500 },
    spawnLocationName = 'Spot centralny',
    respawnMinutes = 120,
    varianceMinutes = 5,
    iconType = 'beast',
    drops,
    notableDropsList,
    description,
    createdBy = 'Gracz',
  } = req.body;

  if (!name || !mapId) {
    res.status(400).json({ error: 'Nazwa bossa oraz identyfikator mapy są wymagane' });
    return;
  }

  const bossSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 16);

  const bossId = `custom_boss_${bossSlug}_${Date.now().toString(36)}`;
  const respM = Math.max(1, Number(respawnMinutes) || 120);
  const varM = Math.max(0, Number(varianceMinutes) || 5);

  const newBoss: CustomBossDefinition = {
    id: bossId,
    name: name.trim(),
    level: Math.max(1, Number(level) || 75),
    mapId,
    defaultCoords,
    spawnLocationName: spawnLocationName.trim() || 'Spot centralny',
    respawnMinutes: respM,
    varianceMinutes: varM,
    iconType: iconType || 'beast',
    drops: Array.isArray(drops) && drops.length > 0 ? drops : ['Szkatułka Bossa', 'Kamień Duszy +4', 'Ekwipunek 65-75 lvl'],
    notableDropsList: Array.isArray(notableDropsList) && notableDropsList.length > 0
      ? notableDropsList
      : [
          {
            name: 'Szkatułka Bossa',
            rarity: 'epic',
            category: 'chest',
            description: 'Szkatułka z cennymi łupami.',
          },
        ],
    description: description || `Groźny potwór grasujący w tej lokacji.`,
    isCustom: true,
    createdBy,
  };

  state.customBosses.push(newBoss);
  state.bossConfigs[bossId] = {
    bossId,
    respawnMinutes: respM,
    varianceMinutes: varM,
  };

  persistState();

  broadcastSSE('boss_add', newBoss, createdBy || 'Gracz');
  res.json({ success: true, boss: newBoss });
});

// Delete a custom boss
app.delete('/api/bosses/:id', (req, res) => {
  const { id } = req.params;
  const initialCount = state.customBosses.length;
  state.customBosses = state.customBosses.filter((b) => b.id !== id);

  if (state.customBosses.length === initialCount) {
    res.status(404).json({ error: 'Nie znaleziono własnego bossa o podanym ID' });
    return;
  }

  // Remove kills for this boss
  Object.keys(state.kills).forEach((key) => {
    if (state.kills[key].bossId === id) {
      delete state.kills[key];
    }
  });

  persistState();

  broadcastSSE('boss_delete', { bossId: id }, 'admin');
  res.json({ success: true, bossId: id });
});

// ----------------------------------------------------
// VITE INTEGRATION & SERVER START
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Metin2 Boss Tracker] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
