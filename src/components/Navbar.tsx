import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Bookmark,
  LayoutDashboard,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isGuest, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const publicLinks = [
    { label: 'Home', to: '/' },
    { label: 'Services', to: '/services' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'About', to: '/how-it-works#about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single clean Brand lockup */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[#0F172A] font-bold text-lg tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] rounded-md shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4.5 h-4.5" aria-hidden="true" />
          </span>
          <span>CivicGuide</span>
        </Link>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {publicLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                isActive(item.to) && !item.to.includes('#')
                  ? 'border-[#1E3A8A] text-[#0F172A] font-semibold'
                  : 'border-transparent hover:text-[#0F172A] hover:border-slate-300'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {user && (
            <>
              <Link
                to="/dashboard"
                className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                  isActive('/dashboard') || isActive('/assistant')
                    ? 'border-[#1E3A8A] text-[#0F172A] font-semibold'
                    : 'border-transparent hover:text-[#0F172A] hover:border-slate-300'
                }`}
              >
                Office Finder
              </Link>
              <Link
                to="/saved"
                className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                  isActive('/saved')
                    ? 'border-[#1E3A8A] text-[#0F172A] font-semibold'
                    : 'border-transparent hover:text-[#0F172A] hover:border-slate-300'
                }`}
              >
                Saved
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`py-1 transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
                    isActive('/admin')
                      ? 'border-[#1E3A8A] text-[#1E3A8A] font-semibold'
                      : 'border-transparent text-slate-700 hover:text-[#1E3A8A]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  isActive('/profile')
                    ? 'bg-slate-100 text-[#0F172A]'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <UserIcon className="w-4 h-4 text-[#1E3A8A]" aria-hidden="true" />
                <span className="max-w-[140px] truncate">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <>
              {isGuest && (
                <span className="text-xs text-slate-500 mr-1 whitespace-nowrap">
                  Guest Mode
                </span>
              )}
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-[#0F172A] hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#1E3A8A] text-white hover:bg-[#172E6E] transition-colors shadow-xs whitespace-nowrap"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            {publicLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(item.to) && !item.to.includes('#')
                    ? 'bg-blue-50 text-[#1E3A8A] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {user && (
              <>
                <div className="my-1 border-t border-slate-100" />
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Saved Services</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Profile ({user.name})</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-semibold text-[#1E3A8A] bg-blue-50/60 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Portal</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 rounded-lg text-sm font-semibold text-center text-slate-700 border border-slate-300 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 rounded-lg text-sm font-semibold text-center bg-[#1E3A8A] text-white hover:bg-[#172E6E]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
