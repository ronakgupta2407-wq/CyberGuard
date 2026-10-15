import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import Dashboard from './pages/Dashboard';
import TCAnalyzer from './pages/TCAnalyzer';
import PhishingAnalyzer from './pages/PhishingAnalyzer';
import WebsiteChecker from './pages/WebsiteChecker';
import ComplianceChecker from './pages/ComplianceChecker';
import ScanHistory from './pages/ScanHistory';
import ScanDetail from './pages/ScanDetail';
import { ShieldCheck, Database, Cpu, FileCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedScan, setSelectedScan] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSelectScan = (scan) => {
    setSelectedScan(scan);
    setActiveTab('detail');
  };

  const handleScanCompleted = (scan) => {
    // When a scan completes in any module, we can either stay or open detail
    // Keeping user on current module page with results shown
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab === 'detail' ? 'history' : activeTab}
        setActiveTab={(tab) => {
          setSelectedScan(null);
          setActiveTab(tab);
        }}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            onSelectScan={handleSelectScan}
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

        {activeTab === 'detail' && selectedScan && (
          <ScanDetail
            scan={selectedScan}
            onBack={() => {
              setSelectedScan(null);
              setActiveTab('history');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">CyberGuard</span>
            <span>—</span>
            <span>Digital Security & Legal Risk Platform</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-neutral-400">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>SQLite Storage</span>
            <span>•</span>
            <span>ReportLab PDF Engine</span>
          </div>
        </div>
      </footer>

      {/* AI Key / Engine Settings Modal */}
      <ApiKeyModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
