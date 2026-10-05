import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { METIN2_BOSSES } from '../../data/bosses';
import { BossConfigItem } from '../../types';
import { Save } from 'lucide-react';

const configSchema = z.object({
  bossId: z.string().min(1, 'Wybierz bossa'),
  respawnMinutes: z.number().min(1, 'Minimalny czas to 1 minuta').max(1440, 'Maksymalnie 1440 minut (24h)'),
  varianceMinutes: z.number().min(0, 'Wariancja nie może być ujemna').max(60, 'Maksymalnie 60 minut'),
});

export type ConfigFormData = z.infer<typeof configSchema>;

interface AdminCooldownsTabProps {
  selectedBossToEdit: string;
  onSelectBossToEdit: (bossId: string) => void;
  bossConfigs: Record<string, BossConfigItem>;
  onSaveConfig: (data: ConfigFormData) => Promise<void>;
}

export const AdminCooldownsTab: React.FC<AdminCooldownsTabProps> = ({
  selectedBossToEdit,
  onSelectBossToEdit,
  bossConfigs,
  onSaveConfig,
}) => {
  const currentBossDef = METIN2_BOSSES.find((b) => b.id === selectedBossToEdit) || METIN2_BOSSES[0];
  const currentConfig = bossConfigs[selectedBossToEdit] || {
    bossId: currentBossDef.id,
    respawnMinutes: currentBossDef.respawnMinutes,
    varianceMinutes: currentBossDef.varianceMinutes,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    values: {
      bossId: currentBossDef.id,
      respawnMinutes: currentConfig.respawnMinutes,
      varianceMinutes: currentConfig.varianceMinutes,
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold text-gray-300 mb-1.5">Wybierz Bossa do modyfikacji:</label>
        <select
          value={selectedBossToEdit}
          onChange={(e) => {
            onSelectBossToEdit(e.target.value);
            reset();
          }}
          className="w-full p-2.5 bg-[#0e111a] border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          {METIN2_BOSSES.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} (lvl {b.level}) - bazowo: {b.respawnMinutes} min
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit(onSaveConfig)} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-300 mb-1">
              Czas odrodzenia (w minutach):
            </label>
            <input
              type="number"
              {...register('respawnMinutes', { valueAsNumber: true })}
              className="w-full p-2.5 bg-[#0e111a] border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-amber-500 font-mono"
            />
            {errors.respawnMinutes && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.respawnMinutes.message}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-300 mb-1">
              Wariancja / Okno respu (± minuty):
            </label>
            <input
              type="number"
              {...register('varianceMinutes', { valueAsNumber: true })}
              className="w-full p-2.5 bg-[#0e111a] border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-amber-500 font-mono"
            />
            {errors.varianceMinutes && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.varianceMinutes.message}</p>
            )}
          </div>
        </div>

        <div className="p-3 bg-[#0e111a] rounded-xl border border-gray-800 text-[11px] text-gray-400">
          <span className="font-bold text-gray-300">Podgląd:</span> Po zbiciu boss zrespi się po ok.{' '}
          <span className="font-mono text-amber-400">{currentConfig.respawnMinutes} min</span> z oknem respu{' '}
          <span className="font-mono text-amber-400">±{currentConfig.varianceMinutes} min</span>.
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Zapisz Zmiany Respawnu Bossa</span>
        </button>
      </form>
    </div>
  );
};
