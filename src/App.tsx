import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { BossList } from './components/BossList';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ChannelMatrixModal } from './components/ChannelMatrixModal';
import { KillConfirmationModal } from './components/KillConfirmationModal';
import { BossDetailModal } from './components/BossDetailModal';
import { AddCustomMapModal } from './components/AddCustomMapModal';
import { ItemDatabaseModal } from './components/ItemDatabaseModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { NotificationManager } from './components/NotificationManager';
import { initRealtimeSSE } from './services/api';
import { useAppStore } from './store/useAppStore';
import { Map, List, Flame, ShieldAlert, Sparkles } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

function TrackerDashboard() {
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  // Initialize Real-time Server-Sent Events stream
  useEffect(() => {
    const cleanup = initRealtimeSSE();
    return () => cleanup();
  }, []);

  return (
    <div className="h-[100dvh] w-full bg-[#0a0c12] text-gray-200 flex flex-col overflow-y-auto lg:overflow-hidden selection:bg-amber-500/30 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Mobile view switcher tab bar */}
      <div className="flex lg:hidden items-center justify-around bg-[#121620] border-b border-gray-800 p-1.5 text-xs font-bold shrink-0 sticky top-0 z-30">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'map'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Interaktywna Mapa</span>
        </button>
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'list'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Lista & Cooldowny</span>
        </button>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 min-h-0 max-w-[1700px] w-full mx-auto p-1.5 sm:p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3.5 items-stretch overflow-hidden">
        {/* Left/Center: Interactive Map (visible always on desktop, controlled by mobileTab on mobile) */}
        <section
          className={`lg:col-span-8 xl:col-span-8 flex flex-col h-[calc(100dvh-150px)] sm:h-[calc(100dvh-140px)] lg:h-full min-h-[440px] ${
            mobileTab === 'map' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <MapView />
        </section>

        {/* Right: Boss Roster & Live Ticking Cooldowns */}
        <section
          className={`lg:col-span-4 xl:col-span-4 flex flex-col h-[calc(100dvh-150px)] sm:h-[calc(100dvh-140px)] lg:h-full min-h-[440px] ${
            mobileTab === 'list' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <BossList />
        </section>
      </main>

      {/* Real-time Notification Engine */}
      <NotificationManager />

      {/* Interactive Modals */}
      <AuthModal />
      <AdminPanelModal />
      <ChannelMatrixModal />
      <KillConfirmationModal />
      <BossDetailModal />
      <AddCustomMapModal />
      <ItemDatabaseModal />
      <NotificationSettingsModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TrackerDashboard />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
