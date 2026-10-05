import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppStore } from '../../store/useAppStore';
import { loginUser } from '../../services/api';
import { User, Lock, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(3, 'Nazwa musi mieć co najmniej 3 znaki').max(24, 'Maksymalnie 24 znaki'),
  password: z.string().min(4, 'Hasło musi mieć co najmniej 4 znaki'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { setSession } = useAppStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const user = await loginUser(data.username.trim(), data.password);
      setSession(user);
      setSuccessMessage(`Witaj ponownie, ${user.username}! Zalogowano pomyślnie.`);
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Niepoprawny login lub hasło');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = (username: string, pass: string) => {
    loginForm.setValue('username', username, { shouldValidate: true });
    loginForm.setValue('password', pass, { shouldValidate: true });
    setErrorMessage(null);
  };

  return (
    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-3">
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

      {/* Preset accounts chips - Compact & responsive */}
      <div className="p-2 rounded-xl bg-[#0c1017] border border-amber-500/25 text-xs">
        <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Szybkie logowanie (konta testowe):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => fillTestCredentials('admin', 'admin123!')}
            className="px-2 py-0.5 rounded bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-[11px] text-red-200 font-mono transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="font-bold">admin</span>
            <span className="text-gray-400 text-[10px]">(hasło: admin123!)</span>
          </button>
          <button
            type="button"
            onClick={() => fillTestCredentials('shinsoo_pro', 'metin2026')}
            className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-[11px] text-amber-200 font-mono transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="font-bold">shinsoo_pro</span>
          </button>
          <button
            type="button"
            onClick={() => fillTestCredentials('jinno_boss', 'metin2026')}
            className="px-2 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/40 text-[11px] text-indigo-200 font-mono transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="font-bold">jinno_boss</span>
          </button>
        </div>
      </div>

      {/* Username Field */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1">
          Nazwa gracza / Login
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            {...loginForm.register('username')}
            autoComplete="username"
            placeholder="np. admin, shinsoo_pro lub Twój nick"
            className="w-full pl-9 pr-3 py-2 bg-[#0c1017] border border-gray-700 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        {loginForm.formState.errors.username && (
          <p className="text-[11px] text-rose-400 mt-1">{loginForm.formState.errors.username.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1">Hasło</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            {...loginForm.register('password')}
            autoComplete="current-password"
            placeholder="Wprowadź hasło"
            className="w-full pl-9 pr-10 py-2 bg-[#0c1017] border border-gray-700 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer p-1"
            title={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {loginForm.formState.errors.password && (
          <p className="text-[11px] text-rose-400 mt-1">{loginForm.formState.errors.password.message}</p>
        )}
      </div>

      {/* Submit Button - Guaranteed prominent & easily clickable on mobile */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 via-red-600 to-amber-700 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="inline-block animate-pulse">Autoryzacja z bazą...</span>
          ) : (
            <span>Zaloguj się do Trackera</span>
          )}
        </button>
      </div>

      {/* Switch to Register */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
        >
          Nie posiadasz jeszcze konta? Zarejestruj się tutaj
        </button>
      </div>
    </form>
  );
};
