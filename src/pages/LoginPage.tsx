import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  Building2,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CivicFlowchart } from '../components/CivicFlowchart';

export const LoginPage: React.FC = () => {
  const { login, continueAsGuest, authMode } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef<number | null>(null);

  const markTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotMessage(null);
    setIsSubmitting(true);

    const res = await login(identifier, password, rememberMe);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Unable to sign in. Please verify your credentials.');
      return;
    }

    navigate('/dashboard');
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    navigate('/services');
  };

  const handleForgotPassword = () => {
    setError(null);
    if (!identifier.trim()) {
      setForgotMessage(
        'Demo Auth Notice: Enter your email or phone above, or use one of the pre-configured demo accounts below (Citizen: Citizen@123 | Admin: Admin@123).'
      );
    } else {
      setForgotMessage(
        `Demo Auth Password Reset: If "${identifier}" is registered, reset instructions would be sent. For immediate demo access, use Citizen@123 or Admin@123.`
      );
    }
  };

  const fillDemoAccount = async (role: 'citizen' | 'admin') => {
    setError(null);
    setForgotMessage(null);
    const demoEmail =
      role === 'admin' ? 'admin@civicguide.demo' : 'citizen@civicguide.demo';
    const demoPass = role === 'admin' ? 'Admin@123' : 'Citizen@123';
    setIdentifier(demoEmail);
    setPassword(demoPass);
    setIsSubmitting(true);
    const res = await login(demoEmail, demoPass, rememberMe);
    setIsSubmitting(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
        {/* LEFT SIDE: Animated CivicGuide Journey (Desktop & Tablet) */}
        <div className="lg:col-span-6 bg-[#0F172A] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-300">
                <Compass className="w-4 h-4" aria-hidden="true" />
                <span>CivicGuide Navigation Journey</span>
              </div>
              {isTyping && (
                <span className="text-[11px] text-slate-400">
                  Motion softened while typing
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              From Knowing WHAT You Need to Knowing WHERE to Go
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every service search verifies the responsible department, exact
              building counter, required documents, and map route.
            </p>
          </div>

          {/* Animated Vertical Flowchart */}
          <CivicFlowchart variant="auth-vertical" isTyping={isTyping} />

          {/* Government Building + Map Pin Footer Card */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>5 Departments · 10 Offices · 17 Services</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Verified Counter Pins</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Card */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6 bg-white">
          <div className="space-y-6">
            {/* Logo & Welcome Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-[#0F172A] font-bold text-base"
                >
                  <span className="w-7 h-7 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center">
                    <Compass className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span>CivicGuide</span>
                </Link>
                <span className="text-xs text-slate-500 font-medium">
                  {authMode === 'demo-local'
                    ? 'Demo Auth (Local Storage)'
                    : 'Firebase Auth'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight pt-2">
                Welcome back
              </h1>
              <p className="text-sm text-slate-600">
                Sign in to continue your civic-service journey.
              </p>
            </div>

            {/* Quick Demo Account Selector Box */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2.5">
              <p className="text-xs font-semibold text-[#1E3A8A]">
                Instant Demo Accounts (Click to auto-fill credentials):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('citizen')}
                  className="px-3 py-2 rounded-lg bg-white border border-blue-200 hover:border-[#1E3A8A] text-left text-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-[#0F172A] block">
                      Demo Citizen
                    </span>
                    <span className="text-slate-500 font-mono-tabular text-[11px] truncate block">
                      citizen@civicguide.demo
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin')}
                  className="px-3 py-2 rounded-lg bg-white border border-blue-200 hover:border-[#1E3A8A] text-left text-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-[#0F172A] block">
                      Demo Admin
                    </span>
                    <span className="text-slate-500 font-mono-tabular text-[11px] truncate block">
                      admin@civicguide.demo
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Error or Reset Feedback */}
            {error && (
              <div
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {forgotMessage && (
              <div
                className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5"
                role="status"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{forgotMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label
                  htmlFor="login-identifier"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Email or Phone Number
                </label>
                <div className="relative flex items-center">
                  <Mail
                    className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      markTyping();
                    }}
                    placeholder="citizen@civicguide.demo or 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock
                    className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      markTyping();
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm text-[#0F172A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 p-1 rounded-md text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                  />
                  <span>Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] disabled:opacity-60 text-white font-semibold text-sm transition-colors cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Bottom Links: Create an account & Continue as Guest */}
          <div className="pt-4 border-t border-slate-200 space-y-3 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">
                New to CivicGuide?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-[#1E3A8A] hover:underline"
                >
                  Create an account
                </Link>
              </span>

              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="font-semibold text-slate-700 hover:text-[#1E3A8A] underline cursor-pointer"
              >
                Continue as Guest →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
