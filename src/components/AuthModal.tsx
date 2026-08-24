import React, { useState } from 'react';
import { X, Film, Lock, Mail, User as UserIcon, LogIn, UserPlus, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Complexity Checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !isPasswordValid) {
      setError('Please fulfill all password security requirements below.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login(email, password);
        localStorage.setItem('cinemeta_token', res.token);
        onSuccess(res.user, res.token);
      } else {
        const res = await api.register(name, email, password);
        localStorage.setItem('cinemeta_token', res.token);
        onSuccess(res.user, res.token);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          id="close-auth-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-red-900/40">
            <Film className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isLogin ? 'Welcome Back to CINEMETA' : 'Create Your CINEMETA Account'}
          </h2>
          <p className="text-xs text-zinc-400">
            {isLogin
              ? 'Sign in to access your personalized recommendation vector & preferences'
              : 'Join to build your personalized multi-signal recommendation profile'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Password Security Complexity Checklist for Registration */}
          {!isLogin && password.length > 0 && (
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1.5 text-[11px]">
              <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Password Security Standards:</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <Check className={`w-3 h-3 ${hasMinLength ? 'opacity-100' : 'opacity-30'}`} />
                  <span>8+ Characters</span>
                </div>
                <div className={`flex items-center gap-1 ${hasUpperCase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <Check className={`w-3 h-3 ${hasUpperCase ? 'opacity-100' : 'opacity-30'}`} />
                  <span>1 Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1 ${hasLowerCase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <Check className={`w-3 h-3 ${hasLowerCase ? 'opacity-100' : 'opacity-30'}`} />
                  <span>1 Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <Check className={`w-3 h-3 ${hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                  <span>1 Number (0-9)</span>
                </div>
                <div className={`col-span-2 flex items-center gap-1 ${hasSpecial ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <Check className={`w-3 h-3 ${hasSpecial ? 'opacity-100' : 'opacity-30'}`} />
                  <span>1 Special Character (!@#$%^&*...)</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            id="auth-submit-btn"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-900/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mt-2"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Cybersecurity Info Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span>Secured with Bcrypt (10 Salt Rounds) & JWT Authentication</span>
        </div>

        <div className="text-center text-xs text-zinc-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-red-400 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
