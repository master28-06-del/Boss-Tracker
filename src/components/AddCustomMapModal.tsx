import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { createCustomMap } from '../services/api';
import {
  X,
  Map as MapIcon,
  Upload,
  Link as LinkIcon,
  Palette,
  Skull,
  Crosshair,
  Clock,
  Sparkles,
  Check,
  AlertCircle,
  Image as ImageIcon,
  HelpCircle,
  Layers,
  Plus,
} from 'lucide-react';
import { Coordinates, MapDefinition } from '../types';
import { CustomMapsListTab } from './map/CustomMapsListTab';
import { DeleteMapConfirmModal } from './map/DeleteMapConfirmModal';

export const AddCustomMapModal: React.FC = () => {
  const {
    isAddMapModalOpen,
    setAddMapModalOpen,
    setSelectedMapId,
    session,
    customMaps,
    customBosses,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('create');
  const [mapToDelete, setMapToDelete] = useState<MapDefinition | null>(null);

  // If user has custom maps and opens modal, show list by default or create if none
  useEffect(() => {
    if (isAddMapModalOpen) {
      if (customMaps.length > 0) {
        setActiveTab('list');
      } else {
        setActiveTab('create');
      }
    }
  }, [isAddMapModalOpen, customMaps.length]);

  const [mapName, setMapName] = useState('');
  const [category, setCategory] = useState<'custom' | 'neutral' | 'dungeon' | 'high_level'>('custom');
  const [recommendedLevel, setRecommendedLevel] = useState('75 - 95 lvl');
  const [description, setDescription] = useState('');

  // Image / Texture settings
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url' | 'theme'>('upload');
  const [uploadedImageData, setUploadedImageData] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [terrainType, setTerrainType] = useState<'grass' | 'desert' | 'snow' | 'dungeon' | 'dark' | 'forest' | 'water'>('grass');

  // Initial boss toggle & state
  const [addInitialBoss, setAddInitialBoss] = useState(true);
  const [bossName, setBossName] = useState('');
  const [bossLevel, setBossLevel] = useState(85);
  const [bossRespawnMinutes, setBossRespawnMinutes] = useState(120);
  const [bossVarianceMinutes, setBossVarianceMinutes] = useState(5);
  const [bossCoords, setBossCoords] = useState<Coordinates>({ x: 500, y: 500 });
  const [bossIconType, setBossIconType] = useState<'beast' | 'demon' | 'undead' | 'dragon' | 'spider' | 'humanoid'>('demon');
  const [bossSpawnDesc, setBossSpawnDesc] = useState('Spot Centralny');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAddMapModalOpen) return null;

  // Handle file upload with client-side image compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Wybierz prawidłowy plik graficzny (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 1200x1200 to keep high quality while keeping payload reasonable
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setUploadedImageData(dataUrl);
          setErrorMsg(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  const getActiveThemeColors = () => {
    switch (terrainType) {
      case 'desert':
        return { bg: '#2c2214', accent: '#f59e0b', gridColor: 'rgba(245, 158, 11, 0.15)' };
      case 'snow':
        return { bg: '#0f172a', accent: '#38bdf8', gridColor: 'rgba(56, 189, 248, 0.15)' };
      case 'dungeon':
      case 'dark':
        return { bg: '#1c1917', accent: '#ef4444', gridColor: 'rgba(239, 68, 68, 0.15)' };
      case 'forest':
        return { bg: '#142516', accent: '#10b981', gridColor: 'rgba(16, 185, 129, 0.15)' };
      case 'water':
        return { bg: '#082f49', accent: '#06b6d4', gridColor: 'rgba(6, 182, 212, 0.15)' };
      case 'grass':
      default:
        return { bg: '#142516', accent: '#4ade80', gridColor: 'rgba(74, 222, 128, 0.15)' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!mapName.trim()) {
      setErrorMsg('Podaj nazwę nowej mapy');
      return;
    }

    if (addInitialBoss && !bossName.trim()) {
      setErrorMsg('Podaj nazwę początkowego bossa lub odznacz opcję jego dodawania');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl: string | undefined = undefined;
      if (imageSourceMode === 'upload' && uploadedImageData) {
        finalImageUrl = uploadedImageData;
      } else if (imageSourceMode === 'url' && imageUrlInput.trim()) {
        finalImageUrl = imageUrlInput.trim();
      }

      const colors = getActiveThemeColors();

      const initialBossPayload = addInitialBoss
        ? {
            name: bossName.trim(),
            level: Number(bossLevel) || 85,
            respawnMinutes: Number(bossRespawnMinutes) || 120,
            varianceMinutes: Number(bossVarianceMinutes) || 5,
            defaultCoords: bossCoords,
            iconType: bossIconType,
            spawnLocationName: bossSpawnDesc.trim() || 'Centrum Mapy',
            description: `Władca krainy ${mapName.trim()}.`,
          }
        : undefined;

      const res = await createCustomMap({
        name: mapName.trim(),
        category,
        recommendedLevel: recommendedLevel.trim() || '1 - 99 lvl',
        description: description.trim() || `Własna mapa gry Metin2 utworzona przez ${session?.username || 'Gracza'}`,
        imageUrl: finalImageUrl,
        theme: {
          ...colors,
          terrainType,
        },
        landmarks: [
          { name: 'Punkt Zrespienia / Wejście', x: 500, y: 150, type: 'portal' },
          { name: 'Centrum Mapy', x: 500, y: 500, type: 'town' },
          { name: 'Główny Spot Respu', x: bossCoords.x, y: bossCoords.y, type: 'boss_spot' },
        ],
        createdBy: session?.username || 'Gracz',
        initialBoss: initialBossPayload,
      });

      // Select the newly created map immediately
      setSelectedMapId(res.map.id);
      setAddMapModalOpen(false);

      // Reset form
      setMapName('');
      setUploadedImageData(null);
      setImageUrlInput('');
      setBossName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Wystąpił błąd podczas tworzenia mapy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl my-auto bg-stone-900 border-2 border-amber-600/60 rounded-xl shadow-2xl shadow-black/80 overflow-hidden text-stone-200"
        style={{
          boxShadow: '0 0 35px rgba(217, 119, 6, 0.25), inset 0 0 20px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-amber-600/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wider font-cinzel text-amber-200">
                WŁASNE MAPY GRACZY
              </h2>
              <p className="text-xs text-stone-400">
                Tworzenie niestandardowych krain, wgrywanie tekstur i zarządzanie dodanymi mapami
              </p>
            </div>
          </div>
          <button
            onClick={() => setAddMapModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-2 border-b border-stone-800 bg-stone-950/70">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs tracking-wide transition cursor-pointer ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-300 bg-stone-900/60'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Własne Mapy</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-stone-800 text-amber-400 border border-stone-700">
              {customMaps.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs tracking-wide transition cursor-pointer ${
              activeTab === 'create'
                ? 'border-amber-500 text-amber-300 bg-stone-900/60'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Nowa Mapa</span>
          </button>
        </div>

        {activeTab === 'list' ? (
          <div className="p-6">
            <CustomMapsListTab
              customMaps={customMaps}
              customBosses={customBosses}
              onSelectMap={(mapId) => {
                setSelectedMapId(mapId);
                setAddMapModalOpen(false);
              }}
              onRequestDelete={(map) => setMapToDelete(map)}
              onSwitchToCreate={() => setActiveTab('create')}
            />
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-red-950/60 border border-red-500/50 flex items-center gap-3 text-red-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* Section 1: Podstawowe informacje */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400/90 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1. Informacje Podstawowe
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Nazwa Mapy <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. Dolina Śmierci, Loch Małp Trudny..."
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Kategoria Mapy
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition"
                >
                  <option value="custom">Własna / Prywatna</option>
                  <option value="neutral">Mapa Neutralna</option>
                  <option value="dungeon">Loch / Instancja / Rajd</option>
                  <option value="high_level">Wysoki Poziom (90+)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Zalecany Poziom
                </label>
                <input
                  type="text"
                  placeholder="np. 75 - 95 lvl"
                  value={recommendedLevel}
                  onChange={(e) => setRecommendedLevel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Opis Lokacji
                </label>
                <input
                  type="text"
                  placeholder="Krótki opis mapy i wskazówki..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Grafika i Tekstura Mapy */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400/90 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              2. Grafika / Tekstura Mapy
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setImageSourceMode('upload')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition ${
                  imageSourceMode === 'upload'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <Upload className="w-4 h-4 mb-1.5" />
                <span className="text-xs font-semibold">Wgraj plik</span>
                <span className="text-[10px] opacity-75">PNG / JPG / WEBP</span>
              </button>

              <button
                type="button"
                onClick={() => setImageSourceMode('url')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition ${
                  imageSourceMode === 'url'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <LinkIcon className="w-4 h-4 mb-1.5" />
                <span className="text-xs font-semibold">Adres URL</span>
                <span className="text-[10px] opacity-75">Bezpośredni link</span>
              </button>

              <button
                type="button"
                onClick={() => setImageSourceMode('theme')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition ${
                  imageSourceMode === 'theme'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <Palette className="w-4 h-4 mb-1.5" />
                <span className="text-xs font-semibold">Styl Metin2</span>
                <span className="text-[10px] opacity-75">Klimatyczny generator</span>
              </button>
            </div>

            {/* Upload Area */}
            {imageSourceMode === 'upload' && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer border-2 border-dashed border-stone-700 hover:border-amber-500/80 rounded-xl p-5 text-center bg-stone-950/60 transition group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadedImageData ? (
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={uploadedImageData}
                      alt="Podgląd wgranej mapy"
                      className="w-24 h-24 object-cover rounded-lg border border-amber-500/50 shadow-md"
                    />
                    <div className="text-left space-y-1">
                      <div className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        Obraz wgrany pomyślnie
                      </div>
                      <p className="text-xs text-stone-400">
                        Kliknij lub przeciągnij inny plik, aby podmienić
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImageData(null);
                        }}
                        className="text-xs text-red-400 hover:underline pt-1"
                      >
                        Usuń wgrany obraz
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-amber-400/80 group-hover:scale-110 transition" />
                    <p className="text-sm font-medium text-stone-300">
                      Przeciągnij i upuść grafikę mapy tutaj lub{' '}
                      <span className="text-amber-400 underline">wybierz z dysku</span>
                    </p>
                    <p className="text-xs text-stone-500">
                      Obsługiwane formaty: JPG, PNG, WEBP (zalecany format kwadratowy lub radar 1000x1000)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* URL Input */}
            {imageSourceMode === 'url' && (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://twoj-serwer.pl/mapy/moja_mapa.png"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition"
                />
                {imageUrlInput && (
                  <div className="flex items-center gap-3 p-2 bg-stone-950 rounded-lg border border-stone-800">
                    <img
                      src={imageUrlInput}
                      alt="Podgląd z adresu URL"
                      className="w-16 h-16 object-cover rounded border border-stone-700"
                      onError={() => setErrorMsg('Nie udało się załadować obrazu z podanego URL')}
                    />
                    <span className="text-xs text-stone-400">Podgląd z podanego adresu</span>
                  </div>
                )}
              </div>
            )}

            {/* Theme Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Styl terenu i kolorystyka siatki:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { type: 'grass', label: 'Trawa & Rzeki', color: '#4ade80', desc: 'Dolina Seungryong' },
                  { type: 'desert', label: 'Pustynia & Wydmy', color: '#f59e0b', desc: 'Pustynia Yongbi' },
                  { type: 'snow', label: 'Śnieżna Góra', color: '#38bdf8', desc: 'Góra Sohan' },
                  { type: 'dark', label: 'Mroczny Loch / DT', color: '#ef4444', desc: 'Świątynia Hwang' },
                  { type: 'dungeon', label: 'Ognista Lawa', color: '#f97316', desc: 'Ognista Ziemia' },
                  { type: 'forest', label: 'Mroczny Las', color: '#10b981', desc: 'Czerwony Las' },
                  { type: 'water', label: 'Grota / Podziemia', color: '#06b6d4', desc: 'Grota Wygnańców' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setTerrainType(item.type as any)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition ${
                      terrainType === item.type
                        ? 'bg-stone-800 border-amber-500 text-stone-100 shadow-sm'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <div className="font-semibold truncate">{item.label}</div>
                      <div className="text-[10px] text-stone-500 truncate">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Początkowy Boss */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400/90 flex items-center gap-2">
                <Skull className="w-3.5 h-3.5 text-amber-400" />
                3. Początkowy Boss na tej Mapie
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                <input
                  type="checkbox"
                  checked={addInitialBoss}
                  onChange={(e) => setAddInitialBoss(e.target.checked)}
                  className="rounded bg-stone-950 border-stone-700 text-amber-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Dodaj pierwszego bossa od razu</span>
              </label>
            </div>

            {addInitialBoss && (
              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Nazwa Bossa <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="np. Władca Śmierci, Generał Otchłani"
                      value={bossName}
                      onChange={(e) => setBossName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Poziom Bossa
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={150}
                      value={bossLevel}
                      onChange={(e) => setBossLevel(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Czas Respawnu (w minutach)
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-stone-500" />
                      <input
                        type="number"
                        min={1}
                        max={1440}
                        value={bossRespawnMinutes}
                        onChange={(e) => setBossRespawnMinutes(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500 transition"
                      />
                      <span className="text-xs text-stone-500 shrink-0">min ({Math.round(bossRespawnMinutes / 60 * 10) / 10}h)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Wariancja respu (± minuty)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={bossVarianceMinutes}
                      onChange={(e) => setBossVarianceMinutes(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Współrzędne Respu (X, Y)
                    </label>
                    <div className="flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-amber-400" />
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={bossCoords.x}
                        onChange={(e) => setBossCoords({ ...bossCoords, x: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs text-center focus:outline-none focus:border-amber-500 transition"
                        placeholder="X"
                      />
                      <span className="text-stone-500">,</span>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={bossCoords.y}
                        onChange={(e) => setBossCoords({ ...bossCoords, y: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs text-center focus:outline-none focus:border-amber-500 transition"
                        placeholder="Y"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Typ Ikony Bossa
                    </label>
                    <select
                      value={bossIconType}
                      onChange={(e) => setBossIconType(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500 transition"
                    >
                      <option value="demon">Demon (Czerwona Czaszka)</option>
                      <option value="beast">Bestia / Ork (Wilk/Bestia)</option>
                      <option value="dragon">Smok (Błękitny Smok)</option>
                      <option value="spider">Pająk (Loch)</option>
                      <option value="undead">Nieumarły (Mrok)</option>
                      <option value="humanoid">Wojownik / Człowiek</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setAddMapModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-medium transition"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-900/40 hover:shadow-amber-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Tworzenie mapy...</span>
              ) : (
                <>
                  <MapIcon className="w-4 h-4" />
                  <span>UTWÓRZ I OTWÓRZ MAPĘ</span>
                </>
              )}
            </button>
          </div>
        </form>
          </>
        )}

        {/* Confirmation modal for deleting custom maps */}
        <DeleteMapConfirmModal
          map={mapToDelete}
          isOpen={Boolean(mapToDelete)}
          onClose={() => setMapToDelete(null)}
        />
      </div>
    </div>
  );
};
