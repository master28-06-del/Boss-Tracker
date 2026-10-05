import React from 'react';
import { useAppStore, useAllMaps } from '../store/useAppStore';
import { AnnouncementBanner } from './navbar/AnnouncementBanner';
import { DesktopNav } from './navbar/DesktopNav';
import { MobileNav } from './navbar/MobileNav';

export const Navbar: React.FC = () => {
  const {
    selectedChannel,
    setSelectedChannel,
    selectedMapId,
    setSelectedMapId,
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    serverConnected,
    session,
    setSession,
    setAuthModalOpen,
    setAdminModalOpen,
    setMatrixModalOpen,
    setAddMapModalOpen,
    setItemDatabaseModalOpen,
    notificationSettings,
    setNotificationModalOpen,
    systemAnnouncement,
  } = useAppStore();

  const allMaps = useAllMaps();

  const handleLogout = () => {
    setSession(null);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d1017]/95 backdrop-blur border-b border-gray-800 shadow-xl shrink-0">
      {/* Announcement Banner */}
      <AnnouncementBanner announcement={systemAnnouncement} />

      {/* Desktop Navigation Row (lg+) */}
      <DesktopNav
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        selectedMapId={selectedMapId}
        onSelectMapId={setSelectedMapId}
        allMaps={allMaps}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        soundVolume={soundVolume}
        onChangeVolume={setSoundVolume}
        serverConnected={serverConnected}
        notificationSettings={notificationSettings}
        onOpenNotifications={() => setNotificationModalOpen(true)}
        session={session}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenAdminModal={() => setAdminModalOpen(true)}
        onLogout={handleLogout}
        onOpenAddMapModal={() => setAddMapModalOpen(true)}
        onOpenMatrixModal={() => setMatrixModalOpen(true)}
        onOpenItemDatabaseModal={() => setItemDatabaseModalOpen(true)}
      />

      {/* Mobile Navigation ( < lg ) */}
      <MobileNav
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        selectedMapId={selectedMapId}
        onSelectMapId={setSelectedMapId}
        allMaps={allMaps}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        soundVolume={soundVolume}
        onChangeVolume={setSoundVolume}
        serverConnected={serverConnected}
        notificationSettings={notificationSettings}
        onOpenNotifications={() => setNotificationModalOpen(true)}
        session={session}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenAdminModal={() => setAdminModalOpen(true)}
        onLogout={handleLogout}
        onOpenAddMapModal={() => setAddMapModalOpen(true)}
        onOpenMatrixModal={() => setMatrixModalOpen(true)}
        onOpenItemDatabaseModal={() => setItemDatabaseModalOpen(true)}
      />
    </header>
  );
};
