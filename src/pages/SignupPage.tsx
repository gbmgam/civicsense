import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  Building2,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CivicFlowchart } from '../components/CivicFlowchart';

export const SignupPage: React.FC = () => {
  const { signup, continueAsGuest, authMode } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setIsSubmitting(true);

    const res = await signup(name, email, phone, password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Could not create account. Please check your inputs.');
      return;
    }

    navigate('/dashboard');
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    navigate('/services');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
        {/* LEFT SIDE: Animated CivicGuide Journey */}
        <div className="lg:col-span-6 bg-[#0F172A] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-300">
                <Compass className="w-4 h-4" aria-hidden="true" />
                <span>CivicGuide Citizen Account</span>
              </div>
              {isTyping && (
                <span className="text-[11px] text-slate-400">
                  Motion softened while typing
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Save Checklists, Office Counters, and Recent Searches
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Guests can search and view all services freely. Creating an
              account lets you bookmark frequent services and keep counter notes
              ready for your visit.
            </p>
          </div>

          <CivicFlowchart variant="auth-vertical" isTyping={isTyping} />

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Right Service. Right Office.</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Right Place.</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Signup Card */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6 bg-white">
          <div className="space-y-6">
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
                Create your account
              </h1>
              <p className="text-sm text-slate-600">
                Save government services, checklists, and search history for
                your upcoming visits.
              </p>
            </div>

            {error && (
              <div
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Full Name *
                </label>
                <div className="relative flex items-center">
                  <User
                    className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      markTyping();
                    }}
                    placeholder="e.g. Priya Nair"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <Mail
                    className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      markTyping();
                    }}
                    placeholder="priya@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="signup-phone"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Phone Number (Optional)
                </label>
                <div className="relative flex items-center">
                  <Phone
                    className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      markTyping();
                    }}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password (minimum 6 characters) *
                </label>
                <div className="relative flex items-center">
                  <Lock
                    className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      markTyping();
                    }}
                    placeholder="Create a password"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] disabled:opacity-60 text-white font-semibold text-sm transition-colors cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#1E3A8A] hover:underline"
              >
                Sign In
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
  );
};
