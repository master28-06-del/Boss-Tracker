import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendDesktopNotification,
} from '../utils/notifications';
import {
  isSpeechSynthesisSupported,
  getAvailableVoices,
  playTestVoiceAnnouncement,
  cancelSpeech,
} from '../utils/speech';
import {
  Bell,
  BellOff,
  BellRing,
  X,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Mic,
  Sliders,
  Play,
  Square,
  Globe,
  Radio,
  Info,
} from 'lucide-react';

export const NotificationSettingsModal: React.FC = () => {
  const {
    isNotificationModalOpen,
    setNotificationModalOpen,
    notificationSettings,
    setNotificationSettings,
    voiceSettings,
    setVoiceSettings,
    soundVolume,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'voice' | 'desktop'>('voice');
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSent, setTestSent] = useState<boolean>(false);
  const [isTestSpeaking, setIsTestSpeaking] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setPermission(getNotificationPermission());
    if (isSpeechSynthesisSupported()) {
      setAvailableVoices(getAvailableVoices());
      const handleVoicesChanged = () => {
        setAvailableVoices(getAvailableVoices());
      };
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      }
    }
  }, [isNotificationModalOpen]);

  useEffect(() => {
    const handleSpeechStatus = (e: Event) => {
      const customEvent = e as CustomEvent<{ isSpeaking: boolean }>;
      setIsTestSpeaking(Boolean(customEvent.detail?.isSpeaking));
    };
    window.addEventListener('mt2_speech_status', handleSpeechStatus);
    return () => {
      window.removeEventListener('mt2_speech_status', handleSpeechStatus);
    };
  }, []);

  if (!isNotificationModalOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      setNotificationSettings({ enabled: true });
    }
  };

  const handleSendTestNotification = () => {
    if (permission !== 'granted') {
      handleRequestPermission();
      return;
    }

    sendDesktopNotification({
      title: '⚔️ Test Powiadomień: Beran-Setaou (CH1)!',
      body: 'Powiadomienia desktopowe działają prawidłowo. Otrzymasz alert, gdy boss się odrodzi!',
      tag: 'test_notification',
      playSound: notificationSettings.soundWithNotification,
      volume: soundVolume,
    });

    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  const handleTestVoice = () => {
    if (isTestSpeaking) {
      cancelSpeech();
      setIsTestSpeaking(false);
      return;
    }

    setIsTestSpeaking(true);
    playTestVoiceAnnouncement({
      volume: voiceSettings.volume,
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      lang: voiceSettings.language,
      voiceURI: voiceSettings.voiceURI,
      sampleBoss: voiceSettings.language === 'pl-PL' ? 'Wódz Orków' : 'Chief Orc',
    });
  };

  const desktopSupported = isNotificationSupported();
  const speechSupported = isSpeechSynthesisSupported();

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#121622] border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-[#161b28] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              {activeTab === 'voice' ? (
                <Mic className="w-5 h-5 text-amber-400" />
              ) : (
                <BellRing className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="font-metin font-bold text-gray-100 text-base sm:text-lg tracking-wide">
                Centrum Powiadomień i Dźwięku
              </h3>
              <p className="text-xs text-gray-400">
                Lektor SpeechSynthesis (1 min) oraz alerty systemowe na pulpicie
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              cancelSpeech();
              setNotificationModalOpen(false);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 bg-[#141824] px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'voice'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Mic className="w-4 h-4 text-amber-400" />
            <span>Lektor Głosowy TTS (1 min)</span>
            {voiceSettings.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'desktop'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Powiadomienia Pulpitowe</span>
            {notificationSettings.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* TAB 1: SPEECH SYNTHESIS API (1-MINUTE COUNTDOWN) */}
          {activeTab === 'voice' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Speech Engine Status */}
              {!speechSupported ? (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <p className="font-bold">Brak wsparcia SpeechSynthesis API</p>
                    <p className="text-xs text-rose-400/90 mt-0.5">
                      Twoja bieżąca przeglądarka nie obsługuje wbudowanego syntezatora mowy (Web Speech API).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-700/50 text-emerald-300 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-emerald-200">
                        SpeechSynthesis API gotowe do użycia
                      </p>
                      <p className="text-[11px] text-emerald-300/80">
                        Natywny syntezator przeglądarki przeczyta ostrzeżenie, gdy boss wejdzie w 1-minutowe odliczanie.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleTestVoice}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition cursor-pointer"
                  >
                    {isTestSpeaking ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Zatrzymaj</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Testuj mowę</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Master Voice Announcements Toggle */}
              <div className="p-3.5 rounded-xl bg-[#171c28] border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      voiceSettings.enabled
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-100">
                      Zapowiedzi głosowe (1 minuta do respu)
                    </p>
                    <p className="text-xs text-gray-400">
                      Opcjonalny lektor odczytujący nazwę bossa i kanał przy 60s
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceSettings.enabled}
                    onChange={(e) => setVoiceSettings({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Speech Options Group */}
              <div
                className={`space-y-3.5 ${
                  !voiceSettings.enabled ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {/* Voice Volume Slider */}
                <div className="p-3 rounded-xl bg-[#151924] border border-gray-800/80 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      Głośność lektora
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      {Math.round(voiceSettings.volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={voiceSettings.volume}
                    onChange={(e) =>
                      setVoiceSettings({ volume: parseFloat(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Speech Rate (Speed) Slider */}
                <div className="p-3 rounded-xl bg-[#151924] border border-gray-800/80 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      Tempo mowy (Szybkość)
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {voiceSettings.rate}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.05"
                    value={voiceSettings.rate}
                    onChange={(e) =>
                      setVoiceSettings({ rate: parseFloat(e.target.value) })
                    }
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>0.8x (Spokojne)</span>
                    <span>1.05x (Zalecane)</span>
                    <span>1.4x (Szybkie)</span>
                  </div>
                </div>

                {/* Spoken Language & Phrase Format */}
                <div className="p-3 rounded-xl bg-[#151924] border border-gray-800/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      Język zapowiedzi lektora
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setVoiceSettings({ language: 'pl-PL' })}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                          voiceSettings.language === 'pl-PL'
                            ? 'bg-amber-500 text-gray-950 shadow'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        Polski (pl-PL)
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceSettings({ language: 'en-US' })}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                          voiceSettings.language === 'en-US'
                            ? 'bg-amber-500 text-gray-950 shadow'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        English (en-US)
                      </button>
                    </div>
                  </div>

                  {/* Spoken preview */}
                  <div className="p-2 rounded bg-[#0d1017] border border-gray-850 text-[11px] font-mono text-gray-300">
                    <span className="text-gray-500">Wzór zapowiedzi: </span>
                    <span className="text-amber-300 italic">
                      {voiceSettings.language === 'pl-PL'
                        ? '"Uwaga! [Boss] na kanale [CH], jedna minuta do odrodzenia!"'
                        : '"Attention! [Boss] on channel [CH], one minute until respawn!"'}
                    </span>
                  </div>
                </div>

                {/* Voice Selection Dropdown (if multiple voices available) */}
                {availableVoices.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#151924] border border-gray-800/80 space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-200">
                      Głos syntezatora (Silnik TTS):
                    </label>
                    <select
                      value={voiceSettings.voiceURI || ''}
                      onChange={(e) =>
                        setVoiceSettings({ voiceURI: e.target.value || undefined })
                      }
                      className="w-full bg-[#0d1017] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Domyślny głos systemowy ({voiceSettings.language}) --</option>
                      {availableVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang}){v.default ? ' [Domyślny]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Map Scope Filter */}
                <div className="p-3 rounded-xl bg-[#151924] border border-gray-800/80 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-200">
                      Tylko dla aktualnie otwartej mapy
                    </p>
                    <p className="text-xs text-gray-400">
                      Lektor nie będzie czytał bossów z innych krain
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceSettings.onlyCurrentMap}
                    onChange={(e) =>
                      setVoiceSettings({ onlyCurrentMap: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-700 text-amber-500 focus:ring-amber-500 bg-gray-850 cursor-pointer"
                  />
                </div>

                {/* Include Map Name in Speech */}
                <div className="p-3 rounded-xl bg-[#151924] border border-gray-800/80 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-200">
                      Wymieniaj nazwę mapy w komunikacie
                    </p>
                    <p className="text-xs text-gray-400">
                      np. &quot;Wódz Orków na kanale 1, mapa Dolina Seungryong...&quot;
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceSettings.includeMapName}
                    onChange={(e) =>
                      setVoiceSettings({ includeMapName: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-700 text-amber-500 focus:ring-amber-500 bg-gray-850 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESKTOP NOTIFICATIONS */}
          {activeTab === 'desktop' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Permission Status Box */}
              {!desktopSupported ? (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <p className="font-bold">Brak wsparcia w Twojej przeglądarce</p>
                    <p className="text-xs text-rose-400/90 mt-0.5">
                      Twoja bieżąca przeglądarka nie obsługuje Web Notifications API.
                    </p>
                  </div>
                </div>
              ) : permission === 'granted' ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-200">Zgoda przeglądarki aktywna</p>
                      <p className="text-xs text-emerald-300/80 mt-0.5">
                        Aplikacja ma pełne uprawnienia do wyświetlania powiadomień systemowych na pulpicie.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSendTestNotification}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-semibold text-xs transition cursor-pointer"
                  >
                    {testSent ? 'Wysłano!' : 'Testuj alert'}
                  </button>
                </div>
              ) : permission === 'denied' ? (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-200">Powiadomienia są zablokowane</p>
                      <p className="text-xs text-rose-300/80 mt-0.5">
                        Przeglądarka ma wyłączone powiadomienia dla tej domeny. Aby je włączyć, kliknij ikonę kłódki lub suwaków obok adresu URL w pasku przeglądarki i wybierz <strong>Powiadomienia &rarr; Zezwalaj</strong>, a następnie odśwież stronę.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/60 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-100">Wymagana aktywacja powiadomień</p>
                      <p className="text-xs text-amber-300/80 mt-0.5">
                        Kliknij przycisk, aby zezwolić przeglądarce na wyświetlanie okienek alertów na pulpicie.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRequestPermission}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-lg transition cursor-pointer shrink-0 text-center"
                  >
                    Zezwól na powiadomienia
                  </button>
                </div>
              )}

              {/* Master Enable/Disable Switch */}
              <div className="p-3.5 rounded-xl bg-[#171c28] border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      notificationSettings.enabled
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {notificationSettings.enabled ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-100">Włącz powiadomienia w trackerze</p>
                    <p className="text-xs text-gray-400">
                      Główny przełącznik powiadomień systemowych
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.enabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setNotificationSettings({ enabled });
                      if (enabled && permission === 'default') {
                        handleRequestPermission();
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Settings Options Group */}
              <div
                className={`space-y-3 pt-2 ${
                  !notificationSettings.enabled ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Zdarzenia wyzwalające alerty:
                </h4>

                {/* Event: Boss Respawn */}
                <div className="p-3 rounded-lg bg-[#151924] border border-gray-800/80 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-200">Odrodzenie Bossa (Gotowy)</p>
                    <p className="text-xs text-gray-400">
                      Wyślij powiadomienie, gdy timer odliczania minie (status: Żywy)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.onRespawn}
                    onChange={(e) => setNotificationSettings({ onRespawn: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 text-amber-500 focus:ring-amber-500 bg-gray-850 cursor-pointer"
                  />
                </div>

                {/* Event: Imminent Respawn Window */}
                <div className="p-3 rounded-lg bg-[#151924] border border-gray-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-200">Przed respawnem (Okno respu)</p>
                      <p className="text-xs text-gray-400">
                        Ostrzegaj przed odrodzeniem, aby zdążyć dobiec na mapę
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.onImminent}
                      onChange={(e) => setNotificationSettings({ onImminent: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-700 text-amber-500 focus:ring-amber-500 bg-gray-850 cursor-pointer"
                    />
                  </div>

                  {notificationSettings.onImminent && (
                    <div className="flex items-center justify-between pt-1 border-t border-gray-800/60 text-xs">
                      <span className="text-gray-400">Czas wyprzedzenia:</span>
                      <select
                        value={notificationSettings.imminentMinutes}
                        onChange={(e) =>
                          setNotificationSettings({ imminentMinutes: parseInt(e.target.value, 10) })
                        }
                        className="bg-[#0e111a] border border-gray-700 rounded px-2 py-1 text-amber-300 font-bold focus:outline-none"
                      >
                        <option value={1}>1 minuta przed</option>
                        <option value={2}>2 minuty przed</option>
                        <option value={3}>3 minuty przed</option>
                        <option value={5}>5 minut przed</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Event: Boss Killed By Ally/Others */}
                <div className="p-3 rounded-lg bg-[#151924] border border-gray-800/80 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-200">Zbicie bossa przez innego gracza</p>
                    <p className="text-xs text-gray-400">
                      Gdy inny łowca zarejestruje zbicie na serwerze przez SSE
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.onKill}
                    onChange={(e) => setNotificationSettings({ onKill: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 text-amber-500 focus:ring-amber-500 bg-gray-850 cursor-pointer"
                  />
                </div>

                {/* Event: Admin Announcements */}
                <div className="p-3 rounded-lg bg-[#151924] border border-gray-800/80 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-200">Ważne komunikaty administracji</p>
                    <p className="text-xs text-gray-400">
                      Wyświetl alert desktopowy, gdy admin opublikuje ogłoszenie
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.onAnnouncement}
                    onChange={(e) => setNotificationSettings({ onAnnouncement: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 text-amber-500 focus:ring-amber-500 bg-gray-850 cursor-pointer"
                  />
                </div>

                {/* Filter: Only Current Map */}
                <div className="p-3 rounded-lg bg-[#151924] border border-gray-800/80 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-200">Tylko aktualnie wybrana mapa</p>
                    <p className="text-xs text-gray-400">
                      Ignoruj bossów z innych map (ogranicza liczbę powiadomień)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.onlyCurrentMap}
                    onChange={(e) => setNotificationSettings({ onlyCurrentMap: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 text-amber-500 focus:ring-amber-500 bg-gray-850 cursor-pointer"
                  />
                </div>

                {/* Sound with notification */}
                <div className="p-3 rounded-lg bg-[#151924] border border-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="font-semibold text-gray-200">Dźwięk powiadomienia</p>
                      <p className="text-xs text-gray-400">
                        Odtwarzaj syntetyczny gong w tle wraz z alertem
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.soundWithNotification}
                    onChange={(e) =>
                      setNotificationSettings({ soundWithNotification: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-700 text-cyan-500 focus:ring-cyan-500 bg-gray-850 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-gray-800 bg-[#161b28] flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-400">
            {activeTab === 'voice' ? (
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                Odliczanie 1-minutowe działa w tle podczas gry
              </span>
            ) : (
              <button
                onClick={handleSendTestNotification}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition border border-gray-700 cursor-pointer"
              >
                {testSent ? 'Wysłano test!' : 'Test powiadomienia'}
              </button>
            )}
          </div>

          <button
            onClick={() => {
              cancelSpeech();
              setNotificationModalOpen(false);
            }}
            className="px-5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition cursor-pointer shadow"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
