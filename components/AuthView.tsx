import React, { useState, useContext } from 'react';
// FIX: Import the `CheckCircle` icon to be used in the success message.
import { ArrowLeft, LogIn, UserPlus, Mail, KeyRound, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { AppContext } from '../App.tsx';
import { signIn, signUp } from '../services/supabaseService.ts';

interface AuthViewProps {
  onBack: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        // The onAuthStateChange in App.tsx will handle the navigation
      } else {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) throw signUpError;
        setSuccessMessage("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi sebelum login.");
      }
    } catch (err: any) {
      const message = err.message || "Terjadi kesalahan.";
      if (message.includes("Invalid login credentials")) {
        setError("Email atau password salah.");
      } else if (message.includes("already registered")) {
        setError("Email ini sudah terdaftar. Silakan login.");
      } else if (message.includes("Password should be at least 6 characters")) {
        setError("Password harus minimal 6 karakter.");
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 animate-fade-in pb-32">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">
          {isLogin ? 'Login Akun' : 'Buat Akun Baru'}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="w-full p-3 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimal 6 karakter"
                className="w-full p-3 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />)}
            <span>{isLoading ? 'Memproses...' : (isLogin ? 'Login' : 'Daftar')}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMessage(null); }} className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
            {isLogin ? 'Belum punya akun? Buat akun baru' : 'Sudah punya akun? Login di sini'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
