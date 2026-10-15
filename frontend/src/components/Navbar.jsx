import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  Mail,
  Globe,
  Scale,
  LayoutDashboard,
  History,
  Key,
  LogIn,
  LogOut,
  User,
  Activity
} from 'lucide-react';
import { loginWithGoogle, logoutUser, getSavedUser } from '../services/firebase';

export default function Navbar({ activeTab, setActiveTab, onOpenSettings }) {
  const [currentUser, setCurrentUser] = useState(getSavedUser());
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    setCurrentUser(getSavedUser());
  }, []);

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      const user = await loginWithGoogle();
      setCurrentUser(user);
    } catch (e) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tc', label: 'T&C Analyzer', icon: FileText, badge: '01' },
    { id: 'phishing', label: 'Phishing', icon: Mail, badge: '02' },
    { id: 'website', label: 'Website Security', icon: Globe, badge: '03' },
    { id: 'compliance', label: 'Compliance', icon: Scale, badge: '04' },
    { id: 'history', label: 'Reports & History', icon: History, badge: '06' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-950/50 group-hover:glow-cyan transition-all">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-wider text-slate-100 font-mono">
                  CYBER<span className="text-cyan-400">GUARD</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans tracking-tight -mt-0.5">
                AI Digital, Legal & Privacy Risk Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800 shadow-sm shadow-cyan-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5">
            {/* API Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/80 transition-colors"
              title="Configure AI API Key / Backend Engine"
            >
              <Key className="w-4 h-4 text-purple-400" />
            </button>

            {/* Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <div className="w-5 h-5 rounded-full bg-cyan-900/80 border border-cyan-700 flex items-center justify-center text-[10px] text-cyan-300 font-bold">
                  {currentUser.name ? currentUser.name[0] : 'U'}
                </div>
                <span className="text-xs text-slate-300 max-w-[100px] truncate hidden sm:inline">
                  {currentUser.name || 'Analyst'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 transition-colors p-0.5"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={authLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>{authLoading ? 'Connecting...' : 'Sign In'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-400 font-semibold border border-cyan-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
