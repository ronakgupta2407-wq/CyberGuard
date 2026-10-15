import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, RefreshCw, Settings } from 'lucide-react';
import { api } from '../services/api';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [geminiKey, setGeminiKey] = useState('');
  const [health, setHealth] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(localStorage.getItem('cyberguard_gemini_key') || '');
      loadHealth();
    }
  }, [isOpen]);

  const loadHealth = async () => {
    try {
      const data = await api.checkHealth();
      setHealth(data);
    } catch (e) {
      setHealth({ status: 'offline', error: e.message });
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (geminiKey.trim()) {
      localStorage.setItem('cyberguard_gemini_key', geminiKey.trim());
    } else {
      localStorage.removeItem('cyberguard_gemini_key');
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-white">Platform Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Engine Status banner */}
          <div className="bg-neutral-950 rounded p-3 border border-neutral-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-400 block text-[11px]">Backend Server</span>
              <strong className="text-neutral-200 font-mono font-medium">
                {health?.status === 'healthy' ? 'Operational (FastAPI + SQLite)' : 'Offline / Checking...'}
              </strong>
            </div>
            <button
              onClick={loadHealth}
              className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Google Gemini API Key (Optional)
            </label>
            <p className="text-[11px] text-neutral-400 mb-2 leading-relaxed">
              CyberGuard runs offline using rule engines and regex pattern extractors. Adding an API key will enable supplemental clause explanations.
            </p>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 font-mono"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2 bg-emerald-950/40 border border-emerald-800/60 rounded text-xs text-emerald-300 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Settings updated.
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
