import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Mail,
  Globe,
  Scale,
  History,
  BookOpen,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../services/firebase';
import ThemeToggle from './ThemeToggle';

export default function Navbar({
  activeTab,
  setActiveTab,
  onLogout,
  currentUser,
  theme,
  onThemeChange,
}) {
  const [authLoading, setAuthLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    scope: 'email profile',
    onSuccess: async (tokenResponse) => {
      setAuthLoading(true);
      try {
        const accessToken = tokenResponse.access_token;
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const profile = await profileRes.json();
        const user = {
          name: profile.name || profile.email?.split('@')[0] || 'User',
          email: profile.email || '',
          picture: profile.picture || null,
        };
        googleAuth.setUser(user);
        window.location.reload();
      } catch (e) {
        console.error('Profile fetch failed:', e);
      } finally {
        setAuthLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google login error:', err);
      setAuthLoading(false);
    },
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tc', label: 'Terms & Conditions', icon: FileText },
    { id: 'phishing', label: 'Email Phishing', icon: Mail },
    { id: 'website', label: 'Website Security', icon: Globe },
    { id: 'compliance', label: 'Compliance Audit', icon: Scale },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'about', label: 'About', icon: BookOpen },
  ];

  return (
    <header className="app-navbar sticky top-0 z-40">
      <div className="app-navbar__beam" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="app-navbar__inner flex items-center justify-between min-h-[76px] gap-4">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            aria-label="CyberGuard dashboard"
            className="navbar-brand flex shrink-0 items-center gap-3 text-left"
          >
            <div className="navbar-brand__mark relative flex h-12 w-12 shrink-0 items-center justify-center">
              <img
                src="/cyberguard-logo.png"
                alt=""
                className="relative h-full w-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="navbar-brand__name block font-sans text-lg font-black tracking-[-0.055em]">
                Cyber<span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">Guard</span>
              </span>
              <span className="navbar-brand__caption mt-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.17em]">
                <span className="navbar-status-dot" />
                Security workspace
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="app-navbar__desktop hidden xl:flex items-center gap-1 rounded-2xl p-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`navbar-link group/nav relative flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                    isActive
                      ? 'navbar-link--active'
                      : ''
                  }`}
                >
                  <Icon className="navbar-link__icon h-4 w-4" />
                  <span>{item.label}</span>
                  {isActive && <span className="navbar-link__indicator" />}
                </button>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="navbar-actions flex shrink-0 items-center gap-2">
            <ThemeToggle theme={theme} onChange={onThemeChange} />

            {currentUser ? (
              <div className="navbar-user flex items-center gap-2 rounded-xl px-2.5 py-2 sm:gap-2.5 sm:px-3">
                {currentUser.picture ? (
                  <img
                    src={currentUser.picture}
                    alt={currentUser.name}
                    className="h-7 w-7 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="navbar-user__avatar flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                    {currentUser.name?.[0] || 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <span className="navbar-user__name block max-w-[120px] truncate text-xs font-semibold leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="navbar-user__email block max-w-[150px] truncate text-[10px]">
                    {currentUser.email || 'Signed in'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="navbar-logout ml-0.5 rounded-lg p-1.5"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="navbar-guest hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium">
                  <span className="navbar-status-dot" />
                  Guest
                </span>
                <button
                  onClick={() => {
                    setAuthLoading(true);
                    googleLogin();
                  }}
                  disabled={authLoading}
                  className="navbar-signin flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-60"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>{authLoading ? 'Signing in...' : 'Sign in'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav aria-label="Main navigation" className="app-navbar__mobile xl:hidden -mx-1 flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`navbar-mobile-link flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-medium ${
                  isActive
                    ? 'navbar-mobile-link--active'
                    : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
