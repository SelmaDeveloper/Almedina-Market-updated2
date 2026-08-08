import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { BRAND } from '../../constants/brand';
import { Lock, ShieldAlert, Smartphone, ArrowRight, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { adminSession, loginAdmin, verifyAdmin2FA, setViewTab } = useApp();

  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If already fully authenticated, go to dashboard immediately
  useEffect(() => {
    if (adminSession.isLoggedIn && adminSession.is2FAVerified) {
      setViewTab('admin_dashboard');
    }
  }, [adminSession.isLoggedIn, adminSession.is2FAVerified, setViewTab]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    const ok = loginAdmin(password);
    if (!ok) setLocalError('Invalid admin password. Please try again.');
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setLocalError('Please enter the 6-digit security code.');
      return;
    }
    const ok = verifyAdmin2FA(code);
    if (!ok) setLocalError('Invalid security code. Please try again.');
  };

  const step = !adminSession.isLoggedIn ? 1 : 2;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Back to storefront */}
      <button
        onClick={() => setViewTab('storefront')}
        className="absolute top-4 left-4 flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Store
      </button>

      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2.5">
            <Logo size="lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{BRAND.name}</h1>
            <p className="text-slate-400 text-sm">Admin Dashboard Access</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 justify-center text-xs">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-colors ${step >= 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
            <Lock className="w-3 h-3" />
            Step 1: Password
          </div>
          <div className="w-6 h-px bg-slate-700" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-colors ${step >= 2 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
            <Smartphone className="w-3 h-3" />
            Step 2: 2FA Code
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          {/* Single-session warning */}
          <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-xl text-amber-200 text-xs flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">Single Active Session Enforced</p>
              <p className="text-[11px] mt-0.5 leading-relaxed">Logging in here will automatically invalidate any active admin session on other devices.</p>
            </div>
          </div>

          {/* Session error (kicked from another device) */}
          {adminSession.sessionError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>{adminSession.sessionError}</p>
            </div>
          )}

          {/* Local validation error */}
          {localError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>{localError}</p>
            </div>
          )}

          {/* ── Step 1: Password ── */}
          {step === 1 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Enter Admin Password</p>
                  <p className="text-[11px] text-slate-400">Step 1 of 2</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Demo password: <span className="text-amber-400 font-mono font-bold">admin123</span></p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>Next: Verify Security Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ── Step 2: 2FA Code ── */}
          {step === 2 && (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Two-Factor Verification</p>
                  <p className="text-[11px] text-slate-400">Step 2 of 2</p>
                </div>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Password verified</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setLocalError(null); setCode(''); }}
                  className="text-amber-400 font-bold hover:underline text-[11px]"
                >
                  Change Password
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">6-Digit Security Code</label>
                <input
                  type="text"
                  placeholder="_ _ _ _ _ _"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-center tracking-[0.6em] font-mono text-2xl font-bold text-amber-400 placeholder:text-slate-600 placeholder:tracking-normal focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                />
                <p className="text-[10px] text-slate-500 text-center">Demo code: <span className="text-amber-400 font-mono font-bold">123456</span></p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Unlock Admin Dashboard
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-600">
          {BRAND.name} • Admin access is restricted to authorized store personnel only.
        </p>
      </div>
    </div>
  );
};
