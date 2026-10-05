import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppStore } from '../../store/useAppStore';
import { registerUser } from '../../services/api';
import { User, Lock, Eye, EyeOff, Swords, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MetinCharacterClass } from '../../types';

const CHARACTER_CLASSES: { name: MetinCharacterClass; icon: string; color: string }[] = [
  { name: 'Wojownik Body', icon: '⚔️', color: 'border-red-500/50 text-red-300' },
  { name: 'Wojownik Mental', icon: '🛡️', color: 'border-amber-500/50 text-amber-300' },
  { name: 'Sura WP', icon: '🗡️', color: 'border-indigo-500/50 text-indigo-300' },
  { name: 'Sura BM', icon: '🔮', color: 'border-purple-500/50 text-purple-300' },
  { name: 'Ninja Dagger', icon: '🗡️', color: 'border-emerald-500/50 text-emerald-300' },
  { name: 'Ninja Archer', icon: '🏹', color: 'border-teal-500/50 text-teal-300' },
  { name: 'Szaman Smok', icon: '🐉', color: 'border-rose-500/50 text-rose-300' },
  { name: 'Szaman Healer', icon: '⚡', color: 'border-cyan-500/50 text-cyan-300' },
];

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Nazwa musi mieć co najmniej 3 znaki')
      .max(24, 'Maksymalnie 24 znaki')
      .regex(/^[a-zA-Z0-9_\-ąćęłńóśźżĄĆĘŁŃÓŚŹŻ ]+$/, 'Niedozwolone znaki'),
    password: z.string().min(4, 'Hasło musi mieć co najmniej 4 znaki'),
    confirmPassword: z.string().min(4, 'Potwierdź hasło'),
    characterClass: z.string().optional(),
    guildName: z.string().max(20, 'Nazwa gildii max 20 znaków').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { setSession } = useAppStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedClass, setSelectedClass] = useState<MetinCharacterClass>('Wojownik Body');

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      guildName: '',
    },
  });

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const user = await registerUser({
        username: data.username.trim(),
        password: data.password,
        characterClass: selectedClass,
        guildName: data.guildName?.trim() || undefined,
      });
      setSession(user);
      setSuccessMessage(`Konto gracza ${user.username} zostało utworzone w bazie!`);
      setTimeout(() => {
        onSuccess();
      }, 700);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Nie udało się utworzyć konta w bazie');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3">
      {/* Alerts */}
      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-600/60 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-600/60 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Username Field */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1">
          Nazwa gracza / Login <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            {...registerForm.register('username')}
            autoComplete="username"
            placeholder="np. SirLancelot, SzamanPro"
            className="w-full pl-9 pr-3 py-2 bg-[#0c1017] border border-gray-700 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        {registerForm.formState.errors.username && (
          <p className="text-[11px] text-rose-400 mt-1">{registerForm.formState.errors.username.message}</p>
        )}
      </div>

      {/* Class Selection */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5 text-amber-400" />
          <span>Klasa postaci (Metin2)</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {CHARACTER_CLASSES.map((cls) => {
            const isSelected = selectedClass === cls.name;
            return (
              <button
                key={cls.name}
                type="button"
                onClick={() => setSelectedClass(cls.name)}
                className={`p-1.5 rounded-lg text-left text-xs transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow font-bold'
                    : 'bg-[#0c1017] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300'
                }`}
              >
                <span className="text-sm">{cls.icon}</span>
                <span className="truncate">{cls.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guild Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>Nazwa Gildii <span className="text-gray-500 text-[10px]">(opcjonalnie)</span></span>
        </label>
        <input
          {...registerForm.register('guildName')}
          placeholder="np. ShinsooLegends, RedArmy"
          className="w-full px-3 py-2 bg-[#0c1017] border border-gray-700 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
        {registerForm.formState.errors.guildName && (
          <p className="text-[11px] text-rose-400 mt-1">{registerForm.formState.errors.guildName.message}</p>
        )}
      </div>

      {/* Password & Confirm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Hasło</label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...registerForm.register('password')}
              autoComplete="new-password"
              placeholder="Hasło"
              className="w-full pl-8 pr-7 py-2 bg-[#0c1017] border border-gray-700 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {registerForm.formState.errors.password && (
            <p className="text-[11px] text-rose-400 mt-1">{registerForm.formState.errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Potwierdź</label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...registerForm.register('confirmPassword')}
              autoComplete="new-password"
              placeholder="Powtórz hasło"
              className="w-full pl-8 pr-2 py-2 bg-[#0c1017] border border-gray-700 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          {registerForm.formState.errors.confirmPassword && (
            <p className="text-[11px] text-rose-400 mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 via-red-600 to-amber-700 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="inline-block animate-pulse">Zapisywanie w bazie...</span>
          ) : (
            <span>Utwórz konto łowcy</span>
          )}
        </button>
      </div>

      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
        >
          Posiadasz już konto? Zaloguj się tutaj
        </button>
      </div>
    </form>
  );
};
