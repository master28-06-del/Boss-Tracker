// Browser SpeechSynthesis API Utility for Metin2 Boss Tracker
// Native browser text-to-speech for 1-minute boss respawn countdown announcements

export interface SpeechVoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  default: boolean;
}

export interface SpeakBossOptions {
  bossName: string;
  channel: number;
  mapName?: string;
  volume?: number; // 0.0 - 1.0
  rate?: number; // 0.8 - 1.3
  pitch?: number; // 0.8 - 1.2
  lang?: 'pl-PL' | 'en-US';
  voiceURI?: string;
  customText?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

function loadVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
    voicesLoaded = true;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }
}

/**
 * Get available voices from browser's SpeechSynthesis engine
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!voicesLoaded || cachedVoices.length === 0) {
    loadVoices();
  }
  return cachedVoices;
}

/**
 * Find the most suitable voice for a given language or voiceURI
 */
export function findBestVoice(
  lang: 'pl-PL' | 'en-US' = 'pl-PL',
  preferredVoiceURI?: string
): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  if (preferredVoiceURI) {
    const match = voices.find((v) => v.voiceURI === preferredVoiceURI);
    if (match) return match;
  }

  const prefix = lang === 'pl-PL' ? 'pl' : 'en';
  // Try exact match with language prefix
  const langMatch = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (langMatch) return langMatch;

  // If polish not found and language is pl-PL, try voices that have 'Polish' or 'Polski' in name
  if (lang === 'pl-PL') {
    const nameMatch = voices.find(
      (v) =>
        v.name.toLowerCase().includes('polish') ||
        v.name.toLowerCase().includes('polski') ||
        v.lang.toLowerCase().includes('pl')
    );
    if (nameMatch) return nameMatch;
  }

  // Fallback to default voice or first available
  const defaultVoice = voices.find((v) => v.default);
  return defaultVoice || voices[0] || null;
}

/**
 * Clean boss name and text for smoother pronunciation in Polish/English
 */
function cleanBossNameForSpeech(rawName: string): string {
  return rawName
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format channel in a natural spoken Polish or English sentence
 */
export function generateOneMinuteAnnouncementText(
  bossName: string,
  channel: number,
  lang: 'pl-PL' | 'en-US' = 'pl-PL',
  mapName?: string
): string {
  const cleanedName = cleanBossNameForSpeech(bossName);

  if (lang === 'pl-PL') {
    // Polish natural tactical phrasing
    if (mapName) {
      return `Uwaga! ${cleanedName} na kanale ${channel}, mapa ${mapName}. Jedna minuta do odrodzenia!`;
    }
    return `Uwaga! ${cleanedName} na kanale ${channel}, jedna minuta do odrodzenia!`;
  } else {
    // English phrasing
    if (mapName) {
      return `Attention! ${cleanedName} on channel ${channel}, ${mapName}. One minute until respawn!`;
    }
    return `Attention! ${cleanedName} on channel ${channel}, one minute until respawn!`;
  }
}

// Track active utterance state to notify UI
let isSpeakingNow = false;

export function isCurrentlySpeaking(): boolean {
  return isSpeakingNow;
}

/**
 * Announce boss countdown using browser's SpeechSynthesis API
 */
export function speakBossOneMinuteCountdown(options: SpeakBossOptions): boolean {
  if (!isSpeechSynthesisSupported()) {
    console.warn('[SpeechSynthesis] Browser does not support SpeechSynthesis API');
    return false;
  }

  try {
    const {
      bossName,
      channel,
      mapName,
      volume = 0.8,
      rate = 1.05,
      pitch = 1.0,
      lang = 'pl-PL',
      voiceURI,
      customText,
      onStart,
      onEnd,
      onError,
    } = options;

    // Workaround for Chrome suspended speech engine
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const textToSpeak =
      customText || generateOneMinuteAnnouncementText(bossName, channel, lang, mapName);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.volume = Math.max(0, Math.min(1, volume));
    utterance.rate = Math.max(0.5, Math.min(2, rate));
    utterance.pitch = Math.max(0.5, Math.min(2, pitch));
    utterance.lang = lang;

    const voice = findBestVoice(lang, voiceURI);
    if (voice) {
      utterance.voice = voice;
      // Some browsers require utterance.lang to match voice.lang
      if (voice.lang) {
        utterance.lang = voice.lang;
      }
    }

    utterance.onstart = () => {
      isSpeakingNow = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('mt2_speech_status', {
            detail: { isSpeaking: true, text: textToSpeak, bossName, channel },
          })
        );
      }
      if (onStart) onStart();
    };

    utterance.onend = () => {
      isSpeakingNow = false;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('mt2_speech_status', {
            detail: { isSpeaking: false, text: textToSpeak },
          })
        );
      }
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      isSpeakingNow = false;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('mt2_speech_status', {
            detail: { isSpeaking: false, error: e },
          })
        );
      }
      console.warn('[SpeechSynthesis] Error during speech utterance:', e);
      if (onError) onError(e);
    };

    // Safely queue or speak
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('[SpeechSynthesis] Failed to initiate speech synthesis:', err);
    return false;
  }
}

/**
 * Play a test announcement for settings configuration
 */
export function playTestVoiceAnnouncement(options?: {
  volume?: number;
  rate?: number;
  pitch?: number;
  lang?: 'pl-PL' | 'en-US';
  voiceURI?: string;
  sampleBoss?: string;
}): boolean {
  const lang = options?.lang || 'pl-PL';
  const boss = options?.sampleBoss || (lang === 'pl-PL' ? 'Wódz Orków' : 'Chief Orc');
  
  return speakBossOneMinuteCountdown({
    bossName: boss,
    channel: 1,
    volume: options?.volume ?? 0.8,
    rate: options?.rate ?? 1.05,
    pitch: options?.pitch ?? 1.0,
    lang,
    voiceURI: options?.voiceURI,
  });
}

/**
 * Cancel any ongoing or pending speech synthesis
 */
export function cancelSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
      isSpeakingNow = false;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('mt2_speech_status', {
            detail: { isSpeaking: false },
          })
        );
      }
    } catch (err) {
      console.error('[SpeechSynthesis] Failed to cancel speech:', err);
    }
  }
}
