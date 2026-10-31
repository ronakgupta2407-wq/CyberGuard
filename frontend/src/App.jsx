import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, googleAuth } from './services/firebase';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TCAnalyzer from './pages/TCAnalyzer';
import PhishingAnalyzer from './pages/PhishingAnalyzer';
import WebsiteChecker from './pages/WebsiteChecker';
import ComplianceChecker from './pages/ComplianceChecker';
import ScanHistory from './pages/ScanHistory';
import ScanDetail from './pages/ScanDetail';
import About from './pages/About';
import StartupLoader from './components/StartupLoader';
import DeveloperCards from './components/DeveloperCards';

export default function App() {
  const [showStartupLoader, setShowStartupLoader] = useState(true);
  const [currentUser, setCurrentUser] = useState(googleAuth.getUser());
  const [theme, setTheme] = useState(
    () => localStorage.getItem('cyberguard_theme') === 'dark' ? 'dark' : 'light',
  );
  const [guestMode, setGuestMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedScan, setSelectedScan] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastScan, setLastScan] = useState(null);

  useEffect(() => {
    const user = googleAuth.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleSelectScan = (scan) => {
    setSelectedScan(scan);
    setActiveTab('detail');
  };

  const handleScanCompleted = (scan) => {
    setLastScan(scan);
  };

  const handleLogout = () => {
    googleAuth.signOut();
    setCurrentUser(null);
    setGuestMode(false);
    setActiveTab('dashboard');
  };

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem('cyberguard_theme', nextTheme);
  };

  const isAccessAllowed = !!currentUser || guestMode;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {showStartupLoader && <StartupLoader onComplete={() => setShowStartupLoader(false)} />}
      {!isAccessAllowed ? (
        <LoginPage
          onLoginSuccess={(user) => setCurrentUser(user)}
          onContinueGuest={() => setGuestMode(true)}
          theme={theme}
          onThemeChange={handleThemeChange}
          developers={<DeveloperCards />}
        />
      ) : (
        <div className={`app-workspace theme-${theme} relative isolate min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200 xl:pl-64`}>
          <div className="site-ambient" aria-hidden="true" />
          <Navbar
            activeTab={activeTab === 'detail' ? 'history' : activeTab}
            setActiveTab={(tab) => {
              setSelectedScan(null);
              setActiveTab(tab);
            }}
            onOpenSettings={() => setSettingsOpen(true)}
            onLogout={handleLogout}
            currentUser={currentUser}
            theme={theme}
            onThemeChange={handleThemeChange}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div key={activeTab} className="page-enter">
            {activeTab === 'dashboard' && (
              <Dashboard
                setActiveTab={setActiveTab}
                onSelectScan={handleSelectScan}
                lastScan={lastScan}
                onReset={() => setLastScan(null)}
              />
            )}
            {activeTab === 'tc' && (
              <TCAnalyzer onScanCompleted={handleScanCompleted} />
            )}
            {activeTab === 'phishing' && (
              <PhishingAnalyzer onScanCompleted={handleScanCompleted} />
            )}
            {activeTab === 'website' && (
              <WebsiteChecker onScanCompleted={handleScanCompleted} />
            )}
            {activeTab === 'compliance' && (
              <ComplianceChecker onScanCompleted={handleScanCompleted} />
            )}
            {activeTab === 'history' && (
              <ScanHistory onSelectScan={handleSelectScan} />
            )}
            {activeTab === 'about' && <About setActiveTab={setActiveTab} />}
            {activeTab === 'detail' && selectedScan && (
              <ScanDetail
                scan={selectedScan}
                onBack={() => {
                  setSelectedScan(null);
                  setActiveTab('history');
                }}
              />
            )}
            </div>
          </main>

          <footer className="border-t border-slate-800/70 bg-slate-950/70 py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
              CyberGuard <span className="mx-1.5 text-slate-700">·</span> Digital security and privacy tools
            </div>
          </footer>

          <ApiKeyModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
      )}
    </GoogleOAuthProvider>
  );
}
