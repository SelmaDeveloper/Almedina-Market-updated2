import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, ShieldAlert, Smartphone, ArrowRight, CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from 'lucide-react';

export const Admin2FAModal: React.FC = () => {
  const { adminSession, loginAdmin, verifyAdmin2FA, logoutAdmin } = useApp();

  const [password, setPassword] = useState('admin123');
  const [code, setCode] = useState('123456');

  if (adminSession.isLoggedIn && adminSession.is2FAVerified) {
    return null; // Admin authenticated
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin(password);
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAdmin2FA(code);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-800 p-6 space-y-5 animate-fade-in text-xs">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">Almedina Market Owner Auth</h2>
            <p className="text-slate-400 text-[11px]">Store Dashboard • 2FA Verification Required</p>
          </div>
        </div>

        {/* Single Session Warning Banner */}
        <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl text-amber-200 text-[11px] leading-relaxed flex items-start gap-2">
          <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Single Active Admin Session Enforced</p>
            <p>Authenticating will automatically invalidate any previous active Admin session on other devices.</p>
          </div>
        </div>

        {adminSession.sessionError && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-[11px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{adminSession.sessionError}</p>
          </div>
        )}

        {/* STEP 1: Password Entry */}
        {!adminSession.isLoggedIn ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="Enter admin password (default: admin123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Next: 2FA Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: 2FA Security Code Entry */
          <form onSubmit={handle2FASubmit} className="space-y-4">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-[11px] text-slate-300 flex items-center justify-between">
              <span>Password verified ✓</span>
              <button
                type="button"
                onClick={logoutAdmin}
                className="text-amber-400 font-bold hover:underline"
              >
                Change
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">6-Digit 2FA Security Code</label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-center tracking-[0.5em] font-mono text-lg font-bold text-amber-400 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-400 text-center">
                Demo code: <strong className="text-amber-300">123456</strong>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Unlock Admin Dashboard</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
