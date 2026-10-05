import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BossDefinition } from '../../types';
import { Flame } from 'lucide-react';

export const killSchema = z.object({
  bossId: z.string().min(1, 'Wybierz bossa'),
  channel: z.number().min(1).max(6),
  timeOffsetMinutes: z.number().min(0).max(720),
  killerName: z.string().optional(),
  notes: z.string().max(100).optional(),
  coordX: z.number().min(0).max(1000),
  coordY: z.number().min(0).max(1000),
});

export type KillFormData = z.infer<typeof killSchema>;

interface KillFormProps {
  allBosses: BossDefinition[];
  selectedMapId: string;
  defaultBossId: string;
  defaultCoords: { x: number; y: number };
  selectedChannel: number;
  initialKillerName: string;
  onSubmit: (data: KillFormData) => void;
}

export const KillForm: React.FC<KillFormProps> = ({
  allBosses,
  selectedMapId,
  defaultBossId,
  defaultCoords,
  selectedChannel,
  initialKillerName,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KillFormData>({
    resolver: zodResolver(killSchema),
    values: {
      bossId: defaultBossId,
      channel: selectedChannel,
      timeOffsetMinutes: 0,
      killerName: initialKillerName,
      notes: '',
      coordX: defaultCoords.x,
      coordY: defaultCoords.y,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
      <div>
        <label className="block font-semibold text-gray-300 mb-1">Boss:</label>
        <select
          {...register('bossId')}
          className="w-full p-2 bg-[#0e111a] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-amber-500"
        >
          {allBosses.some((b) => b.mapId === selectedMapId) && (
            <optgroup label="Bossowie na tej mapie">
              {allBosses
                .filter((b) => b.mapId === selectedMapId)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (lvl {b.level}) - Resp {b.respawnMinutes} min {b.isCustom ? '★' : ''}
                  </option>
                ))}
            </optgroup>
          )}
          <optgroup label="Wszyscy Bossowie">
            {allBosses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} (lvl {b.level}) - Resp {b.respawnMinutes} min {b.isCustom ? '★' : ''}
              </option>
            ))}
          </optgroup>
        </select>
        {errors.bossId && <p className="text-[11px] text-rose-400 mt-1">{errors.bossId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-300 mb-1">Kanał (CH):</label>
          <select
            {...register('channel', { valueAsNumber: true })}
            className="w-full p-2 bg-[#0e111a] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-amber-500 font-mono"
          >
            {[1, 2, 3, 4, 5, 6].map((ch) => (
              <option key={ch} value={ch}>
                CH{ch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-300 mb-1">Czas zbicia:</label>
          <select
            {...register('timeOffsetMinutes', { valueAsNumber: true })}
            className="w-full p-2 bg-[#0e111a] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-amber-500"
          >
            <option value={0}>Przed chwilą (Teraz)</option>
            <option value={5}>5 minut temu</option>
            <option value={10}>10 minut temu</option>
            <option value={15}>15 minut temu</option>
            <option value={30}>30 minut temu</option>
            <option value={60}>1 godzinę temu</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-300 mb-1">Współrzędna X:</label>
          <input
            type="number"
            {...register('coordX', { valueAsNumber: true })}
            className="w-full p-2 bg-[#0e111a] border border-gray-700 rounded-lg text-gray-200 font-mono"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-300 mb-1">Współrzędna Y:</label>
          <input
            type="number"
            {...register('coordY', { valueAsNumber: true })}
            className="w-full p-2 bg-[#0e111a] border border-gray-700 rounded-lg text-gray-200 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-300 mb-1">Nick łowcy:</label>
          <input
            type="text"
            {...register('killerName')}
            placeholder="np. SuraWP"
            className="w-full p-2 bg-[#0e111a] border border-gray-700 rounded-lg text-gray-200"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-300 mb-1">Notatka (opcjonalnie):</label>
          <input
            type="text"
            {...register('notes')}
            placeholder="np. dropła stalka"
            className="w-full p-2 bg-[#0e111a] border border-gray-700 rounded-lg text-gray-200"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Flame className="w-4 h-4" />
          <span>Zatwierdź Zbicie & Rozpocznij Odliczanie</span>
        </button>
      </div>
    </form>
  );
};
