import { playNotificationAlertSound } from './sound';

// Metin2 Golden Dragon / Sword SVG data URI icon for desktop notifications
const NOTIFICATION_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="28" fill="#121620"/>
  <circle cx="64" cy="64" r="54" fill="#1b2234" stroke="#eab308" stroke-width="4"/>
  <path d="M64 16 L74 48 L108 52 L82 74 L90 108 L64 90 L38 108 L46 74 L20 52 L54 48 Z" fill="#eab308" opacity="0.3"/>
  <path d="M64 24 L69 44 L90 47 L74 61 L79 82 L64 71 L49 82 L54 61 L38 47 L59 44 Z" fill="#f59e0b"/>
  <circle cx="64" cy="64" r="16" fill="#ef4444"/>
  <circle cx="64" cy="64" r="8" fill="#fef08a"/>
</svg>
`)}`;

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.warn('[Notifications] Error requesting permission:', err);
    return Notification.permission;
  }
}

export interface DesktopNotificationPayload {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  onClick?: () => void;
  playSound?: boolean;
  volume?: number;
}

export function sendDesktopNotification({
  title,
  body,
  tag,
  icon = NOTIFICATION_ICON,
  onClick,
  playSound = true,
  volume = 0.5,
}: DesktopNotificationPayload): Notification | null {
  if (!isNotificationSupported()) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    return null;
  }

  try {
    if (playSound) {
      playNotificationAlertSound(volume);
    }

    const notification = new Notification(title, {
      body,
      icon,
      tag: tag || `mt2_notif_${Date.now()}`,
      badge: icon,
      silent: true, // we handle our own synthesized crisp sound
    });

    notification.onclick = (event) => {
      event.preventDefault();
      try {
        window.focus();
      } catch (e) {
        // window.focus might be restricted in some iframes
      }
      if (onClick) {
        onClick();
      }
      notification.close();
    };

    // Auto-close after 8 seconds if not dismissed
    setTimeout(() => {
      try {
        notification.close();
      } catch (e) {
        // Ignore
      }
    }, 8000);

    return notification;
  } catch (err) {
    console.error('[Notifications] Failed to create desktop notification:', err);
    return null;
  }
}
