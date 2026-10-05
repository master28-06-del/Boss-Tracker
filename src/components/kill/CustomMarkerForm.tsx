import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin } from 'lucide-react';

export const markerSchema = z.object({
  title: z.string().min(2, 'Tytuł znacznika musi mieć co najmniej 2 znaki').max(50),
  channel: z.number().min(1).max(6),
  coordX: z.number().min(0).max(1000),
  coordY: z.number().min(0).max(1000),
  notes: z.string().max(100).optional(),
  color: z.string(),
});

export type MarkerFormData = z.infer<typeof markerSchema>;

interface CustomMarkerFormProps {
  defaultCoords: { x: number; y: number };
  selectedChannel: number;
  onSubmit: (data: MarkerFormData) => void;
}

export const CustomMarkerForm: React.FC<CustomMarkerFormProps> = ({
  defaultCoords,
  selectedChannel,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MarkerFormData>({
    resolver: zodResolver(markerSchema),
    values: {
      title: '',
      channel: selectedChannel,
      coordX: defaultCoords.x,
      coordY: defaultCoords.y,
      notes: '',
      color: '#38bdf8',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
      <div>
        <label className="block font-semibold text-gray-300 mb-1">Nazwa znacznika:</label>
        <input
          type="text"
          {...register('title')}
          placeholder="np. Metin Morderstwa 70 lvl, Spot Żółwia"
          className="w-full p-2 bg-[#0e111a] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500"
        />
        {errors.title && <p className="text-[11px] text-rose-400 mt-1">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-300 mb-1">Kanał (CH):</label>
          <select
            {...register('channel', { valueAsNumber: true })}
            className="w-full p-2 bg-[#0e111a] border border-gray-700 rounded-lg text-gray-200 font-mono"
          >
            {[1, 2, 3, 4, 5, 6].map((ch) => (
              <option key={ch} value={ch}>
                CH{ch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-300 mb-1">Kolor pinezki:</label>
          <select
            {...register('color')}
            className="w-full p-2 bg-[#0e111a] border border-gray-700 rounded-lg text-gray-200"
          >
            <option value="#38bdf8">Niebieski (Kropka)</option>
            <option value="#f59e0b">Złoty (Boss)</option>
            <option value="#ef4444">Czerwony (Zagrożenie)</option>
            <option value="#10b981">Zielony (Zioła/Spot)</option>
            <option value="#c084fc">Fioletowy (Metin)</option>
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

      <div>
        <label className="block font-semibold text-gray-300 mb-1">Notatka:</label>
        <input
          type="text"
          {...register('notes')}
          placeholder="np. Zrespił się 2 minuty temu przy rzece"
          className="w-full p-2 bg-[#0e111a] border border-gray-700 rounded-lg text-gray-200"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <MapPin className="w-4 h-4" />
          <span>Dodaj Znacznik na Mapę</span>
        </button>
      </div>
    </form>
  );
};
