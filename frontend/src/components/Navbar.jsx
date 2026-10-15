import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  Mail,
  Globe,
  Scale,
  LayoutGrid,
  Clock,
  Settings,
  LogIn,
  LogOut,
  User
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
    { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
    { id: 'tc', label: 'Terms & Policies', icon: FileText },
    { id: 'phishing', label: 'Email Phishing', icon: Mail },
    { id: 'website', label: 'Website Security', icon: Globe },
    { id: 'compliance', label: 'Compliance', icon: Scale },
    { id: 'history', label: 'Audit Log', icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Product Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4 fill-current" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">
                CyberGuard
              </span>
              <span className="text-[11px] text-neutral-400 hidden sm:inline">
                Risk & Security
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800 transition-colors"
              title="Settings & Engine Info"
            >
              <Settings className="w-4 h-4" />
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 bg-neutral-800/80 border border-neutral-700/80 rounded-md px-2.5 py-1">
                <div className="w-4 h-4 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px] font-semibold">
                  {currentUser.name ? currentUser.name[0] : 'U'}
                </div>
                <span className="text-xs text-neutral-300 max-w-[110px] truncate hidden sm:inline">
                  {currentUser.name || 'Analyst'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-neutral-400 hover:text-red-400 transition-colors ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={authLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-neutral-400" />
                <span>{authLoading ? 'Connecting...' : 'Sign In'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center overflow-x-auto py-1.5 border-t border-neutral-800 no-scrollbar gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
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
