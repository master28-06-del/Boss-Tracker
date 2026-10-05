import React from 'react';
import { BossDefinition, MapDefinition } from '../../types';
import { Sparkles, Clock, Zap, Crosshair, Shield, MapPin, ExternalLink } from 'lucide-react';

interface BossDetailSpecsAndLoreProps {
  boss: BossDefinition;
  mapDef?: MapDefinition;
  config: { respawnMinutes: number; varianceMinutes: number };
  onShowOnMap: () => void;
}

export const getTacticalTips = (boss: BossDefinition) => {
  const tips: { title: string; desc: string }[] = [];
  if (boss.iconType === 'demon') {
    tips.push({ title: 'Silny przeciwko Diabłom', desc: 'Bonus 20% w broni, tarczy, hełmie i bransolecie drastycznie zwiększa zadawany DPS.' });
  } else if (boss.iconType === 'undead') {
    tips.push({ title: 'Silny przeciwko Nieumarłym', desc: 'Niezbędny bonus w Wieży Demonów i w walce z Umarłym Rozpruwaczem.' });
  } else if (boss.iconType === 'beast') {
    tips.push({ title: 'Silny przeciwko Zwierzętom', desc: 'Podstawowy bonus ułatwiający zbijanie bossów i metinów na niższych poziomach.' });
  } else if (boss.iconType === 'spider') {
    tips.push({ title: 'Odporność na Trucizny', desc: 'Przydatna ochrona w walce z Królową Pająków w Lochu Pająków v1/v2.' });
  } else {
    tips.push({ title: 'Silny przeciwko Potworom', desc: 'Uniwersalny bonus (Kamień Potwora +4, zbroja z bonusem) działa na każdego bossa.' });
  }

  if (boss.level >= 60) {
    tips.push({ title: 'Marmur Polimorfii (Poli)', desc: 'Zalecane bicie z marmuru z łukiem lub bronią dwuręczną o wysokich średnich (ŚR 35%+).' });
    tips.push({ title: 'Trucie i Krwawienie', desc: 'Zatruj bossa dopiero gdy ma poniżej 25% PŻ, aby zablokować regenerację i szybko dobić.' });
  } else {
    tips.push({ title: 'Koń Bojowy / Militarny', desc: 'Bicie ze szponów konia bojowego ze spacją i buffami błogosławieństwa od szamana.' });
    tips.push({ title: 'Omdlenie (Stun)', desc: 'Bonus na omdlenie 8% w butach/naszyjniku przerywa potężne ciosy bossa.' });
  }

  return tips;
};

export const BossDetailSpecsAndLore: React.FC<BossDetailSpecsAndLoreProps> = ({
  boss,
  mapDef,
  config,
  onShowOnMap,
}) => {
  const tactics = getTacticalTips(boss);

  return (
    <>
      {/* Lore & Story Description */}
      <div className="bg-[#090c13] border border-gray-800/90 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Opis fabularny i historia</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed italic">
          "{boss.description || 'Jeden z legendarnych bossów świata Metin2. Wymaga zgranej drużyny lub silnego ekwipunku.'}"
        </p>
      </div>

      {/* Quick Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#0b0f17] border border-gray-800/90 rounded-xl p-3">
          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono uppercase">
            <Clock className="w-3 h-3 text-amber-400" />
            Czas odrodzenia
          </span>
          <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
            {config.respawnMinutes} min ({Math.floor(config.respawnMinutes / 60)}h {config.respawnMinutes % 60}m)
          </div>
        </div>

        <div className="bg-[#0b0f17] border border-gray-800/90 rounded-xl p-3">
          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono uppercase">
            <Zap className="w-3 h-3 text-amber-400" />
            Wariancja (±)
          </span>
          <div className="text-sm font-bold text-gray-200 font-mono mt-0.5">
            ±{config.varianceMinutes || 5} min
          </div>
        </div>

        <div className="bg-[#0b0f17] border border-gray-800/90 rounded-xl p-3">
          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono uppercase">
            <Crosshair className="w-3 h-3 text-amber-400" />
            Współrzędne
          </span>
          <div className="text-sm font-bold text-gray-200 font-mono mt-0.5">
            {boss.defaultCoords?.x || 500}, {boss.defaultCoords?.y || 500}
          </div>
        </div>

        <div className="bg-[#0b0f17] border border-gray-800/90 rounded-xl p-3">
          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono uppercase">
            <Shield className="w-3 h-3 text-amber-400" />
            Poziom bossa
          </span>
          <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
            LVL {boss.level}
          </div>
        </div>
      </div>

      {/* Spawn Location Details */}
      <div className="bg-[#090c13] border border-gray-800/90 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
            <MapPin className="w-3.5 h-3.5" />
            <span>Punkt respu na mapie</span>
          </div>
          <button
            onClick={onShowOnMap}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Nawiguj do mapy</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        <div className="text-xs text-gray-300 bg-[#121622] rounded-lg p-3 border border-gray-800">
          <span className="text-gray-400 block text-[11px] mb-0.5 font-mono uppercase">Wskazówka terenowa:</span>
          <p className="text-gray-200 font-medium leading-relaxed">
            {boss.spawnLocationName || `Występuje w wyznaczonym rejonie na mapie ${mapDef?.name || boss.mapId}.`}
          </p>
        </div>
      </div>

      {/* Tactical Advice & Vulnerabilities */}
      <div className="bg-[#090c13] border border-gray-800/90 rounded-xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Taktyka walki i zalecane bonusy</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {tactics.map((tip, i) => (
            <div key={i} className="bg-[#121622] rounded-lg p-2.5 border border-gray-800">
              <span className="font-bold text-amber-300 block mb-0.5">{tip.title}</span>
              <p className="text-[11px] text-gray-400 leading-normal">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
