import React from 'react';
import { BossDefinition, NotableDropItem } from '../../types';
import { Award } from 'lucide-react';

export const getRarityBadge = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10';
    case 'epic':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    case 'rare':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    default:
      return 'bg-gray-800 text-gray-300 border-gray-700';
  }
};

export const getRarityLabel = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'LEGENDARNY';
    case 'epic':
      return 'EPICKI';
    case 'rare':
      return 'RZADKI';
    default:
      return 'STANDARD';
  }
};

interface BossDetailDropsProps {
  boss: BossDefinition;
}

export const BossDetailDrops: React.FC<BossDetailDropsProps> = ({ boss }) => {
  const dropItems: NotableDropItem[] =
    boss.notableDropsList && boss.notableDropsList.length > 0
      ? boss.notableDropsList
      : (boss.drops || []).map((dropName) => {
          let rarity: NotableDropItem['rarity'] = 'common';
          let category: NotableDropItem['category'] = 'misc';
          let description = 'Cenny przedmiot zdobywany po pokonaniu bossa.';

          if (dropName.toLowerCase().includes('szkat')) {
            rarity = 'epic';
            category = 'chest';
            description = 'Szkatułka z cennymi broniami, zbrojami i ulepszaczami.';
          } else if (dropName.toLowerCase().includes('duchow') || dropName.toLowerCase().includes('kamień')) {
            rarity = 'legendary';
            category = 'stone';
            description = 'Przedmiot o kluczowym znaczeniu w rozwoju postaci i umiejętności.';
          } else if (
            dropName.toLowerCase().includes('pierścień') ||
            dropName.toLowerCase().includes('eliksir') ||
            dropName.toLowerCase().includes('marmur')
          ) {
            rarity = 'rare';
            category = 'special';
            description = 'Specjalny przedmiot wspomagający rozgrywkę.';
          } else if (
            dropName.toLowerCase().includes('ząb') ||
            dropName.toLowerCase().includes('księg') ||
            dropName.toLowerCase().includes('ogon')
          ) {
            rarity = 'rare';
            category = 'upgrade';
            description = 'Wymagany do misji u Biologa lub do ulepszania ekwipunku.';
          }

          return {
            name: dropName,
            rarity,
            category,
            description,
          };
        });

  return (
    <div className="bg-[#090c13] border border-gray-800/90 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Drop i przedmioty (Loot table)</span>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">
          {dropItems.length} pozycji
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {dropItems.map((drop, idx) => (
          <div
            key={idx}
            className="bg-[#121622] border border-gray-800/90 hover:border-amber-500/40 rounded-xl p-3 flex flex-col justify-between gap-1.5 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-xs text-gray-100 font-metin">{drop.name}</span>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${getRarityBadge(
                  drop.rarity
                )}`}
              >
                {getRarityLabel(drop.rarity)}
              </span>
            </div>
            {drop.description && (
              <p className="text-[11px] text-gray-400 leading-snug">{drop.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* General Drops tags */}
      {boss.drops && boss.drops.length > 0 && (
        <div className="pt-2 border-t border-gray-800/80">
          <span className="text-[10px] text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
            Pozostałe przedmioty zebrane z bossa:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {boss.drops.map((d, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-gray-800/80 border border-gray-700/80 text-[11px] text-gray-300 font-medium"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
