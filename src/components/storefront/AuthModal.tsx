import React, { useState, useMemo } from 'react';
import { useApp, AuthResult } from '../../context/AppContext';
import {
  X,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Sparkles,
  Check,
  LogIn,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { BRAND } from '../../constants/brand';

// ─── Password rules ───────────────────────────────────────────────────────────
const PASSWORD_RULES = [
  { id: 'length',  label: 'Minimum 8 characters',       test: (p: string) => p.length >= 8 },
  { id: 'upper',   label: 'At least one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'At least one number',         test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'At least one special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

interface RuleRowProps {
  label: string;
  met: boolean;
  touched: boolean; // only colour red after user has typed something
}

const RuleRow: React.FC<RuleRowProps> = ({ label, met, touched }) => {
  const idle    = !touched;
  const green   = touched && met;
  const red     = touched && !met;

  return (
    <div className={`flex items-center gap-2 text-xs transition-colors ${
      idle  ? 'text-slate-400' :
      green ? 'text-emerald-600' :
               'text-rose-600'
    }`}>
      {green ? (
        <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
      ) : (
        <span className={`w-3.5 h-3.5 shrink-0 flex items-center justify-center font-bold text-[11px] ${
          red ? 'text-rose-500' : 'text-slate-400'
        }`}>✕</span>
      )}
      <span className="leading-none">{label}</span>
    </div>
  );
};

// ─── Google Icon ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ─── "Verify your Email" screen (picture 2 style) ────────────────────────────
interface VerifyScreenProps {
  email: string;
  onGoToLogin: () => void;
  onResend: () => void;
  onClose: () => void;
}

const VerifyScreen: React.FC<VerifyScreenProps> = ({ email, onGoToLogin, onResend, onClose }) => {
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    await onResend();
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header — matches picture 2 layout */}
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">{BRAND.name}</p>
        <h2 className="text-2xl font-bold text-slate-900">Verify your Email</h2>
      </div>

      {/* Body text */}
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
        <p>
          Click the button in the email we sent to <strong className="text-slate-900">{email}</strong> to verify your
          email address. If you didn't ask to verify this email address, you can ignore this email.
        </p>
        <p>
          Once verified, come back here and log in with your email and password.
        </p>
      </div>

      {/* Email icon callout */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Mail className="w-4.5 h-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
        </div>
        <div className="text-xs text-slate-600">
          <p className="font-semibold text-slate-800">Check your inbox & spam folder</p>
          <p>From: <span className="font-mono text-slate-700">noreply@{BRAND.email.split('@')[1]}</span></p>
        </div>
      </div>

      {/* Primary CTA — black rounded button like picture 2 */}
      <button
        onClick={onGoToLogin}
        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 min-h-[48px] shadow-sm"
      >
        Log In after verifying  →
      </button>

      {/* Resend */}
      <button
        onClick={handleResend}
        disabled={resent}
        className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-60"
      >
        <RefreshCw className={`w-4 h-4 ${resent ? 'animate-spin' : ''}`} />
        {resent ? 'Email resent!' : 'Resend verification email'}
      </button>

      <button onClick={onClose} className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors pt-1">
        Close
      </button>
    </div>
  );
};

// ─── Main AuthModal ───────────────────────────────────────────────────────────
export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authRedirectMessage,
    setAuthRedirectMessage,
    pendingVerificationEmail,
    registerUser,
    loginUser,
    loginWithGoogle,
    resendVerificationEmail,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [screen, setScreen] = useState<'form' | 'verify'>(() =>
    pendingVerificationEmail ? 'verify' : 'form'
  );
  const [verifyEmail, setVerifyEmail] = useState(pendingVerificationEmail || '');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Live rule evaluation
  const ruleResults = useMemo(() =>
    PASSWORD_RULES.map((r) => ({ ...r, met: r.test(password) })),
    [password]
  );
  const allRulesMet = ruleResults.every((r) => r.met);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setAuthRedirectMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Front-end guards
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (mode === 'register') {
      if (!name || name.trim().length < 2) {
        setErrorMessage('Please enter your full name (at least 2 characters).');
        return;
      }
      setPasswordTouched(true);
      if (!allRulesMet) {
        setErrorMessage('Please meet all password requirements before continuing.');
        return;
      }
    } else {
      // login: only require non-empty password
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }
    }

    setLoading(true);
    let result: AuthResult;
    if (mode === 'register') {
      result = await registerUser(name.trim(), email.trim(), password);
    } else {
      result = await loginUser(email.trim(), password);
    }
    setLoading(false);

    if (result.status === 'verify_email') {
      setVerifyEmail(result.email);
      setScreen('verify');
    } else if (result.status === 'error' && result.message) {
      setErrorMessage(result.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.status === 'error' && result.message) setErrorMessage(result.message);
  };

  const switchMode = () => {
    setMode((m) => (m === 'register' ? 'login' : 'register'));
    setErrorMessage(null);
    setPassword('');
    setPasswordTouched(false);
  };

  // ── Verify screen ──────────────────────────────────────────────────────────
  if (screen === 'verify') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 relative my-4">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 z-10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <VerifyScreen
            email={verifyEmail}
            onClose={handleClose}
            onGoToLogin={() => {
              setScreen('form');
              setMode('login');
              setEmail(verifyEmail);
              setPassword('');
              setPasswordTouched(false);
              setErrorMessage(null);
            }}
            onResend={resendVerificationEmail}
          />
        </div>
      </div>
    );
  }

  // ── Login / Register form ──────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative my-4">
        <div className="h-1 bg-emerald-600" />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 z-10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pt-5">
          {/* Redirect banner */}
          {authRedirectMessage && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-semibold">{authRedirectMessage}</p>
            </div>
          )}

          {/* Error banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">{errorMessage}</p>
            </div>
          )}

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'register' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {mode === 'register' ? `Join ${BRAND.name} to start shopping` : `Sign in to ${BRAND.name}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
            />

            {/* Password field */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!passwordTouched && e.target.value.length > 0) setPasswordTouched(true);
                  }}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className={`w-full border rounded-xl px-4 py-3 pr-11 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                    mode === 'register' && passwordTouched
                      ? allRulesMet
                        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/40'
                        : 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/30'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Live password rules — only shown on register */}
              {mode === 'register' && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 space-y-1.5">
                  {ruleResults.map((rule) => (
                    <RuleRow
                      key={rule.id}
                      label={rule.label}
                      met={rule.met}
                      touched={passwordTouched}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (mode === 'register' && passwordTouched && !allRulesMet)}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white disabled:text-slate-500 font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{mode === 'register' ? 'Sign Up' : 'Log In'}</span>
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-4">
            {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="text-emerald-700 font-semibold hover:underline"
            >
              {mode === 'register' ? 'Log In' : 'Sign Up'}
            </button>
          </p>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 transition-all min-h-[44px]"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> : <GoogleIcon />}
            <span>{mode === 'register' ? 'Sign up with Google' : 'Sign in with Google'}</span>
          </button>

          {mode === 'register' && (
            <p className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
              By signing up you accept our{' '}
              <a href="#" className="text-emerald-700 hover:underline">Terms of Use</a>{' '}
              and{' '}
              <a href="#" className="text-emerald-700 hover:underline">Privacy Policy</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
