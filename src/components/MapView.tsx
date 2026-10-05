import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useAppStore, useAllMaps, useAllBosses } from '../store/useAppStore';
import { METIN2_MAPS } from '../data/maps';
import { METIN2_BOSSES } from '../data/bosses';
import { getMapSvgDataUrl } from '../utils/mapTextureGenerator';
import { getMapImageUrl } from '../utils/mapImages';
import { BossDefinition, BossStatus, Coordinates, KillRecord, MapDefinition } from '../types';
import { canResetTimers, canRemoveMarkers, isAdmin } from '../utils/permissions';
import {
  MapPin,
  Crosshair,
  Sparkles,
  AlertCircle,
  Clock,
  Skull,
  ShieldAlert,
  Plus,
  Info,
  X,
  Flame,
  RotateCcw,
  Check,
  Trash2,
  Navigation,
} from 'lucide-react';
import { deleteCustomMapMarker, submitBossKill, resetSingleBossKill, addCustomMapMarker, deleteCustomMap } from '../services/api';
import { playBossKilledSound } from '../utils/sound';
import { MapPointActionPanel } from './map/MapPointActionPanel';
import { MapCompassAndRadar } from './map/MapCompassAndRadar';
import { MapTopBar } from './map/MapTopBar';
import { DeleteMapConfirmModal } from './map/DeleteMapConfirmModal';
import {
  toLatLng,
  fromLatLng,
  formatSeconds,
  createBossMarkerHtml,
  createBossPopupHtml,
} from './map/mapMarkerUtils';

export const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const spawnZonesLayerRef = useRef<L.LayerGroup | null>(null);
  const landmarksLayerRef = useRef<L.LayerGroup | null>(null);
  const clickPinLayerRef = useRef<L.LayerGroup | null>(null);
  const radarCoordsRef = useRef<HTMLSpanElement>(null);
  const activeOpenBossPopupIdRef = useRef<string | null>(null);

  const {
    selectedMapId,
    setSelectedMapId,
    selectedChannel,
    kills,
    customMarkers,
    bossConfigs,
    session,
    isBossDetailModalOpen,
    openBossDetailModal,
    soundEnabled,
    soundVolume,
    applyOptimisticKill,
    rollbackOptimisticKill,
  } = useAppStore();

  const [showSpawnZones, setShowSpawnZones] = useState<boolean>(true);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);

  // In-map click interaction state (doesn't hide or blur the map!)
  const [activeClickPoint, setActiveClickPoint] = useState<Coordinates | null>(null);
  const [selectedBossToKill, setSelectedBossToKill] = useState<string>('');
  const [customMarkerTitle, setCustomMarkerTitle] = useState<string>('');
  const [customMarkerNotes, setCustomMarkerNotes] = useState<string>('');
  const [customMarkerColor, setCustomMarkerColor] = useState<string>('#38bdf8');
  const [isSavingMarker, setIsSavingMarker] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const allMaps = useAllMaps();
  const allBosses = useAllBosses();

  // Map definition
  const currentMap = useMemo(() => {
    return allMaps.find((m) => m.id === selectedMapId) || allMaps[0] || METIN2_MAPS[0];
  }, [allMaps, selectedMapId]);

  // Bosses assigned to this map
  const mapBosses = useMemo(() => {
    return allBosses.filter((b) => b.mapId === selectedMapId);
  }, [allBosses, selectedMapId]);

  // Delete custom map state & handler
  const [mapToDelete, setMapToDelete] = useState<MapDefinition | null>(null);

  const handleDeleteCurrentMap = () => {
    if (!currentMap.isCustom) return;
    setMapToDelete(currentMap);
  };

  // Update default selected boss when map changes
  useEffect(() => {
    if (mapBosses.length > 0) {
      setSelectedBossToKill(mapBosses[0].id);
    } else {
      setSelectedBossToKill('');
    }
  }, [mapBosses]);

  // Ensure Leaflet resizes correctly whenever container dimensions change
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const ro = new ResizeObserver(() => {
      leafletMapRef.current?.invalidateSize();
    });
    ro.observe(mapContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      // 1000x1000 coordinate plane with CRS.Simple
      const map = L.map(mapContainerRef.current, {
        crs: L.CRS.Simple,
        minZoom: -1.2,
        maxZoom: 2,
        zoomSnap: 0.1,
        zoomDelta: 0.5,
        attributionControl: false,
        maxBoundsViscosity: 0.8,
        closePopupOnClick: false,
      });

      const bounds: L.LatLngBoundsExpression = [
        [0, 0],
        [1000, 1000],
      ];

      map.setMaxBounds(bounds);
      map.fitBounds(bounds);

      // Create layers
      const spawnZonesLayer = L.layerGroup().addTo(map);
      const landmarksLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);
      const clickPinLayer = L.layerGroup().addTo(map);

      spawnZonesLayerRef.current = spawnZonesLayer;
      landmarksLayerRef.current = landmarksLayer;
      markersLayerRef.current = markersLayer;
      clickPinLayerRef.current = clickPinLayer;
      leafletMapRef.current = map;

      // Mouse move listener for radar coordinates (updates DOM directly, zero React re-renders)
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        const { x, y } = fromLatLng(e.latlng);
        if (radarCoordsRef.current) {
          radarCoordsRef.current.innerHTML = `X: <span class="text-amber-300 font-bold">${x}</span> &nbsp; Y: <span class="text-amber-300 font-bold">${y}</span>`;
        }
      });

      map.on('mouseout', () => {
        if (radarCoordsRef.current) {
          radarCoordsRef.current.innerHTML = `<span class="text-gray-500 italic">Najedź na mapę</span>`;
        }
      });

      // Click on map empty space -> Show sleek in-map contextual action panel without blurring or hiding the map!
      map.on('click', (e: L.LeafletMouseEvent) => {
        const target = e.originalEvent.target as HTMLElement;
        if (target && target.closest('.leaflet-interactive, .leaflet-popup, .leaflet-control, .custom-boss-marker')) {
          return;
        }

        // If a boss popup was open, clicking random empty map space closes the boss window!
        if (activeOpenBossPopupIdRef.current) {
          map.closePopup();
          activeOpenBossPopupIdRef.current = null;
          return;
        }

        const { x, y } = fromLatLng(e.latlng);
        setActiveClickPoint({ x, y });
        setActionSuccessMsg(null);
      });
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update map background texture when selectedMapId changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const bounds: L.LatLngBoundsExpression = [
      [0, 0],
      [1000, 1000],
    ];

    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
    }

    const mapTexture = currentMap?.imageUrl || getMapImageUrl(selectedMapId) || getMapSvgDataUrl(selectedMapId, currentMap);
    const newOverlay = L.imageOverlay(mapTexture, bounds, {
      opacity: 1.0,
      interactive: false,
    }).addTo(map);

    imageOverlayRef.current = newOverlay;
    map.fitBounds(bounds);
    setActiveClickPoint(null);
  }, [selectedMapId, currentMap]);

  // Update visual reticle pin for active click point
  useEffect(() => {
    const pinLayer = clickPinLayerRef.current;
    if (!pinLayer) return;

    pinLayer.clearLayers();

    if (activeClickPoint) {
      const pinHtml = `
        <div class="relative flex items-center justify-center select-none pointer-events-none">
          <div class="w-8 h-8 rounded-full border-2 border-amber-400 bg-amber-400/20 animate-ping absolute"></div>
          <div class="w-4 h-4 rounded-full border-2 border-amber-300 bg-amber-500 shadow-lg shadow-amber-500/50 flex items-center justify-center text-[8px] font-mono font-bold text-black">
            ✦
          </div>
          <div class="absolute -top-7 whitespace-nowrap bg-black/90 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-amber-500/50 shadow">
            X:${activeClickPoint.x} Y:${activeClickPoint.y}
          </div>
        </div>
      `;

      const pinIcon = L.divIcon({
        html: pinHtml,
        className: 'active-reticle-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(toLatLng(activeClickPoint.x, activeClickPoint.y), {
        icon: pinIcon,
        interactive: false,
      });

      pinLayer.addLayer(marker);
    }
  }, [activeClickPoint]);

  // Helper to compute boss status and remaining time
  const getBossState = (boss: BossDefinition) => {
    const key = `${boss.id}_ch${selectedChannel}`;
    const record: KillRecord | undefined = kills[key];
    const now = Date.now();

    if (!record) {
      return { status: 'alive' as BossStatus, remainingSeconds: 0, text: 'ŻYWY' };
    }

    const diff = record.respawnAt - now;
    const config = bossConfigs[boss.id] || {
      respawnMinutes: boss.respawnMinutes,
      varianceMinutes: boss.varianceMinutes,
    };
    const windowStart = record.respawnAt - (config.varianceMinutes || 0) * 60 * 1000;

    if (diff <= 0) {
      const overdueMins = Math.floor(Math.abs(diff) / 60000);
      return { status: 'alive' as BossStatus, remainingSeconds: 0, text: `ŻYWY (+${overdueMins}m)` };
    }

    if (now >= windowStart) {
      return { status: 'imminent' as BossStatus, remainingSeconds: Math.floor(diff / 1000), text: 'W OKNIE RESPU' };
    }

    return { status: 'dead' as BossStatus, remainingSeconds: Math.floor(diff / 1000), text: 'MARTWY' };
  };

  const formatSeconds = (sec: number) => {
    if (sec <= 0) return '00:00';
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    if (hours > 0) {
      return `${hours}g ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Close map popups whenever the boss detail modal is opened
  useEffect(() => {
    if (isBossDetailModalOpen) {
      activeOpenBossPopupIdRef.current = null;
      if (leafletMapRef.current) {
        leafletMapRef.current.closePopup();
      }
    }
  }, [isBossDetailModalOpen]);

  // Re-render markers & spawn zones when kills, channel, or map changes
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    const spawnZonesLayer = spawnZonesLayerRef.current;
    const landmarksLayer = landmarksLayerRef.current;
    const map = leafletMapRef.current;

    if (!markersLayer || !spawnZonesLayer || !map) return;

    const previouslyOpenBossId = activeOpenBossPopupIdRef.current;
    markersLayer.clearLayers();
    spawnZonesLayer.clearLayers();
    if (landmarksLayer) {
      landmarksLayer.clearLayers();
    }

    // Render Boss Markers for all bosses on this map
    mapBosses.forEach((boss) => {
      const key = `${boss.id}_ch${selectedChannel}`;
      const record = kills[key];
      const coords = record?.coords || boss.defaultCoords;
      const { status, remainingSeconds, text } = getBossState(boss);

      let statusColor = '#10b981'; // green alive
      let statusBg = 'bg-emerald-500';
      let ringGlow = 'ring-emerald-500/50 shadow-emerald-500/30';

      if (status === 'dead') {
        statusColor = '#ef4444'; // red dead
        statusBg = 'bg-rose-600';
        ringGlow = 'ring-rose-500/50 shadow-rose-500/30';
      } else if (status === 'imminent') {
        statusColor = '#f59e0b'; // amber window
        statusBg = 'bg-amber-500';
        ringGlow = 'ring-amber-500/50 shadow-amber-500/30 animate-pulse';
      }

      // Spawn radius zone circle
      if (showSpawnZones) {
        const circle = L.circle(toLatLng(coords.x, coords.y), {
          radius: 40,
          color: statusColor,
          fillColor: statusColor,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4',
        });
        spawnZonesLayer.addLayer(circle);
      }

      // Custom HTML Marker icon
      const iconHtml = `
        <div class="relative group cursor-pointer select-none" id="marker-boss-${boss.id}">
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#161b26] border-2 shadow-lg ${ringGlow} transform transition-all duration-200 group-hover:scale-125" style="border-color: ${statusColor}">
            <span class="text-xs font-black text-amber-300 font-mono">${boss.level}</span>
          </div>
          <!-- Channel indicator pill -->
          <div class="absolute -top-2 -right-2 px-1 py-0.5 rounded text-[9px] font-bold bg-[#0f172a] text-amber-400 border border-amber-500/40 leading-none">
            CH${selectedChannel}
          </div>
          <!-- Label below marker -->
          <div class="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-black/90 text-[11px] font-medium text-gray-200 border border-gray-700/80 pointer-events-none shadow-md">
            <span class="text-amber-300 font-bold">${boss.name}</span>
            ${status !== 'alive' ? `<span class="ml-1.5 font-mono text-[10px] text-rose-300 font-bold marker-countdown" data-boss-id="${boss.id}">${formatSeconds(remainingSeconds)}</span>` : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-boss-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -25],
      });

      const marker = L.marker(toLatLng(coords.x, coords.y), { icon: customIcon });

      // Stop click propagation to map and dismiss any active click panel
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setActiveClickPoint(null);
      });

      const isAdmin = canResetTimers(session);

      // Build rich popup
      const popupHtml = `
        <div class="p-3.5 min-w-[250px] text-gray-200 bg-[#141824] border border-gray-700/80 rounded-xl shadow-2xl" id="popup-content-${boss.id}">
          <div class="flex items-start justify-between gap-2 border-b border-gray-700/80 pb-2">
            <div>
              <div class="text-[10px] uppercase tracking-wider text-amber-400 font-bold font-mono">POZIOM ${boss.level} • CH${selectedChannel}</div>
              <h4 class="font-bold text-base text-gray-100 font-metin">${boss.name}</h4>
            </div>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${statusBg}">
              ${text}
            </span>
          </div>

          <div class="py-2.5 space-y-1.5 text-xs">
            <div class="flex items-center justify-between text-gray-400">
              <span>Współrzędne:</span>
              <span class="font-mono text-gray-200 font-semibold">X: ${coords.x}, Y: ${coords.y}</span>
            </div>
            <div class="flex items-center justify-between text-gray-400">
              <span>Czas odrodzenia:</span>
              <span class="font-mono text-amber-300 font-bold">${bossConfigs[boss.id]?.respawnMinutes || boss.respawnMinutes} min</span>
            </div>
            ${
              record
                ? `
              <div class="flex items-center justify-between text-gray-400">
                <span>Zbity przez:</span>
                <span class="text-gray-300 font-medium">${record.killedBy}</span>
              </div>
              <div class="flex items-center justify-between text-gray-400">
                <span>Pozostały czas:</span>
                <span class="font-mono font-bold text-rose-400 text-sm popup-countdown" data-boss-id="${boss.id}">${formatSeconds(remainingSeconds)}</span>
              </div>
            `
                : ''
            }
          </div>

          <!-- Actions -->
          <div class="pt-2 border-t border-gray-700/80 space-y-1.5">
            <div class="flex items-center gap-1.5">
              <button
                id="btn-kill-${boss.id}"
                class="flex-1 py-1.5 px-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <span>${record ? 'ZBIJ PONOWNIE' : 'OZNACZ JAKO ZBITY'}</span>
              </button>

              ${
                record && isAdmin
                  ? `
                <button
                  id="btn-reset-${boss.id}"
                  title="Resetuj timer (Admin)"
                  class="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-amber-400 border border-gray-700 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
              `
                  : ''
              }
            </div>

            <button
              id="btn-details-${boss.id}"
              class="w-full py-2 px-3 bg-gradient-to-r from-amber-600/30 to-amber-700/30 hover:from-amber-600/50 hover:to-amber-700/50 text-amber-300 hover:text-amber-200 font-semibold text-xs rounded-lg border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span>Szczegóły bossa i podgląd dropu</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        autoClose: true,
        closeOnClick: true,
        autoPan: false, // Prevents map from bouncing, scrolling or jittering
        className: 'metin2-boss-popup',
        offset: [0, -10],
      });

      marker.on('popupopen', (e) => {
        activeOpenBossPopupIdRef.current = boss.id;
        const popupEl = e.popup?.getElement();
        if (popupEl) {
          L.DomEvent.disableClickPropagation(popupEl);
          L.DomEvent.disableScrollPropagation(popupEl);

          // If boss marker is near the top of the container, flip popup BELOW the marker so boss name is always 100% visible
          try {
            const pt = map.latLngToContainerPoint(marker.getLatLng());
            const mustFlipBelow = pt.y < 270;
            if (mustFlipBelow) {
              popupEl.classList.add('popup-placement-below');
            } else {
              popupEl.classList.remove('popup-placement-below');
            }
          } catch {
            // Ignore container point calculation errors during unmounted states
          }
        }

        // Kill button
        const killBtn = document.getElementById(`btn-kill-${boss.id}`);
        if (killBtn) {
          killBtn.onclick = async (ev) => {
            ev.stopPropagation();
            marker.closePopup();
            handleDirectBossKill(boss, coords);
          };
        }

        // Reset button
        const resetBtn = document.getElementById(`btn-reset-${boss.id}`);
        if (resetBtn) {
          resetBtn.onclick = async (ev) => {
            ev.stopPropagation();
            marker.closePopup();
            try {
              await resetSingleBossKill(boss.id, selectedChannel);
            } catch (err) {
              console.error(err);
              alert('Nie udało się zresetować timera.');
            }
          };
        }

        // Details button
        const detailsBtn = document.getElementById(`btn-details-${boss.id}`);
        if (detailsBtn) {
          detailsBtn.onclick = (ev) => {
            ev.stopPropagation();
            activeOpenBossPopupIdRef.current = null;
            if (leafletMapRef.current) {
              leafletMapRef.current.closePopup();
            }
            marker.closePopup();
            openBossDetailModal(boss);
          };
        }
      });

      marker.on('popupclose', () => {
        if (activeOpenBossPopupIdRef.current === boss.id) {
          activeOpenBossPopupIdRef.current = null;
        }
      });

      markersLayer.addLayer(marker);

      if (!isBossDetailModalOpen && previouslyOpenBossId === boss.id) {
        setTimeout(() => {
          marker.openPopup();
        }, 10);
      }
    });

    // Render Custom Player Markers for this map and channel
    const mapCustomMarkers = customMarkers.filter(
      (m) => m.mapId === selectedMapId && m.channel === selectedChannel
    );

    const isAdmin = canRemoveMarkers(session);

    mapCustomMarkers.forEach((markerData) => {
      const markerColor = markerData.color || '#38bdf8';
      const iconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer" id="marker-custom-${markerData.id}">
          <div class="w-7 h-7 rounded-full flex items-center justify-center bg-gray-900 border-2 shadow-xl" style="border-color: ${markerColor}">
            <div class="w-2.5 h-2.5 rounded-full" style="background-color: ${markerColor}"></div>
          </div>
          <div class="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping" style="background-color: ${markerColor}"></div>
          <div class="mt-1 px-2 py-0.5 rounded-md bg-gray-950/95 border border-gray-700/90 shadow-xl text-[10px] text-center max-w-[150px] pointer-events-none">
            <div class="font-bold text-gray-100 truncate">${markerData.title}</div>
            ${markerData.notes ? `<div class="text-[9px] text-amber-300 font-medium italic truncate max-w-[140px]">"${markerData.notes}"</div>` : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-pin-marker',
        iconSize: [32, 48],
        iconAnchor: [16, 14],
      });

      const pinMarker = L.marker(toLatLng(markerData.coords.x, markerData.coords.y), { icon: customIcon });

      const pinPopupHtml = `
        <div class="p-3.5 min-w-[240px] max-w-[290px] text-gray-200 bg-[#141824] border border-gray-700/90 rounded-xl shadow-2xl">
          <div class="flex items-center justify-between gap-2 border-b border-gray-700/80 pb-2">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${markerColor}"></span>
              <span class="font-bold text-sm text-gray-100">${markerData.title}</span>
            </div>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-bold">CH${markerData.channel}</span>
          </div>

          <div class="py-2.5 text-xs space-y-2">
            <div class="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 shadow-inner">
              <div class="flex items-center justify-between text-[10px] font-mono text-amber-400 font-bold mb-1">
                <span>OPIS GRACZA:</span>
                <span class="text-gray-300 font-normal font-sans">dodał: ${markerData.createdBy}</span>
              </div>
              <div class="text-xs text-amber-100 italic leading-relaxed break-words">
                ${markerData.notes ? `"${markerData.notes}"` : '<span class="text-gray-400 not-italic">Brak dodatkowego opisu</span>'}
              </div>
            </div>

            <div class="flex items-center justify-between text-[11px] text-gray-400">
              <span>Współrzędne:</span>
              <span class="font-mono text-gray-200 font-bold">X: ${markerData.coords.x}, Y: ${markerData.coords.y}</span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-gray-400">
              <span>Stworzył:</span>
              <span class="text-cyan-300 font-semibold">${markerData.createdBy}</span>
            </div>
          </div>

          ${
            isAdmin
              ? `
            <button id="del-marker-${markerData.id}" class="w-full mt-1 text-center py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold rounded-lg border border-rose-700/50 cursor-pointer transition-colors">
              Usuń znacznik (Admin)
            </button>
          `
              : `
            <div class="text-[10px] text-gray-500 italic text-center pt-1 border-t border-gray-800">
              Usuwanie znaczników wymaga roli Administratora
            </div>
          `
          }
        </div>
      `;

      pinMarker.bindPopup(pinPopupHtml);
      pinMarker.on('popupopen', () => {
        if (isAdmin) {
          const delBtn = document.getElementById(`del-marker-${markerData.id}`);
          if (delBtn) {
            delBtn.onclick = async () => {
              pinMarker.closePopup();
              try {
                await deleteCustomMapMarker(markerData.id);
              } catch (err) {
                console.error(err);
                alert('Nie udało się usunąć znacznika.');
              }
            };
          }
        }
      });

      markersLayer.addLayer(pinMarker);
    });

    // Render Tactical Map Landmarks (Portals, Towns, Boss Spots) if enabled
    if (showLandmarks && landmarksLayer && currentMap.landmarks && currentMap.landmarks.length > 0) {
      currentMap.landmarks.forEach((landmark, idx) => {
        let borderColor = '#38bdf8';
        let bgColor = '#0f172a';
        let badgeIcon = '★';

        if (landmark.type === 'portal') {
          borderColor = '#a855f7';
          bgColor = '#3b0764';
          badgeIcon = '🌀';
        } else if (landmark.type === 'town') {
          borderColor = '#10b981';
          bgColor = '#064e3b';
          badgeIcon = '🏛️';
        } else if (landmark.type === 'boss_spot') {
          borderColor = '#f59e0b';
          bgColor = '#451a03';
          badgeIcon = '🎯';
        }

        const landmarkHtml = `
          <div class="relative group cursor-pointer select-none" id="landmark-${idx}">
            <div class="flex items-center justify-center w-6 h-6 rounded-full border shadow transition-transform group-hover:scale-110" style="border-color: ${borderColor}; background-color: ${bgColor}">
              <span class="text-[10px] leading-none">${badgeIcon}</span>
            </div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.2 rounded bg-black/90 text-[9px] font-medium text-gray-300 border border-gray-700/60 pointer-events-none shadow-sm">
              ${landmark.name}
            </div>
          </div>
        `;

        const landmarkIcon = L.divIcon({
          html: landmarkHtml,
          className: 'landmark-marker-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const landmarkMarker = L.marker(toLatLng(landmark.x, landmark.y), { icon: landmarkIcon });
        landmarkMarker.bindPopup(`
          <div class="p-2.5 text-xs bg-[#161b26] text-gray-200 rounded-lg border border-gray-700/80 shadow-xl min-w-[170px]">
            <div class="font-bold text-amber-300 text-sm">${landmark.name}</div>
            <div class="text-[10px] text-gray-400 font-mono mt-0.5">X: ${landmark.x}, Y: ${landmark.y}</div>
            <div class="text-[10px] text-gray-300 font-medium mt-1 uppercase tracking-wider">
              ${landmark.type === 'portal' ? 'Portal / Teleport' : landmark.type === 'town' ? 'Rynek / Centrum Miasta' : 'Punkt Zwiadowczy Respu'}
            </div>
          </div>
        `);
        landmarksLayer.addLayer(landmarkMarker);
      });
    }
  }, [mapBosses, kills, selectedChannel, customMarkers, selectedMapId, showSpawnZones, showLandmarks, currentMap, bossConfigs, session, openBossDetailModal]);

  // Live countdown ticker: updates text on existing DOM markers and popups every second without layer churn
  useEffect(() => {
    const hasDeadBosses = mapBosses.some((b) => {
      const rec = kills[`${b.id}_ch${selectedChannel}`];
      return rec && rec.respawnAt > Date.now();
    });

    if (!hasDeadBosses) return;

    const timer = setInterval(() => {
      const now = Date.now();
      mapBosses.forEach((boss) => {
        const rec = kills[`${boss.id}_ch${selectedChannel}`];
        if (!rec) return;
        const diff = rec.respawnAt - now;
        const formatted = diff > 0 ? formatSeconds(Math.floor(diff / 1000)) : 'ŻYWY';

        const markerEl = document.querySelector(`.marker-countdown[data-boss-id="${boss.id}"]`);
        if (markerEl) {
          markerEl.textContent = formatted;
        }

        const popupEl = document.querySelector(`.popup-countdown[data-boss-id="${boss.id}"]`);
        if (popupEl) {
          popupEl.textContent = formatted;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mapBosses, kills, selectedChannel]);

  // Handle direct kill from popup
  const handleDirectBossKill = async (boss: BossDefinition, coords: Coordinates) => {
    const key = `${boss.id}_ch${selectedChannel}`;
    const previousRecord = kills[key];
    const killTime = Date.now();
    const config = bossConfigs[boss.id] || {
      respawnMinutes: boss.respawnMinutes,
      varianceMinutes: boss.varianceMinutes,
    };
    const respawnMs = config.respawnMinutes * 60 * 1000;
    const varianceMs = (config.varianceMinutes || 0) * 60 * 1000;

    const optimisticRecord: KillRecord = {
      id: `temp_${Date.now()}`,
      bossId: boss.id,
      channel: selectedChannel,
      killedAt: killTime,
      respawnAt: killTime + respawnMs,
      respawnWindowStart: killTime + respawnMs - varianceMs,
      respawnWindowEnd: killTime + respawnMs + varianceMs,
      killedBy: session?.username || 'Gracz',
      coords,
    };

    applyOptimisticKill(optimisticRecord);
    if (soundEnabled) {
      playBossKilledSound(soundVolume);
    }

    try {
      await submitBossKill({
        bossId: boss.id,
        channel: selectedChannel,
        killedAt: killTime,
        killedBy: session?.username || 'Gracz',
        coords,
      });
    } catch (err) {
      console.error(err);
      rollbackOptimisticKill(key, previousRecord);
      alert('Nie udało się zapisać zbicia bossa.');
    }
  };

  // Handle in-map quick kill from clicked point
  const handleQuickKillAtPoint = async () => {
    if (!activeClickPoint || !selectedBossToKill) return;
    const boss = mapBosses.find((b) => b.id === selectedBossToKill);
    if (!boss) return;

    await handleDirectBossKill(boss, activeClickPoint);
    setActionSuccessMsg(`Oznaczono zbicie: ${boss.name} na CH${selectedChannel}!`);
    setTimeout(() => {
      setActiveClickPoint(null);
      setActionSuccessMsg(null);
    }, 1500);
  };

  // Handle in-map custom marker creation
  const handleSaveCustomMarkerAtPoint = async () => {
    if (!activeClickPoint || !customMarkerTitle.trim()) return;

    setIsSavingMarker(true);
    try {
      await addCustomMapMarker({
        title: customMarkerTitle.trim(),
        mapId: selectedMapId,
        channel: selectedChannel,
        coords: activeClickPoint,
        createdBy: session?.username || 'Gracz',
        notes: customMarkerNotes.trim() || `Znacznik (${customMarkerTitle.trim()}) postawiony na (${activeClickPoint.x}, ${activeClickPoint.y})`,
        color: customMarkerColor || '#38bdf8',
      });
      setCustomMarkerTitle('');
      setCustomMarkerNotes('');
      setActionSuccessMsg('Pomyślnie dodano znacznik na mapie z opisem!');
      setTimeout(() => {
        setActiveClickPoint(null);
        setActionSuccessMsg(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Błąd podczas dodawania znacznika.');
    } finally {
      setIsSavingMarker(false);
    }
  };

  // Reset zoom view
  const handleResetView = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.fitBounds([
        [0, 0],
        [1000, 1000],
      ]);
    }
  };

  return (
    <div
      id="map-view-wrapper"
      className="relative w-full h-full min-h-0 flex flex-col bg-[#0b0c10] overflow-hidden rounded-xl border border-gray-800 shadow-2xl"
    >
      {/* Structural Location & Map Navigation Header (Always 100% visible, never covered by page navbar!) */}
      <MapTopBar
        currentMap={currentMap}
        selectedMapId={selectedMapId}
        onSelectMapId={setSelectedMapId}
        allMaps={allMaps}
        mapBossesCount={mapBosses.length}
        onDeleteCurrentMap={handleDeleteCurrentMap}
        canDeleteMap={Boolean(currentMap.isCustom)}
        showLandmarks={showLandmarks}
        onToggleLandmarks={() => setShowLandmarks(!showLandmarks)}
        showSpawnZones={showSpawnZones}
        onToggleSpawnZones={() => setShowSpawnZones(!showSpawnZones)}
        onResetView={handleResetView}
      />

      {/* Map Interactive Canvas with Metin2 in-game frame (Guaranteed 100% visible, never disappearing) */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-[#07090e]">
        {/* Leaflet map container */}
        <div
          id="metin2-leaflet-container"
          ref={mapContainerRef}
          className="w-full h-full cursor-crosshair"
        />

        {/* Metin2 In-Game Compass Rose & Radar HUD */}
        <MapCompassAndRadar
          selectedChannel={selectedChannel}
          radarCoordsRef={radarCoordsRef}
        />

        {/* Non-blocking in-map contextual action panel (Appears on click without hiding/blurring the map!) */}
        {activeClickPoint && (
          <MapPointActionPanel
            activeClickPoint={activeClickPoint}
            selectedChannel={selectedChannel}
            mapBosses={mapBosses}
            selectedBossToKill={selectedBossToKill}
            onSelectBossToKill={setSelectedBossToKill}
            onQuickKill={handleQuickKillAtPoint}
            customMarkerTitle={customMarkerTitle}
            onChangeCustomMarkerTitle={setCustomMarkerTitle}
            customMarkerNotes={customMarkerNotes}
            onChangeCustomMarkerNotes={setCustomMarkerNotes}
            customMarkerColor={customMarkerColor}
            onChangeCustomMarkerColor={setCustomMarkerColor}
            isSavingMarker={isSavingMarker}
            onSaveCustomMarker={handleSaveCustomMarkerAtPoint}
            actionSuccessMsg={actionSuccessMsg}
            onClose={() => setActiveClickPoint(null)}
          />
        )}

        {/* Informational banner when map has no bosses */}
        {mapBosses.length === 0 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[300] px-4 py-2 rounded-lg bg-gray-900/90 border border-gray-700 text-xs text-gray-300 flex items-center gap-2 shadow-xl">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Ta mapa nie posiada bossów domyślnych. Kliknij na mapie, by postawić własny znacznik z koordynatami.</span>
          </div>
        )}
      </div>

      {/* Dedicated Confirmation Modal for Custom Map Deletion */}
      <DeleteMapConfirmModal
        map={mapToDelete}
        isOpen={Boolean(mapToDelete)}
        onClose={() => setMapToDelete(null)}
      />
    </div>
  );
};
