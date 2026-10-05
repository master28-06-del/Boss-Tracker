// High quality SVG game map generator for Metin2 maps with CRS.Simple (0,0 to 1000,1000)
import { METIN2_MAPS } from '../data/maps';
import { MapDefinition } from '../types';

// In-memory cache to prevent re-building and re-encoding ~50KB SVGs repeatedly on map switch
const svgCache = new Map<string, string>();

export function getMapSvgDataUrl(mapId: string, customMapDef?: MapDefinition): string {
  const map = customMapDef || METIN2_MAPS.find((m) => m.id === mapId) || METIN2_MAPS[0];
  const cacheKey = map.isCustom
    ? `custom_${map.id}_${map.createdAt || 0}_${map.landmarks?.length || 0}_${map.theme?.terrainType || ''}`
    : `static_${map.id}`;

  const cached = svgCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const { theme } = map;

  // Generate map-specific terrain visual details
  let specificSvgElements = '';

  if (map.isCustom) {
    // Dynamic generator for custom player maps
    const terrain = map.theme?.terrainType || 'grass';
    let terrainDetails = '';

    if (terrain === 'grass') {
      terrainDetails = `
        <path d="M 0 500 Q 250 550, 480 470 T 750 520 T 1000 490" fill="none" stroke="#1e3a5f" stroke-width="32" opacity="0.85" />
        <circle cx="500" cy="500" r="120" fill="#1b381e" stroke="#4ade80" stroke-width="2" stroke-dasharray="8,4" />
        <circle cx="250" cy="300" r="60" fill="#14532d" opacity="0.5" />
        <circle cx="750" cy="700" r="70" fill="#14532d" opacity="0.5" />
      `;
    } else if (terrain === 'desert') {
      terrainDetails = `
        <path d="M 50 200 Q 300 120, 550 220 T 950 160" fill="none" stroke="#d97706" stroke-width="4" opacity="0.4" />
        <path d="M 50 600 Q 350 500, 650 620 T 950 580" fill="none" stroke="#d97706" stroke-width="4" opacity="0.4" />
        <ellipse cx="500" cy="500" rx="90" ry="70" fill="#065f46" stroke="#059669" stroke-width="3" />
        <ellipse cx="500" cy="500" rx="50" ry="35" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
      `;
    } else if (terrain === 'snow') {
      terrainDetails = `
        <polygon points="500,200 550,300 450,300" fill="#e0f2fe" opacity="0.4" />
        <polygon points="300,500 370,620 230,620" fill="#bae6fd" opacity="0.4" />
        <polygon points="700,500 770,620 630,620" fill="#bae6fd" opacity="0.4" />
        <circle cx="500" cy="500" r="100" fill="#0369a1" opacity="0.3" stroke="#38bdf8" stroke-width="2" />
      `;
    } else if (terrain === 'dark' || terrain === 'dungeon') {
      terrainDetails = `
        <path d="M 100 100 L 900 900 M 100 900 L 900 100" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="10,15" opacity="0.3" />
        <circle cx="500" cy="500" r="130" fill="#450a0a" stroke="#ef4444" stroke-width="3" />
        <circle cx="500" cy="500" r="80" fill="#18181b" stroke="#f87171" stroke-width="2" stroke-dasharray="6,6" />
      `;
    } else {
      terrainDetails = `
        <circle cx="500" cy="500" r="140" fill="#0284c7" opacity="0.25" stroke="#38bdf8" stroke-width="2" />
        <circle cx="500" cy="500" r="70" fill="#0c4a6e" opacity="0.5" stroke="#7dd3fc" stroke-width="2" />
      `;
    }

    // Render user-defined landmarks if any
    let landmarksSvg = '';
    if (map.landmarks && map.landmarks.length > 0) {
      landmarksSvg = map.landmarks
        .map((l) => {
          const color = l.type === 'portal' ? '#38bdf8' : l.type === 'boss_spot' ? '#ef4444' : l.type === 'town' ? '#10b981' : '#f59e0b';
          return `
            <circle cx="${l.x}" cy="${l.y}" r="16" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="2" />
            <circle cx="${l.x}" cy="${l.y}" r="6" fill="${color}" />
            <text x="${l.x}" y="${l.y + 28}" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle" filter="drop-shadow(0 2px 4px black)">${l.name}</text>
          `;
        })
        .join('');
    }

    specificSvgElements = `
      ${terrainDetails}
      ${landmarksSvg}
      <text x="500" y="505" font-family="'Cinzel', serif" font-size="16" fill="${theme.accent}" font-weight="bold" text-anchor="middle">${map.name.toUpperCase()}</text>
    `;
  } else if (mapId === 'dolina_seungryong') {
    // Dolina Seungryong: Central island, rivers, bridges, temple entrance
    specificSvgElements = `
      <!-- Rivers -->
      <path d="M 0 480 Q 250 510, 420 450 T 580 440 T 750 510 T 1000 480" fill="none" stroke="#1e3a5f" stroke-width="40" opacity="0.8" />
      <path d="M 500 0 Q 480 250, 450 420 T 540 600 T 500 1000" fill="none" stroke="#1e3a5f" stroke-width="36" opacity="0.8" />
      
      <!-- Central Island (Ork Island) -->
      <ellipse cx="500" cy="500" rx="140" ry="120" fill="#1b381e" stroke="#2e5d34" stroke-width="4" />
      <circle cx="500" cy="500" r="70" fill="#254d2a" stroke="#4ade80" stroke-dasharray="6,4" stroke-width="2" />
      <text x="500" y="505" font-family="'Cinzel', serif" font-size="14" fill="#86efac" font-weight="bold" text-anchor="middle">WYSPA WODZA ORKÓW</text>
      
      <!-- Bridges -->
      <rect x="400" y="470" width="30" height="20" fill="#78350f" rx="3" />
      <rect x="570" y="470" width="30" height="20" fill="#78350f" rx="3" />
      <rect x="490" y="360" width="20" height="30" fill="#78350f" rx="3" />
      <rect x="490" y="610" width="20" height="30" fill="#78350f" rx="3" />

      <!-- Temple of Hwang Entrance -->
      <rect x="450" y="330" width="100" height="40" fill="#3b0764" stroke="#c084fc" stroke-width="2" rx="4" />
      <text x="500" y="355" font-family="sans-serif" font-size="11" fill="#e9d5ff" text-anchor="middle">ŚWIĄTYNIA HWANG</text>

      <!-- Kingdom Portals -->
      <circle cx="200" cy="800" r="35" fill="#450a0a" stroke="#ef4444" stroke-width="2" />
      <text x="200" y="805" font-family="sans-serif" font-size="11" fill="#fca5a5" text-anchor="middle">Shinsoo</text>

      <circle cx="800" cy="800" r="35" fill="#422006" stroke="#eab308" stroke-width="2" />
      <text x="800" y="805" font-family="sans-serif" font-size="11" fill="#fef08a" text-anchor="middle">Chunjo</text>

      <circle cx="500" cy="150" r="35" fill="#172554" stroke="#3b82f6" stroke-width="2" />
      <text x="500" y="155" font-family="sans-serif" font-size="11" fill="#bfdbfe" text-anchor="middle">Jinno</text>
    `;
  } else if (mapId === 'pustynia_yongbi' || mapId === 'oaza') {
    // Desert dunes, central oasis, spider cave
    specificSvgElements = `
      <!-- Sand Dunes -->
      <path d="M 50 150 Q 250 80, 450 180 T 850 120" fill="none" stroke="#d97706" stroke-width="3" opacity="0.3" />
      <path d="M 80 350 Q 280 280, 480 380 T 920 320" fill="none" stroke="#d97706" stroke-width="3" opacity="0.3" />
      <path d="M 60 700 Q 300 620, 550 720 T 950 680" fill="none" stroke="#d97706" stroke-width="3" opacity="0.3" />

      <!-- Central Oasis -->
      <ellipse cx="500" cy="500" rx="90" ry="70" fill="#065f46" stroke="#059669" stroke-width="3" />
      <ellipse cx="500" cy="500" rx="60" ry="40" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
      <text x="500" y="505" font-family="'Cinzel', serif" font-size="14" fill="#a7f3d0" font-weight="bold" text-anchor="middle">OAZA PUSTYNI</text>

      <!-- Spider Dungeon Cave -->
      <polygon points="800,820 860,820 880,880 780,880" fill="#1c1917" stroke="#ea580c" stroke-width="3" />
      <text x="830" y="855" font-family="sans-serif" font-size="11" fill="#fdba74" text-anchor="middle">LOCH PAJĄKÓW</text>

      <!-- Monkey Dungeon -->
      <circle cx="180" cy="820" r="35" fill="#292524" stroke="#a8a29e" stroke-width="2" />
      <text x="180" y="825" font-family="sans-serif" font-size="10" fill="#e7e5e4" text-anchor="middle">LOCH MAŁP</text>
    `;
  } else if (mapId === 'gora_sohan') {
    // Snow ridges, ice crevasses, frozen paths
    specificSvgElements = `
      <!-- Frozen Ice Crags -->
      <path d="M 200 100 L 350 400 L 500 250 L 650 450 L 850 150" fill="none" stroke="#7dd3fc" stroke-width="4" opacity="0.4" />
      <circle cx="620" cy="380" r="60" fill="#075985" stroke="#38bdf8" stroke-dasharray="4,4" stroke-width="2" />
      <text x="620" y="385" font-family="'Cinzel', serif" font-size="12" fill="#e0f2fe" text-anchor="middle">RESP DZIEWIĘCIU OGONÓW</text>

      <polygon points="760,160 840,160 860,220 740,220" fill="#1e1b4b" stroke="#818cf8" stroke-width="2" />
      <text x="800" y="195" font-family="sans-serif" font-size="10" fill="#c7d2fe" text-anchor="middle">PORTAL DT</text>
    `;
  } else if (mapId === 'swiatynia_hwang') {
    // Dark temple, Demon Tower center
    specificSvgElements = `
      <rect x="350" y="350" width="300" height="300" fill="#1a102b" stroke="#7e22ce" stroke-width="3" rx="8" />
      <rect x="440" y="440" width="120" height="120" fill="#3b0764" stroke="#a855f7" stroke-width="3" />
      <text x="500" y="505" font-family="'Cinzel', serif" font-size="14" fill="#f3e8ff" font-weight="bold" text-anchor="middle">WIEŻA DEMONÓW (DT)</text>
      <circle cx="380" cy="640" r="45" fill="#311042" stroke="#d946ef" stroke-dasharray="3,3" />
      <text x="380" y="645" font-family="sans-serif" font-size="11" fill="#f5d0fe" text-anchor="middle">Zjawa Tygrysa</text>
    `;
  } else if (mapId === 'ognista_ziemia') {
    // Ognista Ziemia (Doyyumhwan): Volcanic caldera, molten lava rivers, Flame King Citadel
    specificSvgElements = `
      <!-- Glowing Lava Rivers -->
      <path d="M 0 350 Q 250 420, 480 320 T 780 400 T 1000 360" fill="none" stroke="#ea580c" stroke-width="36" opacity="0.85" />
      <path d="M 0 350 Q 250 420, 480 320 T 780 400 T 1000 360" fill="none" stroke="#facc15" stroke-width="12" opacity="0.9" />
      <path d="M 380 0 Q 320 280, 420 500 T 360 850 T 400 1000" fill="none" stroke="#ea580c" stroke-width="32" opacity="0.85" />
      <path d="M 380 0 Q 320 280, 420 500 T 360 850 T 400 1000" fill="none" stroke="#facc15" stroke-width="10" opacity="0.9" />
      
      <!-- Magma Lake / Citadel of the Flame King -->
      <circle cx="500" cy="500" r="130" fill="#431407" stroke="#ea580c" stroke-width="4" />
      <circle cx="500" cy="500" r="90" fill="#7c2d12" stroke="#f97316" stroke-width="3" stroke-dasharray="6,4" />
      <circle cx="500" cy="500" r="45" fill="#b45309" stroke="#facc15" stroke-width="2" />
      <text x="500" y="495" font-family="'Cinzel', serif" font-size="13" fill="#fed7aa" font-weight="bold" text-anchor="middle">TWIERDZA OGNISTEGO KRÓLA</text>
      <text x="500" y="515" font-family="'Cinzel', serif" font-size="10" fill="#fef08a" font-weight="bold" text-anchor="middle">RESP (500, 500)</text>

      <!-- Płomienny Duch Area -->
      <circle cx="380" cy="680" r="55" fill="#2d0f07" stroke="#ef4444" stroke-dasharray="4,4" stroke-width="2" />
      <text x="380" y="685" font-family="sans-serif" font-size="10" fill="#fca5a5" text-anchor="middle">Płomienny Duch</text>

      <!-- Catacombs Portal -->
      <polygon points="800,800 860,800 880,860 780,860" fill="#18181b" stroke="#f97316" stroke-width="2" />
      <text x="830" y="835" font-family="sans-serif" font-size="10" fill="#fdba74" text-anchor="middle">KATAKUMBY</text>
    `;
  } else if (mapId === 'wieza_demonow') {
    // Wieża Demonów
    specificSvgElements = `
      <rect x="250" y="250" width="500" height="500" fill="#180d24" stroke="#a855f7" stroke-width="3" rx="8" />
      <circle cx="500" cy="500" r="110" fill="#2e1065" stroke="#c084fc" stroke-width="2" stroke-dasharray="6,4" />
      <text x="500" y="505" font-family="'Cinzel', serif" font-size="14" fill="#f5d0fe" font-weight="bold" text-anchor="middle">KOWAL DT / ROZPRUWACZ</text>
      <rect x="440" y="440" width="120" height="120" fill="#3b0764" stroke="#e879f9" stroke-width="2" />
    `;
  } else if (mapId === 'loch_pajakow_v1' || mapId === 'loch_pajakow_v2') {
    // Spider webs, dungeon rooms
    specificSvgElements = `
      <!-- Cave tunnels -->
      <path d="M 150 150 Q 300 200, 450 350 T 600 600 T 850 850" fill="none" stroke="#431407" stroke-width="60" stroke-linecap="round" />
      <path d="M 450 350 Q 650 300, 750 450 T 500 750" fill="none" stroke="#431407" stroke-width="40" stroke-linecap="round" />
      
      <!-- Queen Chamber -->
      <circle cx="850" cy="850" r="75" fill="#2d0f07" stroke="#ea580c" stroke-width="3" />
      <text x="850" y="855" font-family="'Cinzel', serif" font-size="12" fill="#ffedd5" font-weight="bold" text-anchor="middle">KOMNATA KRÓLOWEJ</text>
      <text x="150" y="155" font-family="sans-serif" font-size="11" fill="#fdba74" text-anchor="middle">WEJŚCIE</text>
    `;
  } else if (mapId === 'czerwony_las') {
    // Red foliage, twisted trails, Metin clearings
    specificSvgElements = `
      <circle cx="850" cy="250" r="65" fill="#3f0f1b" stroke="#f43f5e" stroke-dasharray="4,3" stroke-width="3" />
      <text x="850" y="255" font-family="'Cinzel', serif" font-size="12" fill="#ffe4e6" font-weight="bold" text-anchor="middle">DUCH DRZEWA</text>
      
      <circle cx="650" cy="450" r="50" fill="#2d0a13" stroke="#fb7185" stroke-width="2" />
      <text x="650" y="455" font-family="sans-serif" font-size="11" fill="#fecdd3" text-anchor="middle">METINY 85/90</text>
    `;
  } else if (mapId.startsWith('grota_wygnancow')) {
    // Cyan crystals, Setaou halls
    specificSvgElements = `
      <!-- Subterranean chambers -->
      <rect x="700" y="250" width="200" height="150" fill="#082f49" stroke="#0ea5e9" stroke-width="2" rx="6" />
      <text x="800" y="325" font-family="'Cinzel', serif" font-size="12" fill="#bae6fd" font-weight="bold" text-anchor="middle">SALA GENERAŁA / WIEDŹMY</text>

      <rect x="600" y="650" width="180" height="140" fill="#082f49" stroke="#0ea5e9" stroke-width="2" rx="6" />
      <text x="690" y="725" font-family="'Cinzel', serif" font-size="11" fill="#bae6fd" text-anchor="middle">SPOT HUASHIN</text>

      <circle cx="850" cy="850" r="60" fill="#1e1b4b" stroke="#6366f1" stroke-width="3" />
      <text x="850" y="855" font-family="'Cinzel', serif" font-size="12" fill="#e0e7ff" font-weight="bold" text-anchor="middle">BERAN-SETAOU</text>
    `;
  } else if (mapId === 'm1_shinsoo') {
    // M1 Shinsoo - Yongan (Red Kingdom Capital)
    specificSvgElements = `
      <!-- Southern River and Ocean Coast -->
      <path d="M 0 750 Q 300 700, 500 740 T 1000 700" fill="none" stroke="#1e3a5f" stroke-width="48" opacity="0.85" />
      <rect x="480" y="700" width="40" height="80" fill="#78350f" stroke="#451a03" stroke-width="2" rx="3" />
      <text x="500" y="690" font-family="sans-serif" font-size="11" fill="#93c5fd" text-anchor="middle">Most Południowy</text>

      <!-- Castle Walls & Town Center (Yongan) -->
      <rect x="360" y="360" width="280" height="280" fill="#2d1215" stroke="#ef4444" stroke-width="3" rx="10" />
      <rect x="420" y="420" width="160" height="160" fill="#450a0a" stroke="#f87171" stroke-width="2" rx="6" />
      <text x="500" y="495" font-family="'Cinzel', serif" font-size="15" fill="#fecaca" font-weight="bold" text-anchor="middle">RYNEK YONGAN</text>
      <text x="500" y="515" font-family="sans-serif" font-size="10" fill="#fca5a5" text-anchor="middle">Stolica Shinsoo (Koło)</text>

      <!-- Portals -->
      <circle cx="180" cy="840" r="30" fill="#7f1d1d" stroke="#ef4444" stroke-width="2" />
      <text x="180" y="845" font-family="sans-serif" font-size="10" fill="#fecaca" text-anchor="middle">PORTAL M2</text>

      <!-- Animal Boss Habitats -->
      <circle cx="420" cy="360" r="40" fill="#3b1d11" stroke="#ea580c" stroke-dasharray="4,4" />
      <text x="420" y="365" font-family="sans-serif" font-size="10" fill="#fed7aa" text-anchor="middle">Bera</text>

      <circle cx="640" cy="580" r="40" fill="#1c2833" stroke="#60a5fa" stroke-dasharray="4,4" />
      <text x="640" y="585" font-family="sans-serif" font-size="10" fill="#bfdbfe" text-anchor="middle">Lykos</text>

      <circle cx="280" cy="680" r="40" fill="#27272a" stroke="#a1a1aa" stroke-dasharray="4,4" />
      <text x="280" y="685" font-family="sans-serif" font-size="10" fill="#e4e4e7" text-anchor="middle">Scrofa</text>

      <circle cx="750" cy="320" r="40" fill="#422006" stroke="#f59e0b" stroke-dasharray="4,4" />
      <text x="750" y="325" font-family="sans-serif" font-size="10" fill="#fef08a" text-anchor="middle">Tigris</text>
    `;
  } else if (mapId === 'm1_chunjo') {
    // M1 Chunjo - Joan (Yellow Kingdom Capital)
    specificSvgElements = `
      <!-- Golden Mountains & River -->
      <path d="M 0 350 Q 400 320, 650 450 T 1000 400" fill="none" stroke="#1e3a5f" stroke-width="40" opacity="0.8" />
      
      <!-- Palace Courtyard & City Plaza (Joan) -->
      <rect x="360" y="360" width="280" height="280" fill="#292209" stroke="#eab308" stroke-width="3" rx="10" />
      <rect x="420" y="420" width="160" height="160" fill="#422006" stroke="#facc15" stroke-width="2" rx="6" />
      <text x="500" y="495" font-family="'Cinzel', serif" font-size="15" fill="#fef08a" font-weight="bold" text-anchor="middle">RYNEK JOAN</text>
      <text x="500" y="515" font-family="sans-serif" font-size="10" fill="#fef9c3" text-anchor="middle">Stolica Chunjo</text>

      <!-- Portal to M2 Bokjung -->
      <circle cx="820" cy="820" r="30" fill="#713f12" stroke="#eab308" stroke-width="2" />
      <text x="820" y="825" font-family="sans-serif" font-size="10" fill="#fef08a" text-anchor="middle">PORTAL M2</text>

      <!-- Animal Boss Habitats -->
      <circle cx="580" cy="350" r="40" fill="#3b1d11" stroke="#ea580c" stroke-dasharray="4,4" />
      <text x="580" y="355" font-family="sans-serif" font-size="10" fill="#fed7aa" text-anchor="middle">Bera</text>

      <circle cx="340" cy="620" r="40" fill="#1c2833" stroke="#60a5fa" stroke-dasharray="4,4" />
      <text x="340" y="625" font-family="sans-serif" font-size="10" fill="#bfdbfe" text-anchor="middle">Lykos</text>

      <circle cx="720" cy="650" r="40" fill="#27272a" stroke="#a1a1aa" stroke-dasharray="4,4" />
      <text x="720" y="655" font-family="sans-serif" font-size="10" fill="#e4e4e7" text-anchor="middle">Scrofa</text>

      <circle cx="250" cy="300" r="40" fill="#422006" stroke="#f59e0b" stroke-dasharray="4,4" />
      <text x="250" y="305" font-family="sans-serif" font-size="10" fill="#fef08a" text-anchor="middle">Tigris</text>
    `;
  } else if (mapId === 'm1_jinno') {
    // M1 Jinno - Pyungmoo (Blue Kingdom Capital)
    specificSvgElements = `
      <!-- Northern River and Bridges -->
      <path d="M 0 320 Q 300 280, 500 320 T 1000 290" fill="none" stroke="#1e3a5f" stroke-width="44" opacity="0.85" />
      <rect x="480" y="280" width="40" height="80" fill="#78350f" stroke="#1e293b" stroke-width="2" rx="3" />
      <text x="500" y="270" font-family="sans-serif" font-size="11" fill="#93c5fd" text-anchor="middle">Most Północny</text>

      <!-- Military Citadel (Pyungmoo) -->
      <rect x="360" y="360" width="280" height="280" fill="#0f172a" stroke="#3b82f6" stroke-width="3" rx="10" />
      <rect x="420" y="420" width="160" height="160" fill="#1e3a8a" stroke="#60a5fa" stroke-width="2" rx="6" />
      <text x="500" y="495" font-family="'Cinzel', serif" font-size="15" fill="#dbeafe" font-weight="bold" text-anchor="middle">RYNEK PYUNGMOO</text>
      <text x="500" y="515" font-family="sans-serif" font-size="10" fill="#bfdbfe" text-anchor="middle">Twierdza Jinno (Koło)</text>

      <!-- Portal to M2 Bakra -->
      <circle cx="850" cy="180" r="30" fill="#1e3a8a" stroke="#60a5fa" stroke-width="2" />
      <text x="850" y="185" font-family="sans-serif" font-size="10" fill="#dbeafe" text-anchor="middle">PORTAL M2</text>

      <!-- Animal Boss Habitats -->
      <circle cx="480" cy="260" r="40" fill="#3b1d11" stroke="#ea580c" stroke-dasharray="4,4" />
      <text x="480" y="265" font-family="sans-serif" font-size="10" fill="#fed7aa" text-anchor="middle">Bera</text>

      <circle cx="680" cy="480" r="40" fill="#1c2833" stroke="#60a5fa" stroke-dasharray="4,4" />
      <text x="680" y="485" font-family="sans-serif" font-size="10" fill="#bfdbfe" text-anchor="middle">Lykos</text>

      <circle cx="320" cy="720" r="40" fill="#27272a" stroke="#a1a1aa" stroke-dasharray="4,4" />
      <text x="320" y="725" font-family="sans-serif" font-size="10" fill="#e4e4e7" text-anchor="middle">Scrofa</text>

      <circle cx="780" cy="320" r="40" fill="#422006" stroke="#f59e0b" stroke-dasharray="4,4" />
      <text x="780" y="325" font-family="sans-serif" font-size="10" fill="#fef08a" text-anchor="middle">Tigris</text>
    `;
  } else if (mapId === 'm2_shinsoo' || mapId === 'm2_jayang') {
    // M2 Shinsoo - Jayang (Canyons, Monkey Dungeon, Barbarians)
    specificSvgElements = `
      <!-- Barbarian Outposts & Paths -->
      <path d="M 160 160 Q 300 400, 600 550 T 840 840" fill="none" stroke="#78350f" stroke-width="18" stroke-dasharray="12,6" opacity="0.6" />

      <!-- Bestial Captain Encampment -->
      <circle cx="620" cy="580" r="65" fill="#431407" stroke="#ea580c" stroke-width="3" />
      <circle cx="620" cy="580" r="35" fill="#7c2d12" stroke="#f97316" stroke-dasharray="4,4" />
      <text x="620" y="575" font-family="'Cinzel', serif" font-size="13" fill="#ffedd5" font-weight="bold" text-anchor="middle">BEST. KAPITAN</text>
      <text x="620" y="595" font-family="sans-serif" font-size="10" fill="#fdba74" text-anchor="middle">Twierdza Dzikusów</text>

      <!-- Best. Specjalista -->
      <circle cx="420" cy="310" r="45" fill="#361309" stroke="#f59e0b" stroke-dasharray="3,3" />
      <text x="420" y="315" font-family="sans-serif" font-size="10" fill="#fef08a" text-anchor="middle">Best. Specjalista (FMS)</text>

      <!-- Mahon Encampment -->
      <circle cx="760" cy="690" r="40" fill="#2d0a13" stroke="#f43f5e" stroke-dasharray="3,3" />
      <text x="760" y="695" font-family="sans-serif" font-size="10" fill="#ffe4e6" text-anchor="middle">Mahon (RIB)</text>

      <!-- Monkey Dungeon (Hasun Dong) -->
      <polygon points="810,810 870,810 890,870 790,870" fill="#1c1917" stroke="#d97706" stroke-width="2" />
      <text x="840" y="845" font-family="sans-serif" font-size="10" fill="#fde68a" text-anchor="middle">LOCH MAŁP</text>

      <!-- Teleport to M1 -->
      <circle cx="160" cy="160" r="28" fill="#7f1d1d" stroke="#ef4444" stroke-width="2" />
      <text x="160" y="165" font-family="sans-serif" font-size="9" fill="#fecaca" text-anchor="middle">DO M1</text>
    `;
  } else if (mapId === 'm2_chunjo' || mapId === 'm2_bokjung') {
    // M2 Chunjo - Bokjung (Savanna, Bo & Chuong, Monkey Dungeon)
    specificSvgElements = `
      <!-- Paths -->
      <path d="M 150 850 Q 400 600, 550 450 T 820 830" fill="none" stroke="#713f12" stroke-width="18" stroke-dasharray="12,6" opacity="0.6" />

      <!-- Bestial Captain Plaza -->
      <circle cx="540" cy="420" r="65" fill="#3f2e07" stroke="#eab308" stroke-width="3" />
      <circle cx="540" cy="420" r="35" fill="#713f12" stroke="#facc15" stroke-dasharray="4,4" />
      <text x="540" y="415" font-family="'Cinzel', serif" font-size="13" fill="#fef9c3" font-weight="bold" text-anchor="middle">BEST. KAPITAN</text>
      <text x="540" y="435" font-family="sans-serif" font-size="10" fill="#fef08a" text-anchor="middle">Plac Dzikusów</text>

      <!-- Best. Specjalista -->
      <circle cx="380" cy="260" r="45" fill="#3f2e07" stroke="#ca8a04" stroke-dasharray="3,3" />
      <text x="380" y="265" font-family="sans-serif" font-size="10" fill="#fef08a" text-anchor="middle">Best. Specjalista (FMS)</text>

      <!-- Bo & Chuong -->
      <circle cx="690" cy="610" r="45" fill="#2d1d07" stroke="#ea580c" stroke-dasharray="3,3" />
      <text x="690" y="615" font-family="sans-serif" font-size="10" fill="#fdba74" text-anchor="middle">Bo & Chuong</text>

      <!-- Monkey Dungeon (Hasun Dong) -->
      <polygon points="790,800 850,800 870,860 770,860" fill="#1c1917" stroke="#eab308" stroke-width="2" />
      <text x="820" y="835" font-family="sans-serif" font-size="10" fill="#fef08a" text-anchor="middle">LOCH MAŁP</text>

      <!-- Teleport to M1 -->
      <circle cx="150" cy="850" r="28" fill="#422006" stroke="#facc15" stroke-width="2" />
      <text x="150" y="855" font-family="sans-serif" font-size="9" fill="#fef08a" text-anchor="middle">DO M1</text>
    `;
  } else if (mapId === 'm2_jinno' || mapId === 'm2_bakra') {
    // M2 Jinno - Bakra (Plains, Stronghold, Monkey Dungeon)
    specificSvgElements = `
      <!-- Paths -->
      <path d="M 850 160 Q 600 350, 520 480 T 850 850" fill="none" stroke="#14532d" stroke-width="18" stroke-dasharray="12,6" opacity="0.6" />

      <!-- Bestial Captain Stronghold -->
      <circle cx="580" cy="420" r="65" fill="#14532d" stroke="#22c55e" stroke-width="3" />
      <circle cx="580" cy="420" r="35" fill="#166534" stroke="#4ade80" stroke-dasharray="4,4" />
      <text x="580" y="415" font-family="'Cinzel', serif" font-size="13" fill="#dcfce7" font-weight="bold" text-anchor="middle">BEST. KAPITAN</text>
      <text x="580" y="435" font-family="sans-serif" font-size="10" fill="#86efac" text-anchor="middle">Bakra Twierdza</text>

      <!-- Best. Specjalista -->
      <circle cx="390" cy="280" r="45" fill="#143c24" stroke="#84cc16" stroke-dasharray="3,3" />
      <text x="390" y="285" font-family="sans-serif" font-size="10" fill="#bef264" text-anchor="middle">Best. Specjalista (FMS)</text>

      <!-- Mahon & Bo -->
      <circle cx="720" cy="640" r="45" fill="#1e293b" stroke="#38bdf8" stroke-dasharray="3,3" />
      <text x="720" y="645" font-family="sans-serif" font-size="10" fill="#bae6fd" text-anchor="middle">Mahon / Bo</text>

      <!-- Monkey Dungeon (Hasun Dong) -->
      <polygon points="820,820 880,820 900,880 800,880" fill="#1c1917" stroke="#22c55e" stroke-width="2" />
      <text x="850" y="855" font-family="sans-serif" font-size="10" fill="#86efac" text-anchor="middle">LOCH MAŁP</text>

      <!-- Teleport to M1 -->
      <circle cx="850" cy="160" r="28" fill="#172554" stroke="#3b82f6" stroke-width="2" />
      <text x="850" y="165" font-family="sans-serif" font-size="9" fill="#bfdbfe" text-anchor="middle">DO M1</text>
    `;
  } else {
    // Generic fallback map
    specificSvgElements = `
      <rect x="420" y="420" width="160" height="160" fill="#1e293b" stroke="#94a3b8" stroke-width="2" rx="8" />
      <text x="500" y="505" font-family="'Cinzel', serif" font-size="14" fill="#f1f5f9" font-weight="bold" text-anchor="middle">${map.name.toUpperCase()}</text>
    `;
  }

  // Generate tactical coordinate grid lines (every 100 units from 0 to 1000)
  let gridLines = '';
  for (let i = 100; i < 1000; i += 100) {
    gridLines += `
      <line x1="${i}" y1="0" x2="${i}" y2="1000" stroke="${theme.gridColor}" stroke-width="1" stroke-dasharray="2,6" />
      <line x1="0" y1="${i}" x2="1000" y2="${i}" stroke="${theme.gridColor}" stroke-width="1" stroke-dasharray="2,6" />
      <text x="${i}" y="20" font-family="'JetBrains Mono', monospace" font-size="10" fill="${theme.accent}" opacity="0.5" text-anchor="middle">${i}</text>
      <text x="20" y="${i}" font-family="'JetBrains Mono', monospace" font-size="10" fill="${theme.accent}" opacity="0.5" text-anchor="middle">${i}</text>
    `;
  }

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
      <defs>
        <!-- Vintage parchment / terrain texture pattern -->
        <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="${theme.gridColor}" stroke-width="0.5" opacity="0.3" />
        </pattern>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.6" />
        </radialGradient>
      </defs>

      <!-- Background terrain color -->
      <rect width="1000" height="1000" fill="${theme.bg}" />
      <rect width="1000" height="1000" fill="url(#gridPattern)" />
      <rect width="1000" height="1000" fill="url(#centerGlow)" />

      <!-- Map Border Frame -->
      <rect x="5" y="5" width="990" height="990" fill="none" stroke="${theme.accent}" stroke-width="3" opacity="0.6" />
      <rect x="15" y="15" width="970" height="970" fill="none" stroke="${theme.accent}" stroke-width="1" stroke-dasharray="6,4" opacity="0.4" />

      <!-- Map Specific Terrain & Landmarks -->
      ${specificSvgElements}

      <!-- Coordinate Grid and numbers -->
      ${gridLines}

      <!-- Map Title Watermark -->
      <text x="50" y="70" font-family="'Cinzel', serif" font-size="24" fill="${theme.accent}" font-weight="900" opacity="0.85">${map.name.toUpperCase()}</text>
      <text x="50" y="95" font-family="sans-serif" font-size="12" fill="#9ca3af" opacity="0.8">Zalecany poziom: ${map.recommendedLevel} | Współrzędne: 0,0 - 1000,1000</text>

      <!-- Compass Rose in bottom right corner -->
      <g transform="translate(930, 930) scale(0.6)">
        <circle cx="0" cy="0" r="60" fill="#111827" stroke="${theme.accent}" stroke-width="2" opacity="0.8" />
        <polygon points="0,-50 12,0 -12,0" fill="#ef4444" />
        <polygon points="0,50 12,0 -12,0" fill="#9ca3af" />
        <polygon points="50,0 0,12 0,-12" fill="#9ca3af" />
        <polygon points="-50,0 0,12 0,-12" fill="#9ca3af" />
        <text x="0" y="-35" font-family="'Cinzel', serif" font-size="16" fill="#f87171" font-weight="bold" text-anchor="middle">N</text>
        <text x="0" y="45" font-family="'Cinzel', serif" font-size="14" fill="#d1d5db" text-anchor="middle">S</text>
        <text x="40" y="5" font-family="'Cinzel', serif" font-size="14" fill="#d1d5db" text-anchor="middle">E</text>
        <text x="-40" y="5" font-family="'Cinzel', serif" font-size="14" fill="#d1d5db" text-anchor="middle">W</text>
      </g>
    </svg>
  `;

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString.trim())}`;
  svgCache.set(cacheKey, dataUrl);
  return dataUrl;
}
