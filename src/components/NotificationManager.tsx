import React, { useEffect, useRef, useState } from 'react';
import { useAppStore, useAllBosses, useAllMaps } from '../store/useAppStore';
import { sendDesktopNotification, getNotificationPermission } from '../utils/notifications';
import { speakBossOneMinuteCountdown } from '../utils/speech';
import { KillRecord, SystemAnnouncement } from '../types';
import { Volume2, Mic, X } from 'lucide-react';

interface ActiveVoiceToast {
  text: string;
  bossName?: string;
  channel?: number;
}

export const NotificationManager: React.FC = () => {
  const {
    notificationSettings,
    voiceSettings,
    soundVolume,
    soundEnabled,
    kills,
    session,
    selectedMapId,
    setSelectedMapId,
    setSelectedChannel,
    openBossDetailModal,
  } = useAppStore();

  const allBosses = useAllBosses();
  const allMaps = useAllMaps();

  // Keep track of keys already notified to avoid repeat alerts
  const notifiedKeysRef = useRef<Set<string>>(new Set());
  // Keep track of 1-minute voice announcements already spoken
  const announcedVoiceKeysRef = useRef<Set<string>>(new Set());

  // Active voice toast state for visual feedback
  const [activeSpeech, setActiveSpeech] = useState<ActiveVoiceToast | null>(null);

  // Listen to speech status events to display a sleek in-app indicator
  useEffect(() => {
    const handleSpeechStatus = (e: Event) => {
      const customEvent = e as CustomEvent<{
        isSpeaking: boolean;
        text?: string;
        bossName?: string;
        channel?: number;
      }>;
      const { isSpeaking, text, bossName, channel } = customEvent.detail;
      if (isSpeaking && text) {
        setActiveSpeech({ text, bossName, channel });
      } else {
        // Delay hide slightly so animation finishes gracefully
        setTimeout(() => setActiveSpeech(null), 800);
      }
    };

    window.addEventListener('mt2_speech_status', handleSpeechStatus);
    return () => {
      window.removeEventListener('mt2_speech_status', handleSpeechStatus);
    };
  }, []);

  // 1. Periodic check (1s) for:
  // - 1-minute SpeechSynthesis audio announcements (when boss countdown reaches <= 60s)
  // - Desktop notifications (imminent & respawn)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const hasDesktopPermission =
        notificationSettings.enabled && getNotificationPermission() === 'granted';
      const imminentMs = Math.max(1, notificationSettings.imminentMinutes) * 60 * 1000;

      // Iterate through all tracked channels CH1-CH6
      ([1, 2, 3, 4, 5, 6] as const).forEach((ch) => {
        allBosses.forEach((boss) => {
          const key = `${boss.id}_ch${ch}`;
          const record: KillRecord | undefined = kills[key];
          if (!record) return;

          const diff = record.respawnAt - now;
          const mapName = allMaps.find((m) => m.id === boss.mapId)?.name || 'Nieznany obszar';

          // --- Feature A: SpeechSynthesis 1-minute Countdown Announcement ---
          if (voiceSettings.enabled && soundEnabled) {
            const voice1MinKey = `${key}_voice1min_${record.respawnAt}`;

            // Check if within the 1-minute countdown window (between 60s and 10s left)
            if (diff <= 60000 && diff >= 10000) {
              if (!announcedVoiceKeysRef.current.has(voice1MinKey)) {
                announcedVoiceKeysRef.current.add(voice1MinKey);

                // Check map scope if user configured "onlyCurrentMap"
                const shouldSpeak = !voiceSettings.onlyCurrentMap || boss.mapId === selectedMapId;
                if (shouldSpeak) {
                  speakBossOneMinuteCountdown({
                    bossName: boss.name,
                    channel: ch,
                    mapName: voiceSettings.includeMapName ? mapName : undefined,
                    volume: voiceSettings.volume,
                    rate: voiceSettings.rate,
                    pitch: voiceSettings.pitch,
                    lang: voiceSettings.language,
                    voiceURI: voiceSettings.voiceURI,
                  });
                }
              }
            } else if (diff < 10000) {
              // Page loaded or kill registered with <10s remaining; mark as passed
              announcedVoiceKeysRef.current.add(voice1MinKey);
            }
          }

          // --- Feature B: Desktop Notifications (System Popups) ---
          if (hasDesktopPermission) {
            // If onlyCurrentMap is set, skip bosses from other maps for desktop notifications
            if (notificationSettings.onlyCurrentMap && boss.mapId !== selectedMapId) {
              return;
            }

            const respawnKey = `${key}_respawn_${record.respawnAt}`;
            const imminentKey = `${key}_imminent_${record.respawnAt}`;

            // Case B.1: Boss respawned (diff <= 0)
            if (diff <= 0) {
              if (notificationSettings.onRespawn && !notifiedKeysRef.current.has(respawnKey)) {
                notifiedKeysRef.current.add(respawnKey);
                notifiedKeysRef.current.add(imminentKey);

                sendDesktopNotification({
                  title: `⚔️ Boss Odrodzony: ${boss.name} (CH${ch})!`,
                  body: `Obszar: ${mapName} • Spawn: ${boss.spawnLocationName || 'Domyślna lokacja'} • Kliknij aby otworzyć`,
                  tag: `respawn_${boss.id}_ch${ch}`,
                  playSound: notificationSettings.soundWithNotification && soundEnabled,
                  volume: soundVolume,
                  onClick: () => {
                    setSelectedMapId(boss.mapId);
                    setSelectedChannel(ch);
                    openBossDetailModal(boss);
                  },
                });
              }
            }
            // Case B.2: Boss in imminent respawn window (0 < diff <= imminentMs)
            else if (diff <= imminentMs) {
              if (notificationSettings.onImminent && !notifiedKeysRef.current.has(imminentKey)) {
                notifiedKeysRef.current.add(imminentKey);

                const minsLeft = Math.max(1, Math.ceil(diff / 60000));
                sendDesktopNotification({
                  title: `⏳ Okno Respu: ${boss.name} (CH${ch}) za ~${minsLeft} min!`,
                  body: `Obszar: ${mapName} (${boss.spawnLocationName || 'Teren'}) • Szykuj eq do walki`,
                  tag: `imminent_${boss.id}_ch${ch}`,
                  playSound: notificationSettings.soundWithNotification && soundEnabled,
                  volume: soundVolume,
                  onClick: () => {
                    setSelectedMapId(boss.mapId);
                    setSelectedChannel(ch);
                    openBossDetailModal(boss);
                  },
                });
              }
            }
          }
        });
      });

      // Cleanup stale keys if set exceeds 500 items
      if (notifiedKeysRef.current.size > 500) {
        notifiedKeysRef.current.clear();
      }
      if (announcedVoiceKeysRef.current.size > 500) {
        announcedVoiceKeysRef.current.clear();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    notificationSettings,
    voiceSettings,
    soundVolume,
    soundEnabled,
    kills,
    allBosses,
    allMaps,
    selectedMapId,
    setSelectedMapId,
    setSelectedChannel,
    openBossDetailModal,
  ]);

  // 2. Listen to SSE live kill events (other players registering kills)
  useEffect(() => {
    const handleSseKill = (e: Event) => {
      if (!notificationSettings.enabled || !notificationSettings.onKill) return;
      const permission = getNotificationPermission();
      if (permission !== 'granted') return;

      const customEvent = e as CustomEvent<KillRecord>;
      const record = customEvent.detail;
      if (!record) return;

      // Don't notify self if user himself just killed it
      if (session?.username && record.killedBy === session.username) {
        return;
      }

      const boss = allBosses.find((b) => b.id === record.bossId);
      if (!boss) return;

      if (notificationSettings.onlyCurrentMap && boss.mapId !== selectedMapId) {
        return;
      }

      const mapName = allMaps.find((m) => m.id === boss.mapId)?.name || 'Obszar';

      sendDesktopNotification({
        title: `🗡️ Zbito: ${boss.name} (CH${record.channel})`,
        body: `Łowca: ${record.killedBy || 'Inny gracz'} • ${mapName} • Resp za ~${boss.respawnMinutes} min`,
        tag: `kill_${boss.id}_ch${record.channel}_${record.killedAt}`,
        playSound: notificationSettings.soundWithNotification && soundEnabled,
        volume: soundVolume * 0.8,
        onClick: () => {
          setSelectedMapId(boss.mapId);
          setSelectedChannel(record.channel);
        },
      });
    };

    const handleSseAnnouncement = (e: Event) => {
      if (!notificationSettings.enabled || !notificationSettings.onAnnouncement) return;
      const permission = getNotificationPermission();
      if (permission !== 'granted') return;

      const customEvent = e as CustomEvent<SystemAnnouncement>;
      const announcement = customEvent.detail;
      if (!announcement) return;

      sendDesktopNotification({
        title: `📢 Komunikat Administracji: ${announcement.author}`,
        body: announcement.text,
        tag: `announcement_${announcement.id}`,
        playSound: notificationSettings.soundWithNotification && soundEnabled,
        volume: soundVolume,
      });
    };

    window.addEventListener('mt2_sse_kill', handleSseKill);
    window.addEventListener('mt2_sse_announcement', handleSseAnnouncement);

    return () => {
      window.removeEventListener('mt2_sse_kill', handleSseKill);
      window.removeEventListener('mt2_sse_announcement', handleSseAnnouncement);
    };
  }, [
    notificationSettings,
    session,
    allBosses,
    allMaps,
    selectedMapId,
    soundEnabled,
    soundVolume,
    setSelectedMapId,
    setSelectedChannel,
  ]);

  if (!activeSpeech) return null;

  // Visual non-intrusive floating toast during voice speech
  return (
    <div className="fixed bottom-5 right-5 z-[9999] max-w-sm w-auto animate-in slide-in-from-bottom-3 fade-in duration-200">
      <div className="bg-[#121622]/95 border border-amber-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center gap-3 text-amber-200">
        <div className="relative w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
          <Mic className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
              Lektor TTS (1 min)
            </span>
            {activeSpeech.channel && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                CH{activeSpeech.channel}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-200 font-medium truncate mt-0.5">
            {activeSpeech.bossName ? `${activeSpeech.bossName} za 1 min!` : activeSpeech.text}
          </p>
        </div>
        <button
          onClick={() => setActiveSpeech(null)}
          className="text-gray-400 hover:text-white p-1 rounded-md transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
