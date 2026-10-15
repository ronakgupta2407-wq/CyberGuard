import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, Cpu, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
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
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">AI & Security Configuration</h2>
              <p className="text-xs text-slate-400">LLM Provider & Engine Settings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Engine Status banner */}
          <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Backend Core Engine:</span>
              <strong className="text-cyan-400 font-mono">
                {health?.status === 'healthy' ? 'Operational (FastAPI + SQLite)' : 'Offline / Checking...'}
              </strong>
            </div>
            <button
              onClick={loadHealth}
              className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Refresh engine status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Google Gemini API Key (Optional):
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              CyberGuard includes a built-in deterministic heuristic rule engine that operates completely offline. If you provide a Gemini API key, clauses and phishing threats will additionally be enriched using Gemini 2.5 Flash.
            </p>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Settings updated successfully!
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition-colors shadow-md shadow-purple-950"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
