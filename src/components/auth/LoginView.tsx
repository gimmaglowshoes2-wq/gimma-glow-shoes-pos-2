import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Shield, Cloud, LogIn, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, error: authError } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLocalError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLocalError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const errorMessage = localError || authError;

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Banner */}
        <div className="bg-[#12372A] p-8 text-center text-white relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A34E] to-[#b38936] text-[#12372A] flex items-center justify-center mx-auto mb-4 shadow-xl ring-4 ring-[#C9A34E]/20">
            <Sparkles className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black tracking-tight font-brand">
            GIMMA GLOW SHOES
          </h1>
          <p className="text-xs text-[#C9A34E] font-semibold mt-1 tracking-wider uppercase">
            Sistem Kasir POS & Manajemen Cuci Sepatu
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-medium border border-white/15">
            <Cloud className="w-3.5 h-3.5 text-[#C9A34E]" />
            <span>Terhubung ke Firebase Cloud Realtime</span>
          </div>

          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C9A34E]/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-base font-bold text-slate-900">
              Masuk Akun Kasir / Staf
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Masuk dengan akun Google yang terdaftar untuk mengakses kasir, transaksi pelanggan, dan sinkronisasi data antarperangkat.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3 border ${
                isLoggingIn
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 hover:border-slate-400 active:scale-98'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoggingIn ? 'Memproses Login...' : 'Masuk dengan Google'}</span>
            </button>
          </div>

          {/* Security Features Note */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#12372A]" />
              <span>Keamanan terenkripsi dengan Firebase Security Rules.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Otomatis sinkron dengan kasir lain & perangkat tablet/HP.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
