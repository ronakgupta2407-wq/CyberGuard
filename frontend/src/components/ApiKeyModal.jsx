import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, RefreshCw, Settings, Cpu, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [groqKey, setGroqKey] = useState('');
  const [health, setHealth] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGroqKey(localStorage.getItem('cyberguard_groq_key') || '');
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
    if (groqKey.trim()) {
      localStorage.setItem('cyberguard_groq_key', groqKey.trim());
    } else {
      localStorage.removeItem('cyberguard_groq_key');
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/70 rounded-xl w-full max-w-md shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-mono">SOC_PLATFORM_CONFIG</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Status cards */}
          <div className="grid grid-cols-1 gap-2 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">AI_ENGINE</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300 font-bold">
                  {health?.ai_provider === 'groq' ? 'Groq Llama-3.1' : 'Heuristic/Active'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono font-medium text-slate-300">
                Groq API Key (Override)
              </label>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/80">
                Llama-3.1-8B-Instant
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed font-sans">
              CyberGuard automatically uses the backend Groq key (<code className="text-cyan-300">gsk_...</code>). You can also provide a client-side override key below.
            </p>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="password"
                placeholder="gsk_..."
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/60 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded text-xs text-emerald-300 flex items-center gap-1.5 font-mono">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              CONFIG_UPDATED_SUCCESSFULLY
            </div>
          )}

          <div className="pt-2 flex justify-between items-center">
            <button
              onClick={loadHealth}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Ping Server</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-xs font-mono font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-xs font-mono font-bold transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
