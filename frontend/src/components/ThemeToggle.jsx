import React from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onChange }) {
  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1"
    >
      <button
        type="button"
        aria-label="Switch to light mode"
        aria-pressed={theme === 'light'}
        onClick={() => onChange('light')}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
          theme === 'light'
            ? 'bg-slate-200 text-slate-800 shadow-sm'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
        }`}
      >
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">Light</span>
      </button>
      <button
        type="button"
        aria-label="Switch to dark mode"
        aria-pressed={theme === 'dark'}
        onClick={() => onChange('dark')}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
          theme === 'dark'
            ? 'bg-slate-700 text-white shadow-sm'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
        }`}
      >
        <Moon className="h-4 w-4" />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}
