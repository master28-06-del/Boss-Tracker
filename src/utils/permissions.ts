import { UserSession } from '../types';

/**
 * RBAC Helper for Metin2 Boss Tracker
 * Regular users (role: 'hunter' or guest):
 *  - View all boss timers and countdowns
 *  - Mark bosses as defeated
 *  - View detailed boss information, lore, typical spawn locations, and notable drops
 *  - Add custom markers / sightings
 * 
 * Administrators (role: 'admin'):
 *  - All regular user permissions
 *  - Reset boss timers (single boss or mass channel reset)
 *  - Edit boss spawn times & variance window
 *  - Remove inaccurate boss markers / pins from the map
 *  - Broadcast global system announcements
 */

export function isAdmin(roleOrUser?: string | UserSession | null): boolean {
  if (!roleOrUser) return false;
  if (typeof roleOrUser === 'string') {
    return roleOrUser === 'admin';
  }
  return roleOrUser.role === 'admin';
}

export function canViewTimers(_user: UserSession | null): boolean {
  return true;
}

export function canMarkDefeated(_user: UserSession | null): boolean {
  return true; // Regular users and guests can submit kills
}

export function canResetTimers(user: UserSession | null): boolean {
  return user?.role === 'admin';
}

export function canEditSpawnTimes(user: UserSession | null): boolean {
  return user?.role === 'admin';
}

export function canRemoveMarkers(user: UserSession | null): boolean {
  return user?.role === 'admin';
}

export function canBroadcastAnnouncement(user: UserSession | null): boolean {
  return user?.role === 'admin';
}

export function getRoleBadgeInfo(user: UserSession | null): {
  label: string;
  role: 'admin' | 'hunter' | 'guest';
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
} {
  if (user?.role === 'admin') {
    return {
      label: 'Administrator',
      role: 'admin',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/15',
      borderColor: 'border-amber-500/40',
      description: 'Pełne uprawnienia: reset timerów, edycja czasów respawnu, usuwanie znaczników, ogłoszenia.',
    };
  }

  if (user?.role === 'hunter') {
    return {
      label: 'Łowca Bossów',
      role: 'hunter',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/40',
      description: 'Standardowe uprawnienia: podgląd timerów na żywo, oznaczanie zbić bossów na CH1-CH6.',
    };
  }

  return {
    label: 'Gość (Tylko Odczyt & Zbicia)',
    role: 'guest',
    color: 'text-gray-400',
    bgColor: 'bg-gray-800/40',
    borderColor: 'border-gray-700/50',
    description: 'Niezalogowany użytkownik: przeglądanie timerów i zgłaszanie zbić.',
  };
}
